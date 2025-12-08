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
            <div className="w-full">
                <div className="flex items-center justify-center rounded-lg border border-gray-800 bg-gray-900 p-12">
                    <div className="flex items-center gap-3">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-gray-600 border-t-transparent"></div>
                        <p className="text-gray-400">Loading events...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!events || events.length === 0) {
        return (
            <div className="w-full">
                <div className="rounded-lg border border-gray-800 bg-gray-900 p-12 text-center">
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
        <div className="w-full">
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                    All Events
                </h2>
                <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-400">
                    {events.length} {events.length === 1 ? "event" : "events"}
                </span>
            </div>
            <div className="space-y-3">
                {events.map((event) => (
                    <div
                        key={event.id}
                        className="group rounded-lg border border-gray-800 bg-gray-900 p-5 transition-colors hover:border-gray-700"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-xl">
                                    🎉
                                </div>
                                <div className="flex-1">
                                    {editingId === event.id ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-gray-600 focus:outline-none focus:ring-1 focus:ring-gray-600"
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
                                                className="rounded-lg bg-green-500/20 px-3 py-2 text-green-400 transition-colors hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                                className="rounded-lg bg-red-500/20 px-3 py-2 text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-50"
                                                title="Cancel"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <h3
                                                className="text-base font-medium text-white cursor-pointer hover:text-gray-300 transition-colors"
                                                onClick={() => handleEdit(event.id, event.name)}
                                                title="Click to edit"
                                            >
                                                {event.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">
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
                                    className="ml-4 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-400 opacity-0 transition-all group-hover:opacity-100 hover:bg-gray-700 hover:text-white"
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
