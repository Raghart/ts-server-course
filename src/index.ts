import express, { Request, Response } from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middlewares.js";
import { chirpyMetricsHandler, chirpyResetMetricsHandler, chirpyVerifierHandler } from "./httpHandlers.js";

const main = () => {
    const app = express();
    const port = 8080;
    app.use(express.json());
    
    app.get("/api/healthz", (_req: Request, res: Response) => {
        res.set("Content-Type", "text/plain");
        res.send("OK")
    });

    app.get("/admin/metrics", chirpyMetricsHandler);
    app.post("/admin/reset", chirpyResetMetricsHandler);
    app.post("/api/validate_chirp", chirpyVerifierHandler);
    app.use("/api", middlewareLogResponses);
    app.use("/app", middlewareMetricsInc, express.static("./src/app"));

    app.listen(port, () => {
        console.log(`Running on http://localhost:${port}/`)
    });
};

main();