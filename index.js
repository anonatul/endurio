import express from 'express';
import { config } from 'dotenv';
import pool from './src/db/pool.js';
import session from 'express-session';
import genStore from 'connect-pg-simple';
import authRoutes from './src/routes/authRoutes.js';
import activityRoutes from './src/routes/activityRoutes.js';
import userRoutes from './src/routes/userRoutes.js';
import { verifyDatabaseConnection } from './src/db/pool.js';
import initCronJobs from './src/services/cronServices.js';
import statRoutes from './src/routes/statRoutes.js';
import coachRoutes from './src/routes/coachRoutes.js';

config();
verifyDatabaseConnection();

// intiate cron jobs
initCronJobs();

const app = express();

// ----------------------------------------------------------
// |       Session management with PostgreSQL store         |
// ----------------------------------------------------------
// WAHT I LEARNED NEW HERE: so its uses database to store session data,
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

// ----- Auth Routes ----- 
app.use("/api/auth", authRoutes);

// ----- Activity Routes ----- 
app.use("/api/activities", activityRoutes)

// ----- Statistic Routes ----- 
app.use("/api/stats", statRoutes);

// ----- Coach AI Routes -----
app.use("/api/coach", coachRoutes);

// ----- User Routes -----
app.use("/api/user", userRoutes);

const server = app.listen(3000, () => {
    console.log("Server is listening to 3000");
});