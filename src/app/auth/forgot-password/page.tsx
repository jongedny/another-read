"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [success, setSuccess] = useState(false);
    const [resetToken, setResetToken] = useState("");

    const requestResetMutation = api.auth.requestPasswordReset.useMutation({
        onSuccess: (data) => {
            setSuccess(true);
            // In development, the token is returned for testing
            if (data.token) {
                setResetToken(data.token);
            }
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        requestResetMutation.mutate({ email });
    };

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-4">
                <div className="w-full max-w-md">
                    <div className="rounded-2xl border border-blue-500/20 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
                        <div className="mb-6 flex justify-center">
                            <div className="rounded-full bg-blue-500/20 p-4">
                                <svg
                                    className="h-12 w-12 text-blue-400"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="mb-4 text-center text-2xl font-bold text-white">
                            Check Your Email
                        </h2>
                        <p className="mb-6 text-center text-gray-400">
                            If an account exists with that email address, we've sent you a
                            password reset link. Please check your inbox.
                        </p>

                        {/* Development Only - Show Reset Token */}
                        {resetToken && (
                            <div className="mb-6 rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
                                <p className="mb-2 text-sm font-semibold text-yellow-400">
                                    Development Mode - Reset Token:
                                </p>
                                <code className="block break-all rounded bg-gray-800 p-2 text-xs text-gray-300">
                                    {resetToken}
                                </code>
                                <Link
                                    href={`/auth/reset-password?token=${resetToken}`}
                                    className="mt-2 block text-sm text-blue-400 hover:text-blue-300"
                                >
                                    Click here to reset your password →
                                </Link>
                            </div>
                        )}

                        <Link
                            href="/auth/login"
                            className="block w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 text-center font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400"
                        >
                            Back to Login
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
                    <p className="text-gray-400">Reset your password</p>
                </div>

                {/* Forgot Password Card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
                    <div className="mb-6">
                        <h2 className="mb-2 text-xl font-semibold text-white">
                            Forgot your password?
                        </h2>
                        <p className="text-sm text-gray-400">
                            Enter your email address and we'll send you a link to reset your
                            password.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={requestResetMutation.isPending}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {requestResetMutation.isPending
                                ? "Sending..."
                                : "Send Reset Link"}
                        </button>

                        {/* Link to Login */}
                        <div className="text-center text-sm text-gray-400">
                            Remember your password?{" "}
                            <Link
                                href="/auth/login"
                                className="text-blue-400 transition-colors hover:text-blue-300"
                            >
                                Sign in
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
