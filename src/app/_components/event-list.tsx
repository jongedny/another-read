"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

export function EventList() {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValue, setEditValue] = useState("");

    const utils = api.useUtils();
    const { data: events, isLoading } = api.event.getAll.useQuery();
    const updateEvent = api.event.update.useMutation({
        onSuccess: async () => {
            await utils.event.getAll.invalidate();
            setEditingId(null);
            setEditValue("");
        },
    });

    const handleEdit = (id: number, currentName: string) => {
        setEditingId(id);
        setEditValue(currentName);
    };

    const handleSave = async (id: number) => {
        if (!editValue.trim()) return;
        await updateEvent.mutateAsync({ id, name: editValue });
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue("");
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-center rounded-2xl border border-purple-500/30 bg-gray-900/50 p-12 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
                        <p className="text-gray-400">Loading events...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="w-full max-w-2xl">
                <div className="rounded-2xl border border-purple-500/30 bg-gray-900/50 p-12 text-center backdrop-blur-xl">
                    <div className="mb-4 text-6xl">📅</div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-300">
                        No events yet
                    </h3>
                    <p className="text-gray-500">
                        Create your first event to get started!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                    All Events
                </h2>
                <span className="rounded-full bg-purple-500/20 px-4 py-1 text-sm font-medium text-purple-300">
                    {events.length} {events.length === 1 ? "event" : "events"}
                </span>
            </div>
            <div className="space-y-3">
                {events.map((event, index) => (
                    <div
                        key={event.id}
                        className="group relative overflow-hidden rounded-xl border border-purple-500/20 bg-gray-900/50 p-6 backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50 hover:bg-gray-900/70"
                        style={{
                            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
                        }}
                    >
                        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 text-2xl">
                                    🎉
                                </div>
                                <div className="flex-1">
                                    {editingId === event.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 rounded-lg border border-purple-500/30 bg-gray-800/50 px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                                                disabled={updateEvent.isPending}
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleSave(event.id);
                                                    if (e.key === "Escape") handleCancel();
                                                }}
                                            />
                                            <button
                                                onClick={() => handleSave(event.id)}
                                                disabled={updateEvent.isPending || !editValue.trim()}
                                                className="rounded-lg bg-green-500/20 px-3 py-2 text-green-400 transition-all hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Save"
                                            >
                                                {updateEvent.isPending ? (
                                                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-green-400 border-t-transparent"></div>
                                                ) : (
                                                    "✓"
                                                )}
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                disabled={updateEvent.isPending}
                                                className="rounded-lg bg-red-500/20 px-3 py-2 text-red-400 transition-all hover:bg-red-500/30 disabled:opacity-50"
                                                title="Cancel"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3
                                                className="text-lg font-semibold text-white cursor-pointer hover:text-purple-400 transition-colors"
                                                onClick={() => handleEdit(event.id, event.name)}
                                                title="Click to edit"
                                            >
                                                {event.name}
                                            </h3>
                                            <p className="text-sm text-gray-400">
                                                {new Date(event.createdAt).toLocaleDateString("en-US", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                            {editingId !== event.id && (
                                <button
                                    onClick={() => handleEdit(event.id, event.name)}
                                    className="ml-4 rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-purple-500/30"
                                >
                                    Edit
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
