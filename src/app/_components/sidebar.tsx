"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "~/trpc/react";
import { logoutAction } from "../auth/actions";
import { useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const { data: currentUser } = api.auth.getCurrentUser.useQuery();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const navItems = [
        { href: "/", label: "Events", icon: "📅", adminOnly: false },
        { href: "/books", label: "Books", icon: "📚", adminOnly: false },
        { href: "/content", label: "Content", icon: "📝", adminOnly: false },
        { href: "/users", label: "Users", icon: "👥", adminOnly: true },
    ];

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logoutAction();
        } catch (error) {
            setIsLoggingOut(false);
        }
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-gray-800 bg-gray-950">
            <div className="flex h-full flex-col">
                {/* Logo/Brand */}
                <div className="border-b border-gray-800 p-6">
                    <h1 className="text-xl font-bold text-white">Another Read</h1>
                    <p className="mt-1 text-sm text-gray-400">Dashboard</p>
                </div>

                {/* Navigation */}
                <nav className="flex-1 space-y-1 p-4">
                    {navItems.map((item) => {
                        // Hide admin-only items from non-admins
                        if (item.adminOnly && currentUser?.userTier !== "Admin") {
                            return null;
                        }

                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all ${isActive
                                    ? "bg-gray-800 text-white"
                                    : "text-gray-400 hover:bg-gray-900 hover:text-white"
                                    }`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* User Info & Logout */}
                <div className="border-t border-gray-800 p-4">
                    {currentUser ? (
                        <div className="space-y-3">
                            <div className="rounded-lg bg-gray-900 p-3">
                                <p className="text-sm font-medium text-white">
                                    {currentUser.firstName} {currentUser.lastName}
                                </p>
                                <p className="text-xs text-gray-400">{currentUser.email}</p>
                                <span className="mt-2 inline-block rounded-full bg-blue-500/20 px-2 py-1 text-xs font-medium text-blue-400">
                                    {currentUser.userTier}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                                className="w-full rounded-lg border border-gray-700 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-800 hover:text-white disabled:opacity-50"
                            >
                                {isLoggingOut ? "Logging out..." : "Logout"}
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-2 text-center text-sm font-medium text-white transition-all hover:from-blue-500 hover:to-blue-400"
                        >
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </aside>
    );
}
