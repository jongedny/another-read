import { SignJWT, jwtVerify } from "jose";
import { env } from "~/env";
import type { JWTPayload as CustomJWTPayload } from "~/server/auth";

const TOKEN_EXPIRY = "7d";

// Convert the secret string to Uint8Array for jose
const secret = new TextEncoder().encode(env.JWT_SECRET);

/**
 * Generate a JWT token for Edge Runtime (middleware)
 */
export async function generateEdgeToken(
    payload: CustomJWTPayload,
): Promise<string> {
    const token = await new SignJWT({ ...payload })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(TOKEN_EXPIRY)
        .sign(secret);
    return token;
}

/**
 * Verify a JWT token in Edge Runtime (middleware)
 */
export async function verifyEdgeToken(
    token: string,
): Promise<CustomJWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, secret);
        // Extract our custom fields from the payload
        return {
            userId: payload.userId as number,
            email: payload.email as string,
            userTier: payload.userTier as CustomJWTPayload["userTier"],
            status: payload.status as CustomJWTPayload["status"],
        };
    } catch (error) {
        console.error("[verifyEdgeToken] Token verification failed:", error);
        return null;
    }
}
