import argon2 from "argon2";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "./errorTypes.js";
import { Request } from "express";

export const hashPassword = (password: string) : Promise<string> => {
    return argon2.hash(password);
};

export const checkPasswordHash = async (password: string, hash: string) : Promise<boolean> => {
    try {
        return await argon2.verify(hash, password);
    } catch {
        return false;
    }
};

type Payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export const makeJWT = (userID: string, expiresIn: number, secret: string) => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;

    const token = jwt.sign(
        {
            iss: "chirpy",
            sub: userID,
            iat: issuedAt,
            exp: expiresAt,
        } satisfies Payload,
        secret,
        { algorithm: "HS256" }
    );
    return token;
};

export const validateJWT = (tokenString: string, secret: string): string => {
    let decoded: Payload;
    try {
        decoded = jwt.verify(tokenString, secret) as JwtPayload;
    } catch (e) {
        throw new UserNotAuthenticatedError("Invalid token");
    }

    if (decoded.iss !== "chirpy") {
        throw new UserNotAuthenticatedError("Invalid issuer");
    }

    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("No user ID in token");
    }

    return decoded.sub;
};

export const getBearerToken = (req: Request) : string => {
    const rawAuthentication = req.get("Authorization");
    if (!rawAuthentication) {
        throw new UserNotAuthenticatedError("Invalid request");
    };

    const authenticationArray = rawAuthentication.split(" ");
    if (authenticationArray.length != 2) {
        throw new UserNotAuthenticatedError("Invalid request");
    };

    return authenticationArray[1];
};