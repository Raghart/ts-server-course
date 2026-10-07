import postgres from "postgres";
import { APICONFIG } from "../config.js";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.js";

const conn = postgres(APICONFIG.dbUrl);
export const db = drizzle(conn, { schema });