const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
const books = require('./data.js')
const port = 3000;
const secretKey = '123Acb2@!'; //secret key

app.use(express.json());

// Authentication middleware
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (token === null) return res.sendStatus(401); // Unauthorized

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403); // Forbidden
    req.user = user;
    next();
  });
}

// Create a new JWT token
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = { username };
  const accessToken = jwt.sign(user, secretKey);
  res.json({ accessToken });
});

// Protected CRUD operations
app.post('/books', authenticateToken, (req, res) => {
  // Create a new book (authenticated users only)
  const newBook = req.body;
  books.push(newBook);
  res.json(newBook);
});

app.get('/books', authenticateToken, (req, res) => {
  // Read all books (authenticated users only)
  res.json(books);
});

app.get('/books/:id', authenticateToken, (req, res) => {
  // Read a specific book by ID (authenticated users only)
  const bookId = parseInt(req.params.id);
  const book = books.find((b) => b.id === bookId);
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.put('/books/:id', authenticateToken, (req, res) => {
  // Update a book by ID (authenticated users only)
  const bookId = parseInt(req.params.id);
  const updatedBook = req.body;
  const index = books.findIndex((b) => b.id === bookId);
  if (index !== -1) {
    books[index] = updatedBook;
    res.json(updatedBook);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.delete('/books/:id', authenticateToken, (req, res) => {
  // Delete a book by ID (authenticated users only)
  const bookId = parseInt(req.params.id);
  const index = books.findIndex((b) => b.id === bookId);
  if (index !== -1) {
    const deletedBook = books.splice(index, 1)[0];
    res.json(deletedBook);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
