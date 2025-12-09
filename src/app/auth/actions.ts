"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "~/server/db";
import { users } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import {
    hashPassword,
    verifyPassword,
    generateToken,
    type UserTier,
    type UserStatus,
} from "~/server/auth";

const COOKIE_NAME = "auth_token";
const TOKEN_EXPIRY_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function loginAction(formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
        return { error: "Email and password are required" };
    }

    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, email.toLowerCase()),
    });

    if (!user) {
        return { error: "Invalid email or password" };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
        return { error: "Invalid email or password" };
    }

    // Check if user is active
    if (user.status !== "Active") {
        return {
            error:
                user.status === "Pending"
                    ? "Your account is pending approval. Please wait for an administrator to activate your account."
                    : "Your account has been closed. Please contact an administrator.",
        };
    }

    // Generate JWT token
    const token = generateToken({
        userId: user.id,
        email: user.email,
        userTier: user.userTier as UserTier,
        status: user.status as UserStatus,
    });

    // Set auth cookie - MUST be done before redirect
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: TOKEN_EXPIRY_SECONDS,
        path: "/",
    });

    // Redirect after cookie is set
    redirect("/");
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    redirect("/auth/login");
}
