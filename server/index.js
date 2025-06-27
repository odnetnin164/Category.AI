const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

// MongoDB connection configuration
const MONGO_URL = process.env.MONGODB_URL || 
  `mongodb://${process.env.MONGO_USERNAME || 'admin'}:${process.env.MONGO_PASSWORD || 'password'}@${process.env.MONGO_HOST || 'mongodb'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE || 'categoryai'}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`;

let db;

// Connect to MongoDB
MongoClient.connect(MONGO_URL)
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db('categoryai');
  })
  .catch(error => console.error('MongoDB connection error:', error));

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

// Routes
app.get('/api/decks', async (req, res) => {
  try {
    const decks = await db.collection('decks').find({}).toArray();
    res.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

app.get('/api/decks/:id', async (req, res) => {
  try {
    const deck = await db.collection('decks').findOne({ _id: req.params.id });
    if (!deck) {
      return res.status(404).json({ error: 'Deck not found' });
    }
    res.json(deck);
  } catch (error) {
    console.error('Error fetching deck:', error);
    res.status(500).json({ error: 'Failed to fetch deck' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});