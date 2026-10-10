import { db } from "../index.js";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export const createRefreshToken = async (refreshToken: NewRefreshToken) => {
    const [result] = 
        await db.insert(refreshTokens).values(refreshToken).onConflictDoNothing().returning();
    return result;
};