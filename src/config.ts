type APIConfig = {
    fileserverHits: number;
    dbUrl: string;
};

process.loadEnvFile();

export const APICONFIG: APIConfig = {
    fileserverHits: 0,
    dbUrl: process.env.DB_URL ?? "",
}