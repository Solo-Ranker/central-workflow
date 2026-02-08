import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./index.js";

export async function runMigrations() {
    console.log("⏳ Running database migrations...");
    try {
        // This will look for the migrations folder relative to the root of the project
        // In production (Dockerfile), we copy this folder to /app/drizzle
        await migrate(db, { migrationsFolder: "./drizzle" });
        console.log("✅ Migrations applied successfully!");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        // In production, we might want to exit if migrations fail
        if (process.env.NODE_ENV === "production") {
            process.exit(1);
        }
    }
}
