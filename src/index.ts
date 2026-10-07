import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middlewares.js";
import { chirpyHealthHandler, chirpyMetricsHandler, chirpyResetMetricsHandler, 
    chirpyVerifierHandler } from "./httpHandlers.js";

const main = () => {
    const app = express();
    const port = 8080;
    app.use(express.json());
    
    app.get("/api/healthz", chirpyHealthHandler);
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