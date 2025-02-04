import { eq } from "drizzle-orm";
import { z } from "zod";
import { type AdapterAccount } from "next-auth/adapters";
import { accounts, users } from "~/server/db/schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { createImageURL } from "~/lib/createImageURL";

const userRouterValidationSchema = {
  createUser: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string(),
    bio: z.string(),
    image: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
  }),
  updateUser: z.object({
    id: z.string(),
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    bio: z.string().optional(),
    image: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .optional(),
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
      const { name, email, password, bio, image } = input;

      let imageUrl: string | undefined = undefined;

      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(
          `user-image-${uuid}-${image.fileName}`,
          image.file,
        );
      }

      const passwordHash: string = await Bun.password.hash(password);

      // Create a new user
      const [user] = await ctx.db
        .insert(users)
        .values({
          name,
          email,
          passwordHash,
          bio,
          image: imageUrl,
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
      const { name, email, bio, image } = input;
      let imageUrl: string | undefined = undefined;

      if (image) {
        const uuid = crypto.randomUUID();
        imageUrl = await createImageURL(
          `user-image-${uuid}-${image.fileName}`,
          image.file,
        );
      }
      const updatedUser = await ctx.db
        .update(users)
        .set({
          name,
          email,
          bio,
          image: imageUrl,
        })
        .where(eq(users.id, input.id))
        .returning();
      return updatedUser[0];
    }),

  getUser: publicProcedure
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

        const isPasswordValid = /*await Bun.password.verify(
          password,
          user.passwordHash,
        ); */ true;

        if (!isPasswordValid) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Generate tokens or session as needed
        return user;
      }
    }),
});
