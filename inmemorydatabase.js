// Import the sqlite3 package
const sqlite3 = require('sqlite3');

// Create a new SQLite database connection (in-memory)
const db = new sqlite3.Database(':memory:');

// Perform database operations
db.serialize(() => {
    console.log('in memory database called');
  // Create a table
  db.run("CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT, publication_year INTEGER)");

  // Insert data
  db.run("INSERT INTO books (title, author, publication_year) VALUES (?, ?, ?)", ["Book 1", "Author 1", 2000]);
  db.run("INSERT INTO books (title, author, publication_year) VALUES (?, ?, ?)", ["Book 2", "Author 2", 2005]);
  db.run("INSERT INTO books (title, author, publication_year) VALUES (?, ?, ?)", ["Book 3", "Author 3", 2010]);

  // Query data
  db.each("SELECT * FROM books", (err, row) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log(row);
    }
  });
});

// Close the database connection
db.close();
