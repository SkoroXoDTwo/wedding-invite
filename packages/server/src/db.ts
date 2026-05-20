import { Pool, type QueryResultRow } from "pg";

declare global {
  var weddingInvitePool: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("Missing DATABASE_URL");
  }

  return databaseUrl;
}

export function getPool() {
  if (!globalThis.weddingInvitePool) {
    globalThis.weddingInvitePool = new Pool({
      connectionString: getDatabaseUrl()
    });
  }

  return globalThis.weddingInvitePool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
  return getPool().query<T>(text, values);
}
