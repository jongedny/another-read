import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { events } from "~/server/db/schema";

export const eventRouter = createTRPCRouter({
    create: publicProcedure
        .input(z.object({ name: z.string().min(1, "Event name is required") }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.insert(events).values({
                name: input.name,
            });
        }),

    getAll: publicProcedure.query(async ({ ctx }) => {
        const allEvents = await ctx.db.query.events.findMany({
            orderBy: (events, { desc }) => [desc(events.createdAt)],
        });

        return allEvents;
    }),
});
