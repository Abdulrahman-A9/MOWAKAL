require("dotenv").config();
const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

async function main() {
  const required = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "OPERATOR_EMAIL", "OPERATOR_PASSWORD", "OPERATOR_NAME", "OPERATOR_ROLE"];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) throw new Error("Missing required environment variables: " + missing.join(", "));
  if (!["admin", "verifier"].includes(process.env.OPERATOR_ROLE)) throw new Error("OPERATOR_ROLE must be admin or verifier");
  if (process.env.OPERATOR_PASSWORD.length < 12) throw new Error("OPERATOR_PASSWORD must be at least 12 characters");
  const db = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: true } : undefined
  });
  try {
    const hash = await bcrypt.hash(process.env.OPERATOR_PASSWORD, 12);
    await db.execute("INSERT INTO users (name, email, password_hash, role, status) VALUES (?, ?, ?, ?, 'active')", [process.env.OPERATOR_NAME.trim(), process.env.OPERATOR_EMAIL.trim().toLowerCase(), hash, process.env.OPERATOR_ROLE]);
    process.stdout.write("Operator account created.\n");
  } finally {
    await db.end();
  }
}

main().catch((error) => { process.stderr.write("Operator creation failed: " + (error.code || error.message) + "\n"); process.exitCode = 1; });
