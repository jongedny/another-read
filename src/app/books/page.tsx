import { BookList } from "~/app/_components/book-list";
import { api, HydrateClient } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function BooksPage({
    searchParams,
}: {
    searchParams: Promise<{ eventId?: string }>;
}) {
    const params = await searchParams;
    const eventId = params.eventId ? parseInt(params.eventId) : undefined;

    void api.book.getAll.prefetch();

    return (
        <HydrateClient>
            <main className="min-h-screen bg-gray-950">
                <div className="mx-auto max-w-7xl px-8 py-12">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="mb-2 text-4xl font-bold text-white">
                            Book Library
                        </h1>
                        <p className="text-gray-400">
                            Browse our collection of books
                        </p>
                    </div>

                    {/* Book List */}
                    <div>
                        <BookList eventId={eventId} />
                    </div>
                </div>
            </main>
        </HydrateClient>
    );
}
