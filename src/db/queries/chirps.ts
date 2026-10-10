import { eq } from "drizzle-orm";
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

export const getChirpById = async (id: string) : Promise<NewChirp | undefined> => {
    const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
    return result;
};

export const deleteChirpById = async (chirpId: string) : Promise<NewChirp | undefined> => {
    const [result] = await db.delete(chirps).where(eq(chirps.id, chirpId)).returning();
    return result;
};