import express, { Request, Response } from "express";
import { middlewareLogResponses } from "./middlewares.js";

const main = () => {
    const app = express();
    const port = 8080;

    app.get("/healthz", (_req: Request, res: Response) => {
        res.set("Content-Type", "text/plain");
        res.send("OK")
    });

    app.use(middlewareLogResponses);
    app.use("/app", express.static("./src/app"));

    app.listen(port, () => {
        console.log(`Running on http://localhost:${port}/`)
    });
};
main();