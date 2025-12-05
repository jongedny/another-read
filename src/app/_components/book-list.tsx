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
            <div className="w-full max-w-6xl">
                <div className="flex items-center justify-center rounded-2xl border border-purple-500/30 bg-gray-900/50 p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                        <p className="text-gray-400">Loading books...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!books || books.length === 0) {
        return (
            <div className="w-full max-w-6xl">
                <div className="rounded-2xl border border-purple-500/30 bg-gray-900/50 p-12 text-center backdrop-blur-xl">
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
        <div className="w-full max-w-6xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                    All Books
                </h2>
                <span className="rounded-full bg-purple-500/20 px-4 py-1 text-sm font-medium text-purple-300">
                    {books.length} {books.length === 1 ? "book" : "books"}
                </span>
            </div>

            {/* Books Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {books.map((book, index) => (
                    <div
                        key={book.id}
                        className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gray-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-900/70 hover:scale-105"
                        style={{
                            animation: `fadeInUp 0.6s ease-out ${index * 0.05}s both`,
                        }}
                    >
                        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-2xl">
                                📖
                            </div>
                            {book.price && (
                                <span className="rounded-full bg-green-500/20 px-3 py-1 text-sm font-semibold text-green-400">
                                    £{book.price}
                                </span>
                            )}
                        </div>

                        <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-white">
                            {book.title}
                        </h3>

                        <p className="mb-3 text-sm text-purple-300">
                            by {book.author}
                        </p>

                        {book.description && (
                            <p className="mb-4 line-clamp-3 text-sm text-gray-400">
                                {book.description.replace(/<[^>]*>/g, '')}
                            </p>
                        )}

                        <div className="flex flex-wrap gap-2">
                            {book.isbn && (
                                <span className="rounded-md bg-gray-800/50 px-2 py-1 text-xs text-gray-400">
                                    ISBN: {book.isbn}
                                </span>
                            )}
                            {book.status && (
                                <span className={`rounded-md px-2 py-1 text-xs ${book.status === 'active'
                                        ? 'bg-green-500/20 text-green-400'
                                        : 'bg-gray-500/20 text-gray-400'
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
                    className="rounded-lg bg-purple-500/20 px-6 py-3 text-purple-400 transition-all hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    ← Previous
                </button>
                <span className="text-gray-400">
                    Page {currentPage + 1}
                </span>
                <button
                    onClick={() => setCurrentPage((p) => p + 1)}
                    disabled={books.length < pageSize}
                    className="rounded-lg bg-purple-500/20 px-6 py-3 text-purple-400 transition-all hover:bg-purple-500/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
}
