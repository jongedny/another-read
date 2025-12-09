/**
 * Script to create an initial admin user
 * Run with: npm run create-admin
 */

import { db } from "../src/server/db/index";
import { users } from "../src/server/db/schema";
import { hashPassword } from "../src/server/auth";
import { eq } from "drizzle-orm";

async function createAdminUser() {
    console.log("Creating admin user...\n");

    const email = "admin@anotherread.com";
    const password = "admin123"; // Change this to a secure password
    const firstName = "Admin";
    const lastName = "User";

    try {
        // Check if admin already exists
        const existingAdmin = await db.query.users.findFirst({
            where: eq(users.email, email),
        });

        if (existingAdmin) {
            console.log(`❌ Admin user with email ${email} already exists!`);
            console.log(`   User ID: ${existingAdmin.id}`);
            console.log(`   Status: ${existingAdmin.status}`);
            console.log(`   Tier: ${existingAdmin.userTier}\n`);
            return;
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create admin user
        const [newAdmin] = await db
            .insert(users)
            .values({
                firstName,
                lastName,
                email,
                password: hashedPassword,
                userTier: "Admin",
                status: "Active",
            })
            .returning();

        console.log("✅ Admin user created successfully!\n");
        console.log("Login credentials:");
        console.log(`   Email: ${email}`);
        console.log(`   Password: ${password}`);
        console.log(`   User ID: ${newAdmin!.id}`);
        console.log(`   Status: ${newAdmin!.status}`);
        console.log(`   Tier: ${newAdmin!.userTier}\n`);
        console.log("⚠️  Please change the password after first login!\n");
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        throw error;
    }
}

createAdminUser()
    .then(() => {
        console.log("Done!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Failed:", error);
        process.exit(1);
    });
