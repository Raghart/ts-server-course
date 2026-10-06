import { NextFunction, Request, Response } from "express";

export const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
        const codeStatus = res.statusCode;
        if (codeStatus < 200 || codeStatus > 299) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${codeStatus}`);
        };
    });
    next();
};