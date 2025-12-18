"use client";

import { useParams, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { Icon } from "~/app/_components/icon";

// Helper function to format contributors for display
function formatContributors(contributors?: any[]): string {
    if (!contributors || contributors.length === 0) return "Unknown";

    // Group by role
    const authors = contributors.filter(c => c.role === 'author');
    const illustrators = contributors.filter(c => c.role === 'illustrator');
    const editors = contributors.filter(c => c.role === 'editor');
    const translators = contributors.filter(c => c.role === 'translator');
    const others = contributors.filter(c => !['author', 'illustrator', 'editor', 'translator'].includes(c.role));

    const parts: string[] = [];

    if (authors.length > 0) {
        parts.push(authors.map(a => a.name).join(', '));
    }

    if (illustrators.length > 0) {
        parts.push(`Illustrated by ${illustrators.map(i => i.name).join(', ')}`);
    }

    if (editors.length > 0) {
        parts.push(`Edited by ${editors.map(e => e.name).join(', ')}`);
    }

    if (translators.length > 0) {
        parts.push(`Translated by ${translators.map(t => t.name).join(', ')}`);
    }

    if (others.length > 0 && parts.length === 0) {
        // If no specific roles, show other contributors
        parts.push(others.map(o => o.name).join(', '));
    }

    return parts.join(' • ') || "Unknown";
}

export default function BookDetailPage() {
    const params = useParams();
    const router = useRouter();
    const bookId = parseInt(params.id as string);

    const { data: bookData, isLoading } = api.book.getWithEvents.useQuery({ id: bookId });

    if (isLoading) {
        return (
            <main className="min-h-screen bg-gray-950">
                <div className="mx-auto max-w-7xl px-8 py-12">
                    <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-12">
                        <div className="flex items-center gap-3">
                            <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent"></div>
                            <p className="text-gray-400">Loading book details...</p>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!bookData) {
        return (
            <main className="min-h-screen bg-gray-950">
                <div className="mx-auto max-w-7xl px-8 py-12">
                    <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
                        <Icon name="menu_book" className="text-6xl text-gray-600" />
                        <h3 className="mb-2 text-xl font-semibold text-gray-300">
                            Book not found
                        </h3>
                        <p className="mb-4 text-gray-500">
                            The book you're looking for doesn't exist.
                        </p>
                        <button
                            onClick={() => router.push("/books")}
                            className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm text-blue-400 transition-colors hover:bg-blue-500/30"
                        >
                            Back to Books
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-950">
            <div className="mx-auto max-w-7xl px-8 py-12">
                {/* Back Button */}
                <button
                    onClick={() => router.push("/books")}
                    className="mb-6 flex items-center gap-2 text-gray-400 transition-colors hover:text-white"
                >
                    <Icon name="arrow_back" className="text-xl" />
                    <span>Back to Books</span>
                </button>

                {/* Title, Author, and Metadata - Full Width */}
                <div className="mb-8">
                    {/* Title and Author */}
                    <div className="mb-6">
                        <h1 className="mb-2 text-4xl font-bold text-white">
                            {bookData.title}
                        </h1>
                        <p className="text-xl text-gray-400">
                            by {formatContributors(bookData.contributors)}
                        </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex flex-wrap gap-2">
                        {bookData.isbn && (
                            <span className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-400">
                                <span className="text-gray-500">ISBN:</span> {bookData.isbn}
                            </span>
                        )}
                        {bookData.publicationDate && (
                            <span className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-400">
                                <span className="text-gray-500">Published:</span> {bookData.publicationDate}
                            </span>
                        )}
                        {bookData.price && (
                            <span className="rounded-md bg-gray-800 px-3 py-1.5 text-sm text-gray-400">
                                <span className="text-gray-500">Price:</span> £{bookData.price}
                            </span>
                        )}
                        {bookData.genre && (
                            <span className="rounded-md bg-purple-500/20 px-3 py-1.5 text-sm text-purple-400">
                                {bookData.genre}
                            </span>
                        )}
                    </div>
                </div>

                {/* Book Details - Two Column Layout */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Left Column - Book Information */}
                    <div className="lg:col-span-2">
                        {/* Description */}
                        {bookData.description && (
                            <div className="mb-8 rounded-lg border border-gray-800 bg-gray-900 p-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-white">
                                    <Icon name="description" className="text-2xl" />
                                    Description
                                </h2>
                                <p className="text-gray-300 leading-relaxed">
                                    {bookData.description.replace(/<[^>]*>/g, '')}
                                </p>
                            </div>
                        )}

                        {/* Keywords */}
                        {bookData.keywords && (
                            <div className="mb-8 rounded-lg border border-gray-800 bg-gray-900 p-6">
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-semibold text-white">
                                    <Icon name="label" className="text-2xl" />
                                    Keywords
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    {(() => {
                                        try {
                                            const keywords = JSON.parse(bookData.keywords);
                                            return keywords.map((keyword: string, idx: number) => (
                                                <span
                                                    key={idx}
                                                    className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400"
                                                >
                                                    {keyword}
                                                </span>
                                            ));
                                        } catch {
                                            return (
                                                <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
                                                    {bookData.keywords}
                                                </span>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        )}

                        {/* Related Events */}
                        <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
                                <Icon name="event" className="text-2xl" />
                                Related Events
                                <span className="ml-2 rounded-full bg-gray-800 px-2.5 py-0.5 text-sm text-gray-400">
                                    {bookData.relatedEvents?.length || 0}
                                </span>
                            </h2>

                            {!bookData.relatedEvents || bookData.relatedEvents.length === 0 ? (
                                <div className="py-8 text-center">
                                    <Icon name="event_busy" className="text-5xl text-gray-600" />
                                    <p className="mt-3 text-gray-500">
                                        This book hasn't been related to any events yet.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookData.relatedEvents.map((event) => (
                                        <div
                                            key={event.id}
                                            className="rounded-lg border border-gray-800 bg-gray-950 p-5 transition-all hover:border-gray-700"
                                        >
                                            <div className="mb-3 flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <h3 className="mb-1 text-lg font-medium text-white">
                                                        {event.name}
                                                    </h3>
                                                    {event.description && (
                                                        <p className="text-sm text-gray-400 line-clamp-2">
                                                            {event.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* AI Score Badge */}
                                                {event.aiScore !== null && event.aiScore !== undefined && (
                                                    <div className="flex-shrink-0">
                                                        <div className={`rounded-lg px-3 py-2 text-center ${event.aiScore >= 8
                                                            ? 'bg-green-500/20 text-green-400'
                                                            : event.aiScore >= 6
                                                                ? 'bg-blue-500/20 text-blue-400'
                                                                : event.aiScore >= 4
                                                                    ? 'bg-yellow-500/20 text-yellow-400'
                                                                    : 'bg-red-500/20 text-red-400'
                                                            }`}>
                                                            <div className="text-xs font-medium">AI Score</div>
                                                            <div className="text-2xl font-bold">{event.aiScore}</div>
                                                            <div className="text-xs opacity-75">/ 10</div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* AI Explanation */}
                                            {event.aiExplanation && (
                                                <div className="mt-3 rounded-md bg-gray-900 p-4">
                                                    <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-400">
                                                        <Icon name="psychology" className="text-base" />
                                                        AI Analysis
                                                    </div>
                                                    <p className="text-sm text-gray-300 leading-relaxed">
                                                        {event.aiExplanation}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Match Score */}
                                            {event.matchScore !== null && event.matchScore !== undefined && (
                                                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                                                    <Icon name="analytics" className="text-sm" />
                                                    Match Score: {event.matchScore}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column - Book Cover */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            {bookData.isbn ? (
                                <div className="overflow-hidden rounded-lg bg-gray-800">
                                    <img
                                        src={`https://cdn.anotherread.com/jackets/${bookData.isbn}.jpg`}
                                        alt={`${bookData.title} book cover`}
                                        className="w-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const fallback = target.nextElementSibling as HTMLElement;
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                    <div className="hidden h-96 w-full items-center justify-center">
                                        <Icon name="menu_book" className="text-8xl text-gray-600" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-96 items-center justify-center rounded-lg bg-gray-800">
                                    <Icon name="menu_book" className="text-8xl text-gray-600" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
