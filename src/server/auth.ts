import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "~/env";
import { cookies } from "next/headers";

export type UserTier = "Admin" | "Marketer" | "User";
export type UserStatus = "Active" | "Closed" | "Pending";

export interface JWTPayload {
    userId: number;
    email: string;
    userTier: UserTier;
    status: UserStatus;
}

const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "7d"; // 7 days
const COOKIE_NAME = "auth_token";

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
    password: string,
    hash: string,
): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
    const token = jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: TOKEN_EXPIRY,
    });
    return token;
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}

/**
 * Get the current user from the auth cookie
 */
export async function getCurrentUser(): Promise<JWTPayload | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    return verifyToken(token);
}

/**
 * Set the auth cookie
 */
export async function setAuthCookie(token: string): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: token,
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });
}

/**
 * Clear the auth cookie
 */
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.set({
        name: COOKIE_NAME,
        value: "",
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
    });
}

/**
 * Generate a random token for password reset
 */
export function generateResetToken(): string {
    return jwt.sign({ random: Math.random() }, env.JWT_SECRET, {
        expiresIn: "1h",
    });
}
