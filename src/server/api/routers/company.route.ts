// import { eq } from "drizzle-orm";
// import { z } from "zod";

// import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
// import { companies, jars, users } from "~/server/db/schema";
// import { TRPCError } from "@trpc/server";

// const companyRouterValidationSchema = {
//   createCompany: z.object({
//     name: z.string().min(1),
//     companyEmail: z.string().email(),
//     category: z.string(),
//     description: z.string(),
//     location: z.string().optional(),
//     website: z.string().url().optional(),
//     image: z.string().url().optional(),
//   }),
//   createCompanyJar: z.object({
//     name: z.string().min(1),
//     description: z.string(),
//     purpose: z.string(),
//     image: z.string().url().optional(),
//     goalAmount: z.number().min(0),
//     companyId: z.string(),
//     currency: z.string(),
//   }),
//   completeOnboarding: z.object({
//     name: z.string().min(1),
//     companyEmail: z.string().email(),
//     category: z.string(),
//     description: z.string().optional(),
//     companyImage: z.string().url().optional(),
//     location: z.string().optional(),
//     website: z.string().url().optional(),
//     jarName: z.string().min(1),
//     jarDescription: z.string().optional(),
//     jarPurpose: z.string(),
//     jarImage: z.string().url().optional(),
//     goalAmount: z.number().min(0),
//     currency: z.string(),
//   }),
// };

// export const companyRouter = createTRPCRouter({
//   createCompany: protectedProcedure
//     .input(companyRouterValidationSchema.createCompany)
//     .mutation(async ({ input, ctx }) => {
//       const { name, companyEmail, description, location, website, image } =
//         input;

//       const [company] = await ctx.db
//         .insert(companies)
//         .values({
//           founderId: ctx.session.user.id,
//           name,
//           description,
//           location,
//           website,
//           email: companyEmail,
//           imageUrl: image ?? null,
//         })
//         .returning();

//       return company;
//     }),

//   createCompanyJar: protectedProcedure
//     .input(companyRouterValidationSchema.createCompanyJar)
//     .mutation(async ({ input, ctx }) => {
//       const {
//         name,
//         description,
//         purpose,
//         image,
//         goalAmount,
//         companyId,
//         currency,
//       } = input;

//       const [jar] = await ctx.db
//         .insert(jars)
//         .values({
//           companyId,
//           name,
//           description,
//           purpose,
//           imageUrl: image ?? null,
//           goalAmount: `${goalAmount}`,
//           currency,
//         })
//         .returning();

//       return jar;
//     }),

//   completeOnboarding: protectedProcedure
//     .input(companyRouterValidationSchema.completeOnboarding)
//     .mutation(async ({ input, ctx }) => {
//       const {
//         name,
//         companyEmail,
//         description,
//         companyImage,
//         location,
//         website,
//         jarName,
//         jarDescription,
//         jarPurpose,
//         jarImage,
//         goalAmount,
//         currency,
//       } = input;

//       const [company] = await ctx.db
//         .insert(companies)
//         .values({
//           founderId: ctx.session.user.id,
//           name,
//           description,
//           location,
//           website,
//           email: companyEmail,
//           imageUrl: companyImage ?? null,
//         })
//         .returning();

//       if (!company) {
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "Company not found",
//         });
//       }

//       const [jar] = await ctx.db
//         .insert(jars)
//         .values({
//           companyId: company.id,
//           name: jarName,
//           description: jarDescription,
//           purpose: jarPurpose,
//           imageUrl: jarImage ?? null,
//           goalAmount: `${goalAmount}`,
//           currency,
//         })
//         .returning();

//       if (!jar) {
//         throw new TRPCError({
//           code: "NOT_FOUND",
//           message: "Jar not found",
//         });
//       }

//       await ctx.db
//         .update(users)
//         .set({ onboardingCompleted: true })
//         .where(eq(users.id, ctx.session.user.id));

//       console.log("🚀 ~ .mutation ~ company:", company, jar);
//       return { data: "success" };
//     }),
// });
