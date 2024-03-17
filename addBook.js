async function checkBookExists(pool, title, author) {
  try {
    const client = await pool.connect();
    const query = 'SELECT COUNT(*) AS count FROM books WHERE title = $1 AND author = $2';
    const params = [title, author];
    const result = await client.query(query, params);
    client.release();

    const count = parseInt(result.rows[0].count);
    return count > 0;
  } catch (error) {
    console.error('Error checking if book exists:', error);
    return false;
  }
}

const createTableQuery = `
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publication_year INT
);
`;

async function createBook(pool, title, author, publicationYear) {
  try {
    // Check if the book already exists in table
    const exists = await checkBookExists(pool, title, author);
    if (exists) {
      console.log('The book already exists.');
      return 'The book already exists.';
    }

    // Book does not exist, proceed with insertion
    const insertQuery = 'INSERT INTO books (title, author, publication_year) VALUES ($1, $2, $3)';
    const insertParams = [title, author, publicationYear];
    const client = await pool.connect();
    await client.query(insertQuery, insertParams);
    client.release();
    console.log('Book created successfully.');
    return 'Book created successfully.';
  } catch (error) {
    console.error('Error creating book:', error);
    return 'Error creating book:';
  }
}

module.exports = { checkBookExists, createBook };