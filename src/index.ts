import express from "express";

const main = () => {
    const app = express();
    const port = 8080;

    app.use(express.static("."));

    app.listen(port, () => {
        console.log(`Running on http://localhost:${port}/`)
    });
};
main();