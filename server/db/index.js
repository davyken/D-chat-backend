// import pg from "pg";
// import dotenv from "dotenv";
// // import { parse } from "pg-connection-string";

// dotenv.config();

// const { Pool } = pg;
// const pool = new Pool({
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD,
//   port: process.env.DB_PORT,
// });

// pool.connect((err) => {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Database connected");
//   }
// });

// export default pool;

import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
export default pool;
