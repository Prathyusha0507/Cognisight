// src/db.js
import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  host: "localhost",
  port: 5433,        // ⚠️ IMPORTANT
  user: "postgres",
  password: "postgres",
  database: "dtest"
});

export default pool;