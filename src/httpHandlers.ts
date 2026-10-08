import { NextFunction, Request, Response } from "express";
import { APICONFIG } from "./config.js";
import { InvalidLengthError, NotFoundError, UserForbiddenError, UserNotAuthenticatedError } from "./errorTypes.js";
import { createUser, resetUsers } from "./db/queries/users.js";
import { createChirp } from "./db/queries/chirps.js";

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
    type RequestUser = {
        email: string;
    }
    
    const newUser: RequestUser = req.body;
    const createdUser = await createUser({ email: newUser.email });
    res.status(201).send(createdUser);
};

export const createChirpHandler = async (req: Request, res: Response) => {
    type Chirp = {
        body: string;
        userId: string;
    };

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
        userId: requestChip.userId,
    });

    res.status(201).send(createdChirp);
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log(err);
    if (err instanceof InvalidLengthError) {
        res.status(400).send({
            "error": err.message,
        });
    } if (err instanceof UserNotAuthenticatedError) {
        res.status(401).send({
            "error": err.message,
        });
    } if (err instanceof UserForbiddenError) {
        res.status(403).send({
            "error": err.message,
        });
    } if (err instanceof NotFoundError) {
        res.status(404).send({
            "error": err.message,
        });
    } else {
        res.status(500).send({
            "error": "Something went wrong on our end",
        });
    }
};