import { eq } from "drizzle-orm";
import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts, type Post } from "~/server/db/post.schema";

const postRouterValidationSchema = {
  createPost: z.object({
    companyId: z.string(),
    title: z.string().min(1),
    content: z.string().min(1),
    imageUrls: z.string().array().optional(),
  }),
  updatePost: z.object({
    id: z.string(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    imageUrls: z.string().array().optional(),
  }),
  getCompanyPosts: z.object({
    id: z.string(),
  }),
};

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(postRouterValidationSchema.createPost)
    .mutation(async ({ input, ctx }) => {
      const { companyId, title, content, imageUrls } = input;
      const userId = ctx.session.user.id;
      const [post] = await ctx.db
        .insert(posts)
        .values({
          userId,
          companyId,
          title,
          content,
          imageUrls,
        })
        .returning();
      return post;
    }),

  updatePost: protectedProcedure
    .input(postRouterValidationSchema.updatePost)
    .mutation(async ({ input, ctx }) => {
      const { id, title, content, imageUrls } = input;
      const [post] = await ctx.db
        .update(posts)
        .set({
          title,
          content,
          imageUrls,
        })
        .where(eq(posts.id, id))
        .returning();
      return post;
    }),

  getCompanyPosts: publicProcedure
    .input(postRouterValidationSchema.getCompanyPosts)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const companyPosts = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.companyId, id));
      return companyPosts;
    }),

  getPost: publicProcedure
    .input(postRouterValidationSchema.getCompanyPosts)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const [post] = await ctx.db.select().from(posts).where(eq(posts.id, id));
      return post;
    }),

  deletePost: protectedProcedure
    .input(postRouterValidationSchema.getCompanyPosts)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.db.delete(posts).where(eq(posts.id, id));
    }),
});
