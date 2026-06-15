const mysql = require("mysql2");

require("dotenv").config();

// validate environment variables
const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);

    process.exit(1);
  }
});

// create mysql pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  waitForConnections: true,

  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,

  queueLimit: 0,

  connectTimeout: 10000,

  charset: "utf8mb4",

  supportBigNumbers: true,

  multipleStatements: false,
});

// promise wrapper
const promisePool = pool.promise();

// connection test
async function testConnection() {
  try {
    const connection = await promisePool.getConnection();

    console.log("MySQL Connected Successfully");

    connection.release();
  } catch (error) {
    console.error("Database Connection Failed:");

    console.error(error.message);

    process.exit(1);
  }
}

// initialize connection test
testConnection();

// graceful shutdown
async function shutdown() {
  try {
    console.log("\nClosing MySQL connections...");

    await promisePool.end();

    console.log("MySQL pool closed");

    process.exit(0);
  } catch (error) {
    console.error("Error closing MySQL pool:", error.message);

    process.exit(1);
  }
}

// graceful shutdown signals
process.on("SIGINT", shutdown);

process.on("SIGTERM", shutdown);

// pool errors
pool.on("error", (error) => {
  console.error("MySQL Pool Error:", error.message);

  // fatal mysql errors
  if (error.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection lost.");
  }

  if (error.code === "ER_CON_COUNT_ERROR") {
    console.error("Database has too many connections.");
  }

  if (error.code === "ECONNREFUSED") {
    console.error("Database connection refused.");
  }
});

// export promise pool
module.exports = promisePool;

// optional raw pool access
module.exports.rawPool = pool;
