// Function to check if a table exists
async function tableExists(tableName,pool) {
  try {
    const client = await pool.connect();
    const result = await client.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = $1
      );
    `, [tableName]);
    client.release();
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error checking if table exists:', error);
    return false; // Return false in case of error
  } finally {
    // End pool connection when done
  //  pool.end();
  }
}

// SQL query to create a 'users' table
const createUserTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(255) NOT NULL,
    phone_number VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(255)
);
`;

// Function to create the table user if it does not exist
async function createUserTableIfNotExists(pool) {
  const tableName = 'users';
  const tableExistsResult = await tableExists(tableName,pool);
  
  if (!tableExistsResult) {
    console.log(`Table '${tableName}' does not exist. Creating table...`);
    try {
      const client = await pool.connect();
      await client.query(createUserTableQuery);
      console.log('Table created successfully');
      client.release();
    } catch (error) {
      console.error('Error creating table:', error);
    }
  } else {
    console.log(`Table '${tableName}' already exists.`);
  }
}

module.exports = createUserTableIfNotExists;
