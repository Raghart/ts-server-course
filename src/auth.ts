import argon2 from "argon2";

export const hashPassword = (password: string) : Promise<string> => {
    return argon2.hash(password);
};

export const checkPasswordHash = async (password: string, hash: string) : Promise<boolean> => {
    return argon2.verify(hash, password);
};