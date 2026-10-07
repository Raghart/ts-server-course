type APIConfig = {
    fileserverHits: number;
    dbUrl: string;
    port: number;
    migrationDirectory: string;
};

process.loadEnvFile();

export const APICONFIG: APIConfig = {
    fileserverHits: 0,
    dbUrl: process.env.DB_URL ?? "",
    port: Number(process.env.PORT ?? 8080),
    migrationDirectory: "src/db/migrations"
}