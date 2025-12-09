"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const registerMutation = api.auth.register.useMutation({
        onSuccess: (data) => {
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

        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Validate password length
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        registerMutation.mutate({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

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
                            Registration Successful!
                        </h2>
                        <p className="mb-6 text-center text-gray-400">
                            Your account has been created and is pending approval. An
                            administrator will review your account and activate it shortly.
                            You'll be able to login once your account is activated.
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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-950 to-black px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo/Brand */}
                <div className="mb-8 text-center">
                    <h1 className="mb-2 text-4xl font-bold text-white">Another Read</h1>
                    <p className="text-gray-400">Create your account</p>
                </div>

                {/* Registration Card */}
                <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8 shadow-2xl backdrop-blur-sm">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label
                                    htmlFor="firstName"
                                    className="mb-2 block text-sm font-medium text-gray-300"
                                >
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label
                                    htmlFor="lastName"
                                    className="mb-2 block text-sm font-medium text-gray-300"
                                >
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

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
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                placeholder="you@example.com"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-gray-300"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
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
                                Confirm Password
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
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
                            disabled={registerMutation.isPending}
                            className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 font-semibold text-white transition-all hover:from-blue-500 hover:to-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {registerMutation.isPending ? "Creating Account..." : "Sign Up"}
                        </button>

                        {/* Link to Login */}
                        <div className="text-center text-sm text-gray-400">
                            Already have an account?{" "}
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
