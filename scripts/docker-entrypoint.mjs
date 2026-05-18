import { readFile } from "fs/promises";
import pg from "pg";
import { spawn } from "child_process";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

async function waitForDatabase(pool) {
  const startedAt = Date.now();
  let lastError;

  while (Date.now() - startedAt < 60_000) {
    try {
      await pool.query("select 1");
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  throw lastError;
}

async function migrate() {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await waitForDatabase(pool);
    const schema = await readFile("database/schema.sql", "utf8");
    await pool.query(schema);
    console.log("database schema is ready");
  } finally {
    await pool.end();
  }
}

await migrate();

const server = spawn("node", ["server.js"], {
  stdio: "inherit",
  env: process.env
});

server.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
