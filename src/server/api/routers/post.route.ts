import {
  and,
  eq,
  gte,
  like,
  lt,
  lte,
  or,
  desc,
  type SQLWrapper,
} from "drizzle-orm";
import { z } from "zod";
import { createImageURL } from "~/lib/createImageURL";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/post.schema";

const postRouterValidationSchema = {
  createPost: z.object({
    companyId: z.string(),
    title: z.string().min(1),
    content: z.string().min(1),
    images: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .array()
      .optional(),
  }),
  updatePost: z.object({
    id: z.string(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    images: z
      .object({
        file: z.string(), // Bun's File object
        fileName: z.string(),
      })
      .array()
      .optional(),
  }),
  getCompanyPosts: z.object({
    id: z.string(),
  }),
  getFilteredPosts: z.object({
    companyId: z.string(),
    search: z.string().optional(),
    cursor: z.string().nullish(),
    limit: z.number().min(1).max(100).default(10),
    postDate: z.object({
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }),
  }),
};

export const postRouter = createTRPCRouter({
  createPost: protectedProcedure
    .input(postRouterValidationSchema.createPost)
    .mutation(async ({ input, ctx }) => {
      const { companyId, title, content, images } = input;
      const userId = ctx.session.user.id;

      let imageUrls: string[] = [];

      if (images) {
        imageUrls = await Promise.all(
          images?.map((imageFile) => {
            const uuid = crypto.randomUUID();
            return createImageURL(
              `post-image-${uuid}-${imageFile.fileName}`,
              imageFile.file,
            );
          }),
        );
      }
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
      const { id, title, content, images } = input;

      let imageUrls: string[] = [];

      if (images) {
        imageUrls = await Promise.all(
          images?.map((imageFile) => {
            const uuid = crypto.randomUUID();
            return createImageURL(
              `post-image-${uuid}-${imageFile.fileName}`,
              imageFile.file,
            );
          }),
        );
      }

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

  getPrivatePost: protectedProcedure
    .input(postRouterValidationSchema.getCompanyPosts)
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const userId = ctx.session.user.id;
      const [post] = await ctx.db
        .select()
        .from(posts)
        .where(and(eq(posts.id, id), eq(posts.userId, userId)));
      return post;
    }),

  deletePost: protectedProcedure
    .input(postRouterValidationSchema.getCompanyPosts)
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      await ctx.db.delete(posts).where(eq(posts.id, id));
    }),

  getFilteredPosts: publicProcedure
    .input(postRouterValidationSchema.getFilteredPosts)
    .query(async ({ input, ctx }) => {
      const { companyId, search, cursor, limit, postDate } = input;
      const { startDate, endDate } = postDate;

      const whereStatement: Array<SQLWrapper | undefined> = [];

      if (search) {
        whereStatement.push(
          or(
            like(posts.title, `%${search}%`),
            like(posts.content, `%${search}%`),
          ),
        );
      }
      if (startDate) {
        whereStatement.push(gte(posts.createdAt, startDate));
      }
      if (endDate) {
        whereStatement.push(lte(posts.createdAt, endDate));
      }
      if (companyId) {
        whereStatement.push(eq(posts.companyId, companyId));
      }

      // Apply the cursor (createdAt) for pagination
      if (cursor) {
        whereStatement.push(lt(posts.createdAt, new Date(cursor))); // Fetch older posts
      }

      // Query the database
      const filteredPosts = await ctx.db
        .select()
        .from(posts)
        .where(and(...whereStatement))
        .orderBy(desc(posts.createdAt)) // Newest posts first
        .limit(limit);

      // Determine the next cursor
      const nextCursor =
        filteredPosts.length > 0
          ? filteredPosts[filteredPosts.length - 1]?.createdAt?.toISOString()
          : null;

      return {
        posts: filteredPosts,
        nextCursor,
      };
    }),
});
