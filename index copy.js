const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = express();
const port = 3000;
const secretKey = 'your-secret-key'; // Replace with a strong secret key
const mongoUri = 'mongodb://localhost:27017/bookstore'; // Replace with your MongoDB URI

// Connect to MongoDB
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Define a Book schema and model
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  publishedDate: String,
});

const Book = mongoose.model('Book', bookSchema);

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

// Login route to generate JWT tokens
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // In a real application, you would validate user credentials here

  // For simplicity, let's assume authentication is successful
  const user = { username };
  const accessToken = jwt.sign(user, secretKey);
  res.json({ accessToken });
});

// Protected CRUD operations with JWT authentication
app.post('/books', authenticateToken, async (req, res) => {
  // Create a new book (authenticated users only)
  try {
    const newBook = await Book.create(req.body);
    res.json(newBook);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create a book' });
  }
});

app.get('/books', authenticateToken, async (req, res) => {
  // Read all books (authenticated users only)
  try {
    const books = await Book.find();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve books' });
  }
});

app.get('/books/:id', authenticateToken, async (req, res) => {
  // Read a specific book by ID (authenticated users only)
  const bookId = req.params.id;
  try {
    const book = await Book.findById(bookId);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve the book' });
  }
});

app.put('/books/:id', authenticateToken, async (req, res) => {
  // Update a book by ID (authenticated users only)
  const bookId = req.params.id;
  try {
    const updatedBook = await Book.findByIdAndUpdate(bookId, req.body, { new: true });
    if (updatedBook) {
      res.json(updatedBook);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update the book' });
  }
});

app.delete('/books/:id', authenticateToken, async (req, res) => {
  // Delete a book by ID (authenticated users only)
  const bookId = req.params.id;
  try {
    const deletedBook = await Book.findByIdAndRemove(bookId);
    if (deletedBook) {
      res.json(deletedBook);
    } else {
      res.status(404).json({ error: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete the book' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
