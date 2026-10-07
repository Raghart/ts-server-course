import { Request, Response } from "express";

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