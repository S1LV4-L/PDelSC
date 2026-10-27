import mysql from "mysql2/promise";
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: { ca: process.env.DB_SSL_CA },
  waitForConnections: true,
  connectionLimit: 5,
});

pool.on("connection", (conn) => {
  conn.promise().query("SET time_zone = '-03:00'").catch(console.error);
});

export default pool;
