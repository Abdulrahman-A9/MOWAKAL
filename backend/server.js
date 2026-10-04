require("dotenv").config();
const mysql = require("mysql2/promise");
const { createApp } = require("./app");

const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET"];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
}
if (process.env.JWT_SECRET.length < 32) {
  throw new Error("JWT_SECRET must contain at least 32 characters");
}

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  waitForConnections: true,
  connectionLimit: 10
});

const app = createApp({
  db,
  jwtSecret: process.env.JWT_SECRET,
  allowedOrigins: (process.env.FRONTEND_ORIGINS || "").split(",").map((value) => value.trim()).filter(Boolean)
});

const port = Number(process.env.PORT || 3001);
app.listen(port, () => console.log(`MOWAKAL API listening on port ${port}`));
