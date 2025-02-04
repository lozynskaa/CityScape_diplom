import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import {
  createCallerFactory,
  createTRPCContext,
  createTRPCRouter,
} from "./root";
import { companyRouter } from "./routers/company.route";
import { userRouter } from "./routers/user.route";
import { cache } from "react";
import { createQueryClient } from "~/trpc/query-client";
import { eventRouter } from "./routers/event.route";

export const appRouter = createTRPCRouter({
  user: userRouter,
  company: companyRouter,
  event: eventRouter,
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
