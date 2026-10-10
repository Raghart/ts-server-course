import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewRefreshToken, NewUser, RequestUser, users } from "../schema.js";
import { hashPassword } from "../../auth.js";

export const createUser = async (user: NewUser) => {
    const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
    return {
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        email: result.email,
        isChirpyRed: result.isChirpyRed,
    };
};

export const resetUsers = async () => {
    await db.delete(users)
};

export const getUserByEmail = async (email: string) : Promise<NewUser | undefined> => {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
};

export const getUserByRefreshToken = 
    async (refreshToken: NewRefreshToken) : Promise<NewUser | undefined> => {
    const [result] = await db.select().from(users).where(eq(users.id, refreshToken.userId));
    return result;
};

export const updateUserById = async (userID: string, newParams: RequestUser) => {
    const [result] = await db.update(users).set({
        email: newParams.email,
        hashed_password: await hashPassword(newParams.password),
    }).where(eq(users.id, userID)).returning();

    return result;
};

export const upgradeUserChirpyById = async (userID: string) : Promise<NewUser | undefined> => {
    const [result] = await db.update(users).set({
        isChirpyRed: true
    }).where(eq(users.id, userID)).returning();

    return result;
};