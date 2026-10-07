import { NextFunction, Request, Response } from "express";
import { APICONFIG } from "./config.js";

export const chirpyVerifierHandler = (req: Request, res: Response) => {
    type JsonStruct = {
        body: string;
    };

    const params: JsonStruct = req.body;
    if (params.body.length > 140) {
        throw new Error("Chirp is too long");
        res.status(400).header("Content-Type", "application/json").send({
            "error": "Chirp is too long"
        });
        return;
    };

    const parsedBody = params.body.split(" ").map((word) => {
        const badWords = ["kerfuffle", "sharbert", "fornax"];
        if (badWords.includes(word.toLowerCase())) {
            return "****";
        };

        return word;
    }).join(" ");

    res.status(200).header("Content-Type", "application/json").send({
        "cleanedBody": parsedBody,
    });
};

export const chirpyMetricsHandler = (_req: Request, res: Response) => {
    res.set("Content-Type", "text/html; charset=utf-8").send(`<html>
    <body>
        <h1>Welcome, Chirpy Admin</h1>
        <p>Chirpy has been visited ${APICONFIG.fileserverHits} times!</p>
    </body>
    </html>`);
};

export const chirpyResetMetricsHandler = (_req: Request, res: Response) => {
    APICONFIG.fileserverHits = 0;
    res.set("Content-Type", "text/plain").send("OK");
};

export const chirpyHealthHandler = (_req: Request, res: Response) => {
    res.set("Content-Type", "text/plain").send("OK");
};

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.log(err);
    res.status(500).send({
        "error": "Something went wrong on our end",
    });
};