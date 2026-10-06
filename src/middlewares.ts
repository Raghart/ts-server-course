import { NextFunction, Request, Response } from "express";
import { APICONFIG } from "./config.js";

export const middlewareLogResponses = (req: Request, res: Response, next: NextFunction) => {
    res.on("finish", () => {
        const codeStatus = res.statusCode;
        if (codeStatus < 200 || codeStatus > 299) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${codeStatus}`);
        };
    });
    next();
};

export const middlewareMetricsInc = (_req: Request, _res: Response, next: NextFunction) => {
    APICONFIG.fileserverHits += 1;
    next();
};