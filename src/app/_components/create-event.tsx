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
        <form onSubmit={handleSubmit} className="w-full max-w-2xl">
            <div className="group relative">
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
                <div className="relative flex flex-col gap-4 rounded-2xl bg-gray-900/90 p-8 backdrop-blur-xl">
                    <h2 className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-3xl font-bold text-transparent">
                        Create New Event
                    </h2>
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter event name..."
                            className="flex-1 rounded-xl border border-purple-500/30 bg-gray-800/50 px-6 py-4 text-white placeholder-gray-400 backdrop-blur-sm transition-all duration-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                            disabled={createEvent.isPending}
                        />
                        <button
                            type="submit"
                            disabled={createEvent.isPending || !name.trim()}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                        >
                            <span className="relative z-10">
                                {createEvent.isPending ? "Creating..." : "Create Event"}
                            </span>
                            <div className="absolute inset-0 -z-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        </button>
                    </div>
                    {createEvent.error && (
                        <p className="text-sm text-red-400">{createEvent.error.message}</p>
                    )}
                </div>
            </div>
        </form>
    );
}
