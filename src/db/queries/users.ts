import { eq } from "drizzle-orm";
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

export const getUserByEmail = async (email: string) : Promise<NewUser | undefined> => {
    const [result] = await db.select().from(users).where(eq(users.email, email));
    return result;
};