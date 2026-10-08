import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export const createUser = async (user: NewUser) => {
    const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
    return {
        id: result.id,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        email: result.email,
    };
};

export const resetUsers = async () => {
    await db.delete(users)
};