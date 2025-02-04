import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { type AdapterAccount } from "next-auth/adapters";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { accounts, users } from "~/server/db/schema";

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
};

export const userRouter = createTRPCRouter({
  createUser: publicProcedure
    .input(userRouterValidationSchema.createUser)
    .mutation(async ({ ctx, input }) => {
      const { name, email, password, bio } = input;

      const passwordHash: string = (await Bun.password.hash(
        password,
      )) as string;

      // Create a new user
      const user = await ctx.db
        .insert(users)
        .values({
          id: randomUUID(),
          name,
          email,
          passwordHash,
          bio,
        })
        .returning();

      const newUser = user[0];

      if (!newUser) return;

      // Optional: create an account entry if using OAuth provider
      await ctx.db.insert(accounts).values({
        userId: newUser.id,
        type: "email", // or "oauth" if it’s an OAuth account like Google
        provider: "credentials", // could be "google" for Google-authenticated users
        providerAccountId: newUser.id,
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
});
