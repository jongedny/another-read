"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function BookList() {
    const [currentPage, setCurrentPage] = useState(0);
    const pageSize = 20;

    const { data: books, isLoading } = api.book.getAll.useQuery({
        limit: pageSize,
        offset: currentPage * pageSize,
    });

    if (isLoading) {
        return (
            <div className="w-full">
                <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-12">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent"></div>
                        <p className="text-gray-400">Loading books...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!books || books.length === 0) {
        return (
            <div className="w-full">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
                    <div className="mb-4 text-6xl">📚</div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-300">
                        No books found
                    </h3>
                    <p className="text-gray-500">
                        The library is empty. Check back later!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                    All Books
                </h2>
                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-400">
                    {books.length} {books.length === 1 ? "book" : "books"}
                </span>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                    <div
                        key={book.id}
                        className="group rounded-lg border border-gray-800 bg-gray-900 p-5 transition-all hover:border-gray-700"
                    >
                        {/* Book Jacket Thumbnail */}
                        {book.isbn ? (
                            <div className="mb-4 overflow-hidden rounded-lg bg-gray-800">
                                <img
                                    src={`https://cdn.anotherread.com/jackets/${book.isbn}.jpg`}
                                    alt={`${book.title} book cover`}
                                    className="h-64 w-full object-cover transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                        // Fallback to book icon if image fails to load
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const fallback = target.nextElementSibling as HTMLElement;
                                        if (fallback) fallback.style.display = 'flex';
                                    }}
                                />
                                <div className="hidden h-64 w-full items-center justify-center text-6xl">
                                    📖
                                </div>
                            </div>
                        ) : (
                            <div className="mb-4 flex h-64 items-center justify-center rounded-lg bg-gray-800 text-6xl">
                                📖
                            </div>
                        )}

                        <div className="mb-4 flex items-start justify-between">
                            {book.price && (
                                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
                                    £{book.price}
                                </span>
                            )}
                        </div>

                        <h3 className="mb-2 line-clamp-2 text-base font-medium text-white">
                            {book.title}
                        </h3>

                        <p className="mb-3 text-sm text-gray-400">
                            by {book.author}
                        </p>

                        {book.description && (
                            <p className="mb-4 line-clamp-3 text-sm text-gray-500">
                                {book.description.replace(/<[^>]*>/g, '')}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {book.isbn && (
                                <span className="rounded-md bg-gray-800 px-2 py-1 text-xs text-gray-500">
                                    ISBN: {book.isbn}
                                </span>
                            )}
                            {book.status && (
                                <span className={`rounded-md px-2 py-1 text-xs ${book.status === 'active'
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-gray-800 text-gray-500'
                                    }`}>
                                    {book.status}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex items-center justify-center gap-4">
                <button
                    onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="rounded-lg bg-gray-800 px-6 py-3 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    ← Previous
                </button>
                <span className="text-gray-400">
                    Page {currentPage + 1}
                </span>
                <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={books.length < pageSize}
                    className="rounded-lg bg-gray-800 px-6 py-3 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
