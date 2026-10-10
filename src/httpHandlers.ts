import { NextFunction, Request, Response } from "express";
import { APICONFIG } from "./config.js";
import { InvalidLengthError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errorTypes.js";
import { createUser, getUserByEmail, getUserByRefreshToken, resetUsers, updateUserById } from "./db/queries/users.js";
import { createChirp, getAllChirps, getChirpById } from "./db/queries/chirps.js";
import { checkPasswordHash, getBearerToken, hashPassword, makeJWT, makeRefreshToken, validateJWT } from "./auth.js";
import { RequestUser } from "./db/schema.js";
import { createRefreshToken, getRefreshToken, revokeRefreshToken } from "./db/queries/refreshTokens.js";

export const chirpyMetricsHandler = (_req: Request, res: Response) => {
    res.set("Content-Type", "text/html; charset=utf-8").send(`<html>
    <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${APICONFIG.fileserverHits} times!</p>
    </body>
    </html>`);
};

export const chirpyResetMetricsHandler = (_req: Request, res: Response) => {
    if (APICONFIG.platform !== "dev") {
        res.status(403).send("Forbidden");
        return;
    };

    APICONFIG.fileserverHits = 0;
    resetUsers();
    res.set("Content-Type", "text/plain").send("OK");
};

export const chirpyHealthHandler = (_req: Request, res: Response) => {
    res.set("Content-Type", "text/plain").send("OK");
};

export const createrUserHandler = async (req: Request, res: Response) => {
    const newUser: RequestUser = req.body;
    const passwordHashed = await hashPassword(newUser.password);
    const createdUser = await createUser({ 
        email: newUser.email,
        hashed_password: passwordHashed,
    });

    res.status(201).send(createdUser);
};

export const loginUserHandler = async (req: Request, res: Response) => {
    const userToCheck: RequestUser = req.body;
    
    const dbUser = await getUserByEmail(userToCheck.email);
    if (!dbUser || !dbUser?.id) {
        res.status(401).send("incorrect email or password");
        return;
    };

    if (!await checkPasswordHash(userToCheck.password, dbUser.hashed_password!)) {
        res.status(401).send("incorrect email or password");
        return;
    };

    const tokenJWT = makeJWT(dbUser.id!, 3600, APICONFIG.jwtSecret);
    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 60);

    const refreshToken = await createRefreshToken({
        token: makeRefreshToken(),
        userId: dbUser.id,
        expiresAt: expDate,
    });

    res.status(200).send({
        id: dbUser.id,
        email: dbUser.email,
        createdAt: dbUser.createdAt,
        updatedAt: dbUser.updatedAt,
        token: tokenJWT,
        refreshToken: refreshToken.token,
    })
};

export const createChirpHandler = async (req: Request, res: Response) => {
    type Chirp = {
        body: string;
    };

    const parsedToken = getBearerToken(req);
    const jwtUserId = validateJWT(parsedToken, APICONFIG.jwtSecret);

    const requestChip: Chirp = req.body;
    if (requestChip.body.length > 140) {
        throw new InvalidLengthError("Chirp is too long. Max length is 140");
        res.status(400).header("Content-Type", "application/json").send({
            "error": "Chirp is too long"
        });
        return;
    };

    const parsedBody = requestChip.body.split(" ").map((word) => {
        const badWords = ["kerfuffle", "sharbert", "fornax"];
        if (badWords.includes(word.toLowerCase())) {
            return "****";
        };

        return word;
    }).join(" ");

    const createdChirp = await createChirp({
        body: parsedBody,
        userId: jwtUserId,
    });

    res.status(201).send(createdChirp);
};

export const getAllChirpsHandler = async (_req: Request, res: Response) => {
    const allChirps = await getAllChirps();
    res.status(200).send(allChirps);
};

export const getSingleChirpHandler = async (req: Request, res: Response) => {
    let requestedId = req.params.chirpId;
    if (Array.isArray(requestedId)) {
        requestedId = requestedId[0]
    };

    const chirp = await getChirpById(requestedId);
    if (!chirp) {
        res.status(404).send("Chirp not found!")
        return;
    };

    res.status(200).send(chirp);
};

export const checkRefreshTokenHandler = async (req: Request, res: Response) => {
    const token = getBearerToken(req);
    
    const refreshToken = await getRefreshToken(token);
    if (!refreshToken || refreshToken.revokedAt) {
        res.status(401).send("Unathorized");
        return;
    };

    const dbUser = await getUserByRefreshToken(refreshToken);
    if (!dbUser || !dbUser?.id) {
        res.status(401).send("Unathorized");
        return;
    };

    const newAcessToken = makeJWT(dbUser.id, 3600, APICONFIG.jwtSecret);

    res.status(200).send({
        token: newAcessToken,
    });
};

export const revokeRefreshTokenHandler = async (req: Request, res: Response) => {
    const refreshToken = getBearerToken(req);
    await revokeRefreshToken(refreshToken);

    res.status(204).send();
};

export const replaceUserInformationHandler = async (req: Request, res: Response) => {
    const acessToken = getBearerToken(req);
    const requeseUser: RequestUser = req.body;

    const userID = validateJWT(acessToken, APICONFIG.jwtSecret);
    
    const updatedUser = await updateUserById(userID, requeseUser);

    res.status(200).send({
        id: updatedUser.id,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
    })
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log(err);
    if (err instanceof InvalidLengthError) {
        return res.status(400).send({"error": err.message });
    };
    
    if (err instanceof UserNotAuthenticatedError) {
        return res.status(401).send({ "error": err.message });
    };

    if (err instanceof UserForbiddenError) {
        return res.status(403).send({ "error": err.message });
    }; 
    
    if (err instanceof NotFoundError) {
        return res.status(404).send({ "error": err.message });
    }  
    
    return res.status(500).send({
        "error": "Something went wrong on our end",
    });
    
};