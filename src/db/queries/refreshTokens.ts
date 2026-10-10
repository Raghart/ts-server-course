import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export const createRefreshToken = async (refreshToken: NewRefreshToken) => {
    const [result] = 
        await db.insert(refreshTokens).values(refreshToken).onConflictDoNothing().returning();
    return result;
};

export const getRefreshToken = async (token: string) : Promise<NewRefreshToken | undefined> => {
    const [result] = await db.select().from(refreshTokens).where(eq(refreshTokens.token, token));
    return result;
}

export const revokeRefreshToken = async (token: string) => {
    await db.update(refreshTokens).set({ 
        revokedAt: new Date(), 
        updatedAt: new Date() }).where(eq(refreshTokens.token, token));
};