#!/usr/bin/env node
/**
 * Supabase setup helper.
 *
 * Supabase does not expose arbitrary SQL execution through the public anon REST
 * API. Apply the migration in supabase/migrations from the Supabase SQL editor
 * or the Supabase CLI instead of trying to run setup SQL from the browser key.
 */

const fs = require("fs");
const path = require("path");

const migrationPath = path.join(
  __dirname,
  "..",
  "supabase",
  "migrations",
  "20260214_guestbook_and_counter_hardening.sql",
);

const args = new Set(process.argv.slice(2));

if (!fs.existsSync(migrationPath)) {
  console.error(`Missing migration: ${migrationPath}`);
  process.exit(1);
}

if (args.has("--print")) {
  process.stdout.write(fs.readFileSync(migrationPath, "utf8"));
  process.exit(0);
}

console.log("Supabase schema setup is migration-based.");
console.log("");
console.log("Apply this SQL file in the Supabase SQL editor or with the Supabase CLI:");
console.log(`  ${migrationPath}`);
console.log("");
console.log("To print the SQL:");
console.log("  node scripts/setup-supabase.js --print");
