const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function retryQuery(query, values = [], retries = 3) {
  try {
    return await pool.query(query, values);
  } catch (err) {
    if (retries === 0) {
      console.error("DB failed after retries:", err.message);
      throw err;
    }

    console.log("Retrying DB query...");
    await new Promise((res) => setTimeout(res, 100));
    return retryQuery(query, values, retries - 1);
  }
}

module.exports = pool;
module.exports.retryQuery = retryQuery;