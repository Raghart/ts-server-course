import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./middlewares.js";
import { checkRefreshTokenHandler, chirpyHealthHandler, chirpyMetricsHandler, chirpyResetMetricsHandler, 
    createChirpHandler, 
    createrUserHandler, 
    errorHandler,
    getAllChirpsHandler,
    getSingleChirpHandler,
    loginUserHandler} from "./httpHandlers.js";
import postgres from "postgres";
import { APICONFIG } from "./config.js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";

const migrationClient = postgres(APICONFIG.dbUrl, { max: 1 });
await migrate(drizzle(migrationClient), {
    migrationsFolder: "src/db/migrations",
});
const app = express();
app.use(express.json());

app.get("/api/healthz", chirpyHealthHandler);
app.get("/admin/metrics", chirpyMetricsHandler);
app.post("/admin/reset", chirpyResetMetricsHandler);
app.post("/api/users", createrUserHandler);
app.get("/api/chirps", getAllChirpsHandler);
app.get("/api/chirps/:chirpId", getSingleChirpHandler);
app.post("/api/chirps", createChirpHandler);
app.post("/api/login", loginUserHandler);
app.post("/api/refresh", checkRefreshTokenHandler);
app.use("/api", middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(errorHandler);

app.listen(APICONFIG.port, () => {
    console.log(`Running on http://localhost:${APICONFIG.port}/`)
});