import express from 'express';
import { config } from 'dotenv';
import { verifyDatabaseConnection } from './src/db/pool.js';
import authRoutes from './src/routes/authRoutes.js';

config();
verifyDatabaseConnection();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Hello from runloop"
    });
});

app.use("/api/auth", authRoutes);

const server = app.listen(3000, () => {
    console.log("Server is listening to 3000");
});