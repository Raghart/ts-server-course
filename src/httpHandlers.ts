import { Request, Response } from "express";

export const chirpyVerifierHandler = (req: Request, res: Response) => {
    let body = "";

    type JsonStruct = {
        body: string;
    }

    req.on("data", (chunk) => {
        body += chunk;
    });

    req.on("end", () => {
        try {
            const parsedBody: JsonStruct = JSON.parse(body);
            if (parsedBody.body.length > 140) {
                res.status(400).header("Content-Type", "application/json").send({
                    "error": "Chirp is too long"
                })
            }

            res.status(200).header("Content-Type", "application/json").send({
                "valid": true,
            })

        } catch {
            res.status(400).header("Content-Type", "application/json").send({
                "error": "Something went wrong"
            })
        }
    });
};