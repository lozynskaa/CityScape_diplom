import { eq } from "drizzle-orm";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import { db } from "~/server/db";
import {
  accounts,
  users,
  verificationTokens,
  type User as UserDB,
} from "~/server/db/schema";
import { type JWT } from "@auth/core/jwt";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    //add jwt type here frmo next auth, can't find it
    token: JWT;
    user: {
      id: string;

      // ...other properties
      // role: UserRole;
    } & UserDB;
  }

  // interface User extends UserDB {}
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
  pages: {
    signIn: "sign-in",
    error: "error",
    verifyRequest: "verify-request",
    newUser: "sign-up",
  },
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as Record<string, string>;
        if (!email || !password) return null;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          return null;
        }

        // Handle credential-based sign-in

        const isPasswordValid = await Bun.password.verify(
          password,
          user.passwordHash,
        );

        if (!isPasswordValid) {
          return null;
        }

        // Generate tokens or session as needed
        return user;
      },
    }),
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ],
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    verificationTokensTable: verificationTokens,
  }),
  callbacks: {
    session: async ({ token, session, user }) => {
      const [dbUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, token.sub!))
        .limit(1);
      return {
        ...session,
        token,
        user: {
          ...dbUser,
        },
      };
    },
  },
  session: {
    strategy: "jwt",
  },
} satisfies NextAuthConfig;
