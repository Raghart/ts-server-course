import { Request, Response } from "express";
import { APICONFIG } from "./config.js";

export const chirpyVerifierHandler = (req: Request, res: Response) => {
    type JsonStruct = {
        body: string;
    };

    const params: JsonStruct = req.body;
    console.log(params);
    if (params.body.length > 140) {
        res.status(400).header("Content-Type", "application/json").send({
            "error": "Chirp is too long"
        });
    };

    res.status(200).header("Content-Type", "application/json").send({
        "valid": true,
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