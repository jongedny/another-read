import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { publishers, books } from "~/server/db/schema";

export const publisherRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                name: z.string().min(1, "Name is required"),
                website: z.string().optional(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const [publisher] = await ctx.db.insert(publishers).values(input).returning();
            return publisher;
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

            const allPublishers = await ctx.db.query.publishers.findMany({
                orderBy: (publishers, { asc }) => [asc(publishers.name)],
                limit,
                offset,
            });

            return allPublishers;
        }),

    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const publisher = await ctx.db.query.publishers.findFirst({
                where: (publishers, { eq }) => eq(publishers.id, input.id),
            });

            return publisher;
        }),

    getWithBooks: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const publisher = await ctx.db.query.publishers.findFirst({
                where: (publishers, { eq }) => eq(publishers.id, input.id),
            });

            if (!publisher) {
                return null;
            }

            // Get all books for this publisher
            const publisherBooks = await ctx.db.query.books.findMany({
                where: (books, { eq }) => eq(books.publisherId, input.id),
                orderBy: (books, { desc }) => [desc(books.createdAt)],
            });

            return {
                ...publisher,
                books: publisherBooks,
            };
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.number(),
                name: z.string().min(1, "Name is required").optional(),
                website: z.string().optional(),
                description: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const updated = await ctx.db
                .update(publishers)
                .set({ ...updateData, updatedAt: new Date() })
                .where(eq(publishers.id, id))
                .returning();

            return updated[0];
        }),

    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            // Note: This will fail if there are books referencing this publisher
            // You may want to add logic to handle this case
            await ctx.db.delete(publishers).where(eq(publishers.id, input.id));
        }),
});
