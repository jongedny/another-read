import { z } from "zod";
import { eq } from "drizzle-orm";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { events } from "~/server/db/schema";

export const eventRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({
            name: z.string().min(1, "Event name is required"),
            keywords: z.string().optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(events).values({
                name: input.name,
                keywords: input.keywords,
                description: input.description,
            });
        }),

    createBulk: publicProcedure
        .input(z.object({
            events: z.array(z.object({
                name: z.string().min(1),
                keywords: z.string().optional(),
                description: z.string().optional(),
            }))
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.events.length === 0) {
                return { count: 0 };
            }

            await ctx.db.insert(events).values(input.events);

            return { count: input.events.length };
        }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        const allEvents = await ctx.db.query.events.findMany({
            orderBy: (events, { desc }) => [desc(events.createdAt)],
        });

        return allEvents;
    }),

    update: publicProcedure
        .input(z.object({
            id: z.number(),
            name: z.string().min(1, "Event name is required"),
            keywords: z.string().optional(),
            description: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const updated = await ctx.db
                .update(events)
                .set({
                    name: input.name,
                    keywords: input.keywords,
                    description: input.description,
                })
                .where(eq(events.id, input.id))
                .returning();

            return updated[0];
        }),
});
