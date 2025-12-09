"use client";

import { useState, useEffect } from "react";
import { api } from "~/trpc/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const resetPasswordMutation = api.auth.resetPassword.useMutation({
        onSuccess: () => {
            setSuccess(true);
            setError("");
        },
        onError: (error) => {
            setError(error.message);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!token) {
            setError("Invalid reset link");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        resetPasswordMutation.mutate({
            token,
            newPassword: password,
        });
    };

    if (!token) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-red-500/20 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
                        <h2 className="mb-4 text-center text-2xl font-bold text-white">
                            Invalid Reset Link
                        </h2>
                        <p className="mb-6 text-center text-gray-400">
                            This password reset link is invalid or has expired. Please request
                            a new one.
                        </p>
                        <Link
                            href="/auth/forgot-password"
                            className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-center font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400"
                        >
                            Request New Link
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-green-500/20 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-green-500/20 p-4">
                                <svg
                                    className="h-12 w-12 text-green-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="mb-4 text-center text-2xl font-bold text-white">
                            Password Reset Successful!
                        </h2>
                        <p className="mb-6 text-center text-gray-400">
                            Your password has been reset successfully. You can now login with
                            your new password.
                        </p>
                        <Link
                            href="/auth/login"
                            className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-center font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-4">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-4xl font-bold text-white">Another Read</h1>
                    <p className="text-gray-400">Create a new password</p>
                </div>

                {/* Reset Password Card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                New Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="••••••••"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                                Must be at least 8 characters
                            </p>
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="••••••••"
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={resetPasswordMutation.isPending}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {resetPasswordMutation.isPending
                                ? "Resetting Password..."
                                : "Reset Password"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
