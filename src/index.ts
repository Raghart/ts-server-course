import express, { Request, Response } from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middlewares.js";
import { APICONFIG } from "./config.js";

const main = () => {
    const app = express();
    const port = 8080;

    app.get("/api/healthz", (_req: Request, res: Response) => {
        res.set("Content-Type", "text/plain");
        res.send("OK")
    });

    app.get("/admin/metrics", (_req: Request, res: Response) => {
        res.set("Content-Type", "text/html; charset=utf-8");
        res.send(`<html>
        <body>
            <h1>Welcome, Chirpy Admin</h1>
            <p>Chirpy has been visited ${APICONFIG.fileserverHits} times!</p>
        </body>
        </html>`);
    });

    app.post("/admin/reset", (_req: Request, res: Response) => {
        APICONFIG.fileserverHits = 0;
        res.set("Content-Type", "text/plain").send("OK");
    });

    app.use("/api", middlewareLogResponses);
    app.use("/app", middlewareMetricsInc, express.static("./src/app"));

    app.listen(port, () => {
        console.log(`Running on http://localhost:${port}/`)
    });
};
main();