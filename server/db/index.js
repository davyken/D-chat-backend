import pg from "pg";
import dotenv from "dotenv";
import { parse } from "pg-connection-string";

dotenv.config();

const connectionString = process.env.Internal_DB_URL;
const config = parse(connectionString);

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database connected");
  }
});

export default pool;
