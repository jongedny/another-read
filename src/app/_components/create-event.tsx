"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function CreateEvent() {
    const [name, setName] = useState("");
    const utils = api.useUtils();

    const createEvent = api.event.create.useMutation({
        onSuccess: async () => {
            await utils.event.getAll.invalidate();
            setName("");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim()) {
            createEvent.mutate({ name: name.trim() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="rounded-lg border border-gray-800 bg-gray-900 p-6">
                <h2 className="mb-4 text-xl font-semibold text-white">
                    Create New Event
                </h2>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter event name..."
                        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-3 text-white placeholder-gray-500 transition-colors focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        disabled={createEvent.isPending}
                    />
                    <button
                        type="submit"
                        disabled={createEvent.isPending || !name.trim()}
                        className="rounded-lg bg-white px-6 py-3 font-medium text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        {createEvent.isPending ? "Creating..." : "Create Event"}
                    </button>
                </div>
                {createEvent.error && (
                    <p className="mt-2 text-sm text-red-400">{createEvent.error.message}</p>
                )}
            </div>
        </form>
    );
}
