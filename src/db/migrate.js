import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from './pool.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const migrationsDir = path.join(__dirname, "migrations");

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log("Running migrations...");

    // Create migrations tracking table
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ DEFAULT now()
      );
    `);

    // Read migration files
    const files = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      // Check if migration already ran
      const result = await client.query(
        `SELECT id FROM migrations WHERE id = $1`,
        [file]
      );

      if (result.rows.length > 0) {
        console.log(`Skipping ${file}`);
        continue;
      }

      console.log(`Running ${file}`);

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      // Transaction
      await client.query("BEGIN");

      try {
        await client.query(sql);

        await client.query(
          `INSERT INTO migrations (id) VALUES ($1)`,
          [file]
        );

        await client.query("COMMIT");

        console.log(`Completed ${file}`);
      } catch (err) {
        await client.query("ROLLBACK");

        console.error(`Failed migration: ${file}`);
        console.error(err);

        process.exit(1);
      }
    }

    console.log("All migrations complete");
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();