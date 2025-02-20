import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    OAUTH_CLIENT_ID: z.string(),
    OAUTH_CLIENT_SECRET: z.string(),
    DATABASE_URL: z.string().url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    CHECKOUT_PRIVATE_KEY: z.string(),
    CHECKOUT_CHANNEL_ID: z.string(),
    CHECKOUT_AUTHORIZATION: z.string(),
    CHECKOUT_SIGNATURE_SECRET: z.string(),
    NEXTAUTH_URL: z.string(),
    NEXTAUTH_SECRET: z.string(),
    AUTH_TRUST_HOST: z.string(),
    HERE_APP_ID: z.string(),
    HERE_API_KEY: z.string(),
    SENDGRID_API_KEY: z.string(),
    SENDGRID_DEFAULT_SENDER: z.string(),
    VERCEL_URL: z.string().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_HERE_API_KEY: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    OAUTH_CLIENT_ID: process.env.OAUTH_CLIENT_ID,
    OAUTH_CLIENT_SECRET: process.env.OAUTH_CLIENT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    CHECKOUT_PRIVATE_KEY: process.env.CHECKOUT_PRIVATE_KEY,
    CHECKOUT_CHANNEL_ID: process.env.CHECKOUT_CHANNEL_ID,
    CHECKOUT_AUTHORIZATION: process.env.CHECKOUT_AUTHORIZATION,
    CHECKOUT_SIGNATURE_SECRET: process.env.CHECKOUT_SIGNATURE_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    HERE_APP_ID: process.env.HERE_APP_ID,
    HERE_API_KEY: process.env.HERE_API_KEY,
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_DEFAULT_SENDER: process.env.SENDGRID_DEFAULT_SENDER,
    VERCEL_URL: process.env.VERCEL_URL,
    NEXT_PUBLIC_HERE_API_KEY: process.env.NEXT_PUBLIC_HERE_API_KEY,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
