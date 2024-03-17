// app.js
const { Pool } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const expressJwt = require('express-jwt');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const resolvers = require('./resolvers');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');

const createUserTableIfNotExists = require('./createUserTable');

const bookService = require('./addBook');

const schema = buildSchema(`
  ${require('fs').readFileSync('./schema.graphql', 'utf8')}
`);

const app = express();

const secretKey = 'your_secret_key';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: '',
  password: 'system',
  port: 5432, // Default PostgreSQL port
});

app.use(express.json());

//app.use(expressJwt.expressjwt({ secret: secretKey }).unless({ path: ['/login'] }));
app.use(expressJwt.expressjwt({ 
  secret: secretKey,
  algorithms: ['HS256'] // Specify the algorithms used for decoding and verifying JWT tokens
}).unless({ path: ['/home', '/api/login', '/api/register', '/login', '/register', '/create-account-success', '/createnewbook', '/graphql'] }));
createUserTableIfNotExists(pool);
async function createBookTableIfNotExists(pool){
const createBookTableQuery = `CREATE TABLE IF NOT EXISTS books (id SERIAL PRIMARY KEY, title TEXT, author TEXT, publication_year INTEGER)`;
  try {
    const client = await pool.connect();
    await client.query(createBookTableQuery);
    console.log('Table created successfully');
    client.release();
  } catch (error) {
    console.error('Error creating table:', error);
  }
}
createBookTableIfNotExists(pool);




function verifyRole(req, res, next) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Unauthorized: Invalid token' });
    }

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    next();
  });
}

// Define a route to fetch all books
app.get('/api/books', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM books');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/register', async (req, res) => {
  const { user_name, email, phone_number, password, role} = req.body;
  const status='active';
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the user into the database
    const query = 'INSERT INTO users (user_name, email, phone_number, password, role, status) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [user_name, email, phone_number, hashedPassword, role, status];
    await pool.query(query, values);

    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).send('Internal server error');
  }
});

// POST endpoint to add a book
// POST endpoint to add a book
app.post('/api/books/add', async (req, res) => {
//const bookData = JSON.parse(req.body);
console.info("req="+req.body);
const { title, author, publication_year } = req.body;
const bookCreateStatus=bookService.createBook(pool, title, author, publication_year);
res.status(201).send(bookCreateStatus);
});

app.post('/api/login', async (req, res) => {
  const { user_name, password } = req.body;

  try {
    // Fetch user from the database
    const query = 'SELECT * FROM users WHERE user_name = $1';
    const { rows } = await pool.query(query, [user_name]);
    const user = rows[0];

    // Check if user exists and verify password
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid username or password');
    }
    const payload = {
      user_name: user.user_name,
      role: user.role // Assuming user object contains 'username' and 'role' properties
    }
    // Generate JWT token
    const token = jwt.sign(payload, secretKey);

    res.status(200).send({ token });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).send('Internal server error');
  }
});

app.get('/home', (req, res) => {
  const htmlFilePath = path.join("", 'index.html');
  
  // Read the HTML file
  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

app.get('/login', (req, res) => {
  const htmlFilePath = path.join("", 'login.html');
  
  // Read the HTML file
  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

app.get('/register', (req, res) => {
  const htmlFilePath = path.join("", 'register.html');
  
  // Read the HTML file
  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

app.get('/create-account-success', (req, res) => {
  const htmlFilePath = path.join("", 'create_account_success.html');
  
  // Read the HTML file
  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});

app.get('/createnewbook', (req, res) => {
  const htmlFilePath = path.join("", 'createnewbook.html');
  
  // Read the HTML file
  fs.readFile(htmlFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading HTML file:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(data);
    }
  });
});



app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000/graphql');
});