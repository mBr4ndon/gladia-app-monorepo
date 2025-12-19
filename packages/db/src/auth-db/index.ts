import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import "dotenv/config";

let _authDb: NeonHttpDatabase<typeof schema> | null = null;

export const getAuthDb = () => {
    if (_authDb) return _authDb;

    const connectionString = process.env.NEON_AUTH_DB_URL;
    if (!connectionString) {
        throw new Error("NEON_AUTH_DB_URL is not set");
    }

    _authDb = drizzle(connectionString, {
        schema,
    });

    return _authDb;
};

export const authDb  = new Proxy({} as NeonHttpDatabase<typeof schema>, {
    get: (_, prop) => getAuthDb()[prop as keyof NeonHttpDatabase<typeof schema>],
})