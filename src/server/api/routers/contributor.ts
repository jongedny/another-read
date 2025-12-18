import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { contributors, bookContributors, books } from "~/server/db/schema";

export const contributorRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1, "Name is required"),
                biography: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [contributor] = await ctx.db.insert(contributors).values(input).returning();
            return contributor;
        }),

    getAll: publicProcedure
        .input(
            z
                .object({
                    limit: z.number().min(1).max(100).optional(),
                    offset: z.number().min(0).optional(),
                })
                .optional()
        )
        .query(async ({ ctx, input }) => {
            const limit = input?.limit ?? 50;
            const offset = input?.offset ?? 0;

            const allContributors = await ctx.db.query.contributors.findMany({
                orderBy: (contributors, { asc }) => [asc(contributors.name)],
                limit,
                offset,
            });

            return allContributors;
        }),

    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const contributor = await ctx.db.query.contributors.findFirst({
                where: (contributors, { eq }) => eq(contributors.id, input.id),
            });

            return contributor;
        }),

    getWithBooks: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const contributor = await ctx.db.query.contributors.findFirst({
                where: (contributors, { eq }) => eq(contributors.id, input.id),
            });

            if (!contributor) {
                return null;
            }

            // Get all book relationships for this contributor
            const relations = await ctx.db.query.bookContributors.findMany({
                where: (bookContributors, { eq }) => eq(bookContributors.contributorId, input.id),
                orderBy: (bookContributors, { desc }) => [desc(bookContributors.createdAt)],
            });

            // Get the book details
            const relatedBooks = [];
            if (relations.length > 0) {
                const bookIds = relations.map(r => r.bookId);
                const booksList = await ctx.db.query.books.findMany({
                    where: (books, { inArray }) => inArray(books.id, bookIds),
                });

                // Combine book data with role information
                relatedBooks.push(...booksList.map(book => {
                    const relation = relations.find(r => r.bookId === book.id);
                    return {
                        ...book,
                        role: relation?.role,
                        sequenceNumber: relation?.sequenceNumber,
                    };
                }));
            }

            return {
                ...contributor,
                relatedBooks,
            };
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().min(1, "Name is required").optional(),
                biography: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const updated = await ctx.db
                .update(contributors)
                .set({ ...updateData, updatedAt: new Date() })
                .where(eq(contributors.id, id))
                .returning();

            return updated[0];
        }),

    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            // First delete all book-contributor relationships
            await ctx.db.delete(bookContributors).where(eq(bookContributors.contributorId, input.id));

            // Then delete the contributor
            await ctx.db.delete(contributors).where(eq(contributors.id, input.id));
        }),
});
