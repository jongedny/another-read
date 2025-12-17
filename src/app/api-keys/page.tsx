"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { formatDistanceToNow } from "date-fns";

export default function ApiKeysPage() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copiedKey, setCopiedKey] = useState(false);

    const { data: apiKeys, refetch } = api.admin.getAllApiKeys.useQuery();
    const createKey = api.admin.createApiKey.useMutation({
        onSuccess: (data) => {
            setCreatedKey(data.apiKey);
            setNewKeyName("");
            void refetch();
        },
    });
    const revokeKey = api.admin.revokeApiKey.useMutation({
        onSuccess: () => {
            void refetch();
        },
    });
    const deleteKey = api.admin.deleteApiKey.useMutation({
        onSuccess: () => {
            void refetch();
        },
    });

    const handleCreateKey = () => {
        if (!newKeyName.trim()) return;
        createKey.mutate({ name: newKeyName });
    };

    const handleCopyKey = () => {
        if (createdKey) {
            void navigator.clipboard.writeText(createdKey);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const handleCloseKeyModal = () => {
        setCreatedKey(null);
        setShowCreateModal(false);
    };

    return (
        <main className="min-h-screen bg-gray-950 px-8 py-12">
            <div className="mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <h1 className="text-4xl font-bold text-white">API Keys</h1>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="rounded-lg bg-white px-6 py-3 font-semibold text-gray-900 transition hover:bg-gray-100"
                    >
                        Create API Key
                    </button>
                </div>

                {/* API Keys Table */}
                <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900/50">
                    <table className="w-full">
                        <thead className="border-b border-gray-800 bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                    Name
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                    Status
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                    Usage Count
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                    Last Used
                                </th>
                                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
                                    Created
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-300">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {apiKeys?.map((key) => (
                                <tr key={key.id} className="transition-colors hover:bg-gray-800/50">
                                    <td className="px-6 py-4 text-white">
                                        {key.name}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-block rounded-full border px-3 py-1 text-xs font-medium ${key.status === "active"
                                                ? "bg-green-500/20 text-green-400 border-green-500/30"
                                                : "bg-red-500/20 text-red-400 border-red-500/30"
                                                }`}
                                        >
                                            {key.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {key.usageCount}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {key.lastUsedAt
                                            ? formatDistanceToNow(new Date(key.lastUsedAt), {
                                                addSuffix: true,
                                            })
                                            : "Never"}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">
                                        {formatDistanceToNow(new Date(key.createdAt), {
                                            addSuffix: true,
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {key.status === "active" && (
                                            <button
                                                onClick={() => revokeKey.mutate({ keyId: key.id })}
                                                className="mr-2 text-orange-400 transition-colors hover:text-orange-300"
                                                disabled={revokeKey.isPending}
                                            >
                                                Revoke
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (
                                                    confirm(
                                                        "Are you sure you want to delete this API key? This action cannot be undone."
                                                    )
                                                ) {
                                                    deleteKey.mutate({ keyId: key.id });
                                                }
                                            }}
                                            className="text-red-400 transition-colors hover:text-red-300"
                                            disabled={deleteKey.isPending}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!apiKeys || apiKeys.length === 0) && (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="py-12 text-center text-gray-400"
                                    >
                                        No API keys found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Create API Key Modal */}
                {showCreateModal && !createdKey && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                Create New API Key
                            </h2>
                            <div className="mb-4">
                                <label
                                    htmlFor="keyName"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Key Name
                                </label>
                                <input
                                    id="keyName"
                                    type="text"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="e.g., Production Website"
                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewKeyName("");
                                    }}
                                    className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateKey}
                                    disabled={!newKeyName.trim() || createKey.isPending}
                                    className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {createKey.isPending ? "Creating..." : "Create"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Show Created Key Modal */}
                {createdKey && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                        <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
                            <h2 className="mb-4 text-xl font-bold text-gray-900">
                                API Key Created Successfully
                            </h2>
                            <div className="mb-4 rounded-lg bg-yellow-50 p-4">
                                <p className="mb-2 text-sm font-semibold text-yellow-800">
                                    ⚠️ Important: Save this key now!
                                </p>
                                <p className="text-sm text-yellow-700">
                                    This is the only time you'll see this key. Store it securely.
                                </p>
                            </div>
                            <div className="mb-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Your API Key
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={createdKey}
                                        readOnly
                                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 font-mono text-sm"
                                    />
                                    <button
                                        onClick={handleCopyKey}
                                        className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                                    >
                                        {copiedKey ? "Copied!" : "Copy"}
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 rounded-lg bg-gray-50 p-4">
                                <p className="mb-2 text-sm font-semibold text-gray-700">
                                    Usage Example:
                                </p>
                                <pre className="overflow-x-auto text-xs text-gray-600">
                                    {`// Using tRPC client
const result = await trpc.api.getContent.query({
  apiKey: "${createdKey}",
  limit: 10,
  offset: 0
});`}
                                </pre>
                            </div>
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseKeyModal}
                                    className="rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
