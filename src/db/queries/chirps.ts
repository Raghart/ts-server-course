import { db } from "../index.js";
import { chirps, NewChirp } from "../schema.js";

export const createChirp = async (chirp: NewChirp) => {
    const [result] = await db.insert(chirps).values(chirp).onConflictDoNothing().returning();
    return result;
};

export const getAllChirps = async () => {
    const dbChirps = await db.select().from(chirps).orderBy(chirps.createdAt);
    return dbChirps;
};