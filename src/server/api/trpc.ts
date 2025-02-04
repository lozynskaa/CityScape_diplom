/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { accounts, companies, jars, users } from "../db/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { cache } from "react";
import { type AdapterAccount } from "next-auth/adapters";
import { createQueryClient } from "~/trpc/query-client";
import { createHydrationHelpers } from "@trpc/react-query/rsc";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth();

  return {
    db,
    session,
    ...opts,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;
/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

/**
 * Protected (authenticated) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use this. It verifies
 * the session is valid and guarantees `ctx.session.user` is not null.
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(timingMiddleware)
  .use(({ ctx, next }) => {
    if (
      !ctx.session ||
      !ctx.session.user ||
      new Date(ctx.session.expires).valueOf() <= Date.now()
    ) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }
    return next({
      ctx: {
        // infers the `session` as non-nullable
        session: { ...ctx.session },
      },
    });
  });

const companyRouterValidationSchema = {
  createCompany: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    category: z.string(),
    description: z.string(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    image: z.string().url().optional(),
  }),
  createCompanyJar: z.object({
    name: z.string().min(1),
    description: z.string(),
    purpose: z.string(),
    image: z.string().url().optional(),
    goalAmount: z.number().min(0),
    companyId: z.string(),
    currency: z.string(),
  }),
  completeOnboarding: z.object({
    name: z.string().min(1),
    companyEmail: z.string().email(),
    category: z.string(),
    description: z.string().optional(),
    companyImage: z.string().url().optional(),
    location: z.string().optional(),
    website: z.string().url().optional(),
    jarName: z.string().min(1),
    jarDescription: z.string().optional(),
    jarPurpose: z.string(),
    jarImage: z.string().url().optional(),
    goalAmount: z.number().min(0),
    currency: z.string(),
  }),
};

export const companyRouter = createTRPCRouter({
  createCompany: protectedProcedure
    .input(companyRouterValidationSchema.createCompany)
    .mutation(async ({ input, ctx }) => {
      const { name, companyEmail, description, location, website, image } =
        input;

      if (!ctx.session.user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [existingUser] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, ctx.session.user.email));

      if (!existingUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: existingUser?.id,
          name,
          description,
          location,
          website,
          email: companyEmail,
          imageUrl: image ?? null,
        })
        .returning();

      return company;
    }),

  createCompanyJar: protectedProcedure
    .input(companyRouterValidationSchema.createCompanyJar)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        description,
        purpose,
        image,
        goalAmount,
        companyId,
        currency,
      } = input;

      const [jar] = await ctx.db
        .insert(jars)
        .values({
          companyId,
          name,
          description,
          purpose,
          imageUrl: image ?? null,
          goalAmount: `${goalAmount}`,
          currency,
        })
        .returning();

      return jar;
    }),

  completeOnboarding: protectedProcedure
    .input(companyRouterValidationSchema.completeOnboarding)
    .mutation(async ({ input, ctx }) => {
      const {
        name,
        companyEmail,
        description,
        companyImage,
        location,
        website,
        jarName,
        jarDescription,
        jarPurpose,
        jarImage,
        goalAmount,
        currency,
      } = input;

      if (!ctx.session.user.email) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [existingUser] = await ctx.db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, ctx.session.user.email));

      if (!existingUser) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const [company] = await ctx.db
        .insert(companies)
        .values({
          founderId: existingUser.id,
          name,
          description,
          location,
          website,
          email: companyEmail,
          imageUrl: companyImage ?? null,
        })
        .returning();

      if (!company) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Company not found",
        });
      }

      const [jar] = await ctx.db
        .insert(jars)
        .values({
          companyId: company.id,
          name: jarName,
          description: jarDescription,
          purpose: jarPurpose,
          imageUrl: jarImage ?? null,
          goalAmount: `${goalAmount}`,
          currency,
        })
        .returning();

      if (!jar) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Jar not found",
        });
      }

      await ctx.db
        .update(users)
        .set({ onboardingCompleted: true })
        .where(eq(users.id, ctx.session.user.id));

      return { company, jar };
    }),
});

const userRouterValidationSchema = {
  createUser: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string(),
    bio: z.string(),
  }),
  updateUser: z.object({
    id: z.string(),
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    bio: z.string().optional(),
  }),
  getUser: z.object({
    id: z.string(),
  }),
  connectGoogleToUser: z.object({
    userId: z.string(),
    providerAccountId: z.string(),
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
    token_type: z.string(),
    scope: z.string(),
    id_token: z.string(),
    session_state: z.string(),
  }),
  signIn: z.object({
    email: z.string().email(),
    password: z.string().optional(),
    provider: z.enum(["credentials", "google"]).optional(),
  }),
};

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(userRouterValidationSchema.createUser)
    .mutation(async ({ ctx, input }) => {
      const { name, email, password, bio } = input;

      const passwordHash: string = await Bun.password.hash(password);

      // Create a new user
      const [user] = await ctx.db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
          bio,
        })
        .returning();

      if (!user) return;

      // Optional: create an account entry if using OAuth provider
      await ctx.db.insert(accounts).values({
        userId: user.id,
        type: "email", // or "oauth" if it’s an OAuth account like Google
        provider: "credentials", // could be "google" for Google-authenticated users
        providerAccountId: user.id,
        token_type: null, // Only used if handling tokens manually
      });

      // If this is part of a login, NextAuth should handle token generation.
      return user;
    }),

  updateUser: protectedProcedure
    .input(userRouterValidationSchema.updateUser)
    .mutation(async ({ ctx, input }) => {
      const updatedUser = await ctx.db
        .update(users)
        .set(input)
        .where(eq(users.id, input.id))
        .returning();
      return updatedUser[0];
    }),

  getUser: protectedProcedure
    .input(userRouterValidationSchema.getUser)
    .query(async ({ ctx, input }) => {
      const user = await ctx.db
        .select()
        .from(users)
        .where(eq(users.id, input.id))
        .limit(1);
      return user[0];
    }),

  deleteUser: protectedProcedure
    .input(userRouterValidationSchema.getUser)
    .mutation(async ({ ctx, input }) => {
      ctx.db.delete(users).where(eq(users.id, input.id));
    }),

  connectGoogleToUser: protectedProcedure
    .input(userRouterValidationSchema.connectGoogleToUser)
    .mutation(async ({ ctx, input }) => {
      const googleAccount: AdapterAccount = {
        userId: input.userId,
        type: "oauth",
        provider: "google",
        providerAccountId: input.providerAccountId,
        refresh_token: input.refresh_token,
        access_token: input.access_token,
        expires_at: input.expires_at,
        token_type:
          input.token_type.toLowerCase() as AdapterAccount["token_type"],
        scope: input.scope,
        id_token: input.id_token,
        session_state: input.session_state,
      };

      await ctx.db.insert(accounts).values(googleAccount).onConflictDoNothing();
    }),

  signIn: publicProcedure
    .input(userRouterValidationSchema.signIn)
    .mutation(async ({ input, ctx }) => {
      const { email, password, provider = "credentials" } = input;

      // Check if the user exists
      const [user] = await ctx.db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }

      // Handle credential-based sign-in
      if (provider === "credentials") {
        if (!password) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Password is required for credential-based sign-in",
          });
        }

        const isPasswordValid = await Bun.password.verify(
          password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Generate tokens or session as needed
        return user;
      }

      // Handle OAuth sign-in (e.g., Google)
      //   if (provider === "google") {
      //     const googleUser = await OAuthProvider.getGoogleUser(email); // Custom Google OAuth logic

      //     if (!googleUser) {
      //       throw new TRPCError({ code: "UNAUTHORIZED", message: "Google sign-in failed" });
      //     }

      //     // Check for linked account
      //     const account = await ctx.db
      //       .select()
      //       .from(accounts)
      //       .where(and(
      //         eq(accounts.provider, "google"),
      //         eq(accounts.userId, user.id)
      //       ))

      //     if (!account) {
      //       // Link Google account if not linked
      //       await ctx.db.insert(accounts).values({
      //         userId: user.id,
      //         type: "oauth",
      //         provider: "google",
      //         providerAccountId: googleUser.id,
      //         token_type: "Bearer",
      //       });
      //     }

      //     // Return user and session tokens if needed
      //     return user;
      //   }
    }),
});
export const appRouter = createTRPCRouter({
  user: userRouter,
  company: companyRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

export const { trpc: api, HydrateClient } = createHydrationHelpers<AppRouter>(
  caller,
  getQueryClient,
);
