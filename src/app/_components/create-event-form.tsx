"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

export function CreateEventForm() {
    const [name, setName] = useState("");
    const [keywords, setKeywords] = useState("");
    const [description, setDescription] = useState("");
    const [eventDate, setEventDate] = useState("");
    const router = useRouter();

    const createEvent = api.event.create.useMutation({
        onSuccess: async () => {
            router.push("/");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            createEvent.mutate({
                name: name.trim(),
                keywords: keywords.trim() || undefined,
                description: description.trim() || undefined,
                eventDate: eventDate ? new Date(eventDate) : undefined,
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h2 className="mb-6 text-2xl font-semibold text-white">
                    Event Details
                </h2>

                {/* Event Name */}
                <div className="mb-4">
                    <label htmlFor="event-name" className="mb-2 block text-sm font-medium text-gray-300">
                        Event Name *
                    </label>
                    <input
                        id="event-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter event name..."
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        disabled={createEvent.isPending}
                        required
                    />
                </div>

                {/* Event Date */}
                <div className="mb-4">
                    <label htmlFor="event-date" className="mb-2 block text-sm font-medium text-gray-300">
                        Event Date
                    </label>
                    <input
                        id="event-date"
                        type="date"
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white transition-colors focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        disabled={createEvent.isPending}
                    />
                </div>

                {/* Keywords */}
                <div className="mb-4">
                    <label htmlFor="keywords" className="mb-2 block text-sm font-medium text-gray-300">
                        Keywords
                    </label>
                    <input
                        id="keywords"
                        type="text"
                        value={keywords}
                        onChange={(e) => setKeywords(e.target.value)}
                        placeholder="Keywords (comma separated)..."
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        disabled={createEvent.isPending}
                    />
                </div>

                {/* Description */}
                <div className="mb-6">
                    <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-300">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Event description (max 200 words)..."
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        disabled={createEvent.isPending}
                        rows={4}
                        maxLength={1000} // Rough character limit for 200 words
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.push("/")}
                        disabled={createEvent.isPending}
                        className="rounded-lg border border-gray-700 bg-gray-800 px-6 py-3 font-medium text-white transition-colors hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={createEvent.isPending || !name.trim()}
                        className="rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createEvent.isPending ? "Creating..." : "Create Event"}
                    </button>
                </div>
                {createEvent.error && (
                    <p className="mt-4 text-sm text-red-400">{createEvent.error.message}</p>
                )}
            </div>
        </form>
    );
}
