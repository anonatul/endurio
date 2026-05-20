import express from 'express';
import { config } from 'dotenv';
import { verifyDatabaseConnection } from './db/pool.js';

config();
verifyDatabaseConnection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello from runloop"
    });
})

const server = app.listen(3000, () => {
    console.log("Server is listening to 3000");
});