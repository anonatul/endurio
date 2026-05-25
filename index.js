import express from 'express';
import { config } from 'dotenv';
import pool from './src/db/pool.js';
import session from 'express-session';
import genStore from 'connect-pg-simple';
import authRoutes from './src/routes/authRoutes.js';
import { verifyDatabaseConnection } from './src/db/pool.js';

config();
verifyDatabaseConnection();

const app = express();

// ----------------------------------------------------------
// |       Session management with PostgreSQL store         |
// ----------------------------------------------------------
// I LEARNED ONE THING: so its uses database to store session data,
// which is more secure than defualt memory store, cause whenever server restarts,
// all sessions which are stored in memeory will be lost 

const PgSessionStore = genStore(session);
app.use(session({
    store: new PgSessionStore({
        pool: pool,
        tableName: 'session'
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax'
    }
}))

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