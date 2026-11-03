import { Pool } from "pg";
import { config } from 'dotenv';

config();

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is missing");
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 10000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL error", error);
});

export const query = (text, params) => pool.query(text, params);

export const verifyDatabaseConnection = async (attempts = 3) => {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            await pool.query('SELECT NOW()');
            console.log('----------- ✅ Database connected ✅ -----------');
            return true;
        } catch (error) {
            console.log(`DB connect attempt ${attempt}/${attempts} failed: ${error.message}`);
            if (attempt === attempts) {
                console.error('Starting anyway — pool will retry on first request.');
                return false;
            }
            await new Promise(r => setTimeout(r, attempt * 2000));
        }
    }
};

export default pool;

// ---- Notes that i learn from this -----------

// `pg.Pool` does not immediately connect to PostgreSQL when you create it. 
// Creating a pool only initializes a connection manager with your database configuration. 
// The actual database connection happens lazily when the first query is executed (e.g., `pool.query("SELECT NOW()")`). 
// At that moment, PostgreSQL authenticates the client, opens a connection, 
// and the pool keeps that connection alive for reuse instead of reconnecting every time. 
// `pool.query()` automatically acquires and releases clients from the pool, while `pool.connect()` gives manual control over a client, 
// mainly for transactions. Pooling improves performance because opening PostgreSQL connections is expensive, 
// so reusing existing connections is much faster and more scalable.
