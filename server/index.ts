import express, { Request, Response } from 'express';
import { MongoClient, Db, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.API_PORT) || Number(process.env.PORT) || 3001;

// MongoDB connection configuration
const MONGO_URL: string = process.env.MONGODB_URL || 
  `mongodb://${process.env.MONGO_USERNAME || 'admin'}:${process.env.MONGO_PASSWORD || 'password'}@${process.env.MONGO_HOST || 'mongodb'}:${process.env.MONGO_PORT || 27017}/${process.env.MONGO_DATABASE || 'categoryai'}?authSource=${process.env.MONGO_AUTH_SOURCE || 'admin'}`;

let db: Db;

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
app.get('/api/decks', async (req: Request, res: Response): Promise<void> => {
  try {
    const decks = await db.collection('decks').find({}).toArray();
    res.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
});

app.get('/api/decks/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const deckId = req.params.id;
    // Try to find by string ID first, then by ObjectId if it's a valid ObjectId format
    let query: any = { _id: deckId };
    if (ObjectId.isValid(deckId)) {
      query = { $or: [{ _id: deckId }, { _id: new ObjectId(deckId) }] };
    }
    
    const deck = await db.collection('decks').findOne(query);
    if (!deck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
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