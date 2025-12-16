import { z } from "zod";
import { eq, inArray } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { books, eventBooks, events } from "~/server/db/schema";

export const bookRouter = createTRPCRouter({
    create: publicProcedure
        .input(
            z.object({
                title: z.string().min(1, "Title is required"),
                author: z.string().min(1, "Author is required"),
                description: z.string().optional(),
                isbn: z.string().optional(),
                publicationDate: z.string().optional(),
                keywords: z.string().optional(),
                price: z.string().optional(),
                genre: z.string().optional(),
                coverImageUrl: z.string().optional(),
                status: z.string().optional(),
                externalId: z.string().optional(),
                createdBy: z.string().optional(),
                isSample: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(books).values(input);
        }),

    createBulk: publicProcedure
        .input(
            z.object({
                books: z.array(
                    z.object({
                        title: z.string(),
                        author: z.string(),
                        description: z.string().optional(),
                        isbn: z.string().optional(),
                        publicationDate: z.string().optional(),
                        keywords: z.string().optional(),
                        price: z.string().optional(),
                        genre: z.string().optional(),
                        coverImageUrl: z.string().optional(),
                        status: z.string().optional(),
                        externalId: z.string().optional(),
                        createdBy: z.string().optional(),
                        isSample: z.string().optional(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            if (input.books.length === 0) {
                return { count: 0 };
            }

            await ctx.db.insert(books).values(input.books);
            return { count: input.books.length };
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

            const allBooks = await ctx.db.query.books.findMany({
                orderBy: (books, { desc }) => [desc(books.createdAt)],
                limit,
                offset,
            });

            return allBooks;
        }),

    getById: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const book = await ctx.db.query.books.findFirst({
                where: (books, { eq }) => eq(books.id, input.id),
            });

            return book;
        }),

    getWithEvents: publicProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
            const book = await ctx.db.query.books.findFirst({
                where: (books, { eq }) => eq(books.id, input.id),
            });

            if (!book) {
                return null;
            }

            // Get all event relationships for this book
            const relations = await ctx.db.query.eventBooks.findMany({
                where: (eventBooks, { eq }) => eq(eventBooks.bookId, input.id),
                orderBy: (eventBooks, { desc }) => [desc(eventBooks.createdAt)],
            });

            // Get the event details
            const relatedEvents = [];
            if (relations.length > 0) {
                const eventIds = relations.map(r => r.eventId);
                const eventsList = await ctx.db.query.events.findMany({
                    where: (events, { inArray }) => inArray(events.id, eventIds),
                });

                // Combine event data with AI scores
                relatedEvents.push(...eventsList.map(event => {
                    const relation = relations.find(r => r.eventId === event.id);
                    return {
                        ...event,
                        aiScore: relation?.aiScore,
                        aiExplanation: relation?.aiExplanation,
                        matchScore: relation?.matchScore,
                    };
                }));
            }

            return {
                ...book,
                relatedEvents,
            };
        }),

    getByIds: publicProcedure
        .input(z.object({ ids: z.array(z.number()) }))
        .query(async ({ ctx, input }) => {
            if (input.ids.length === 0) {
                return [];
            }

            const booksList = await ctx.db.query.books.findMany({
                where: inArray(books.id, input.ids),
            });

            return booksList;
        }),

    update: publicProcedure
        .input(
            z.object({
                id: z.number(),
                title: z.string().min(1, "Title is required").optional(),
                author: z.string().min(1, "Author is required").optional(),
                description: z.string().optional(),
                isbn: z.string().optional(),
                publicationDate: z.string().optional(),
                keywords: z.string().optional(),
                price: z.string().optional(),
                genre: z.string().optional(),
                coverImageUrl: z.string().optional(),
                status: z.string().optional(),
                externalId: z.string().optional(),
                createdBy: z.string().optional(),
                isSample: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input;

            const updated = await ctx.db
                .update(books)
                .set({ ...updateData, updatedAt: new Date() })
                .where(eq(books.id, id))
                .returning();

            return updated[0];
        }),

    delete: publicProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.delete(books).where(eq(books.id, input.id));
        }),
});

