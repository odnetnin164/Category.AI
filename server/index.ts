import express, { Request, Response } from 'express';
import { MongoClient, Db, ObjectId } from 'mongodb';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { generateDeck, GenerateDeckRequest } from './services/openai';

dotenv.config();

const app = express();
const PORT: number = Number(process.env.API_PORT) || Number(process.env.PORT) || 3001;

// Create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new SocketServer(httpServer, {
  cors: {
    origin: [
      process.env.CORS_ORIGIN || 'https://localhost',
      'http://localhost:3000',
      'https://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

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
  origin: [
    process.env.CORS_ORIGIN || 'https://localhost',
    'http://localhost:3000',
    'https://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response): void => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'category-ai-backend' 
  });
});

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

app.post('/api/decks/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, categoryName, cardCount, model, socketId }: GenerateDeckRequest & { socketId?: string } = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    if (!socketId) {
      res.status(400).json({ error: 'Socket ID is required for event-based generation' });
      return;
    }

    // Immediately respond that generation started
    res.json({ status: 'started', message: 'Deck generation started' });

    // Generate deck asynchronously with progress events
    generateDeckWithEvents({ prompt, categoryName, cardCount, model }, socketId, io, db);
    
  } catch (error) {
    console.error('Error starting deck generation:', error);
    res.status(500).json({ error: 'Failed to start deck generation' });
  }
});

// Async function to generate deck with progress events
async function generateDeckWithEvents(
  request: GenerateDeckRequest, 
  socketId: string, 
  io: SocketServer, 
  db: Db
): Promise<void> {
  try {
    const socket = io.sockets.sockets.get(socketId);
    if (!socket) {
      console.error('Socket not found:', socketId);
      return;
    }

    // Emit progress events
    socket.emit('deck-generation-progress', {
      stage: 'starting',
      message: 'Initializing AI deck generation...',
      progress: 10
    });

    socket.emit('deck-generation-progress', {
      stage: 'generating',
      message: 'AI is creating your deck...',
      progress: 30
    });

    const result = await generateDeck(request);
    
    if (!result.success) {
      socket.emit('deck-generation-error', {
        error: result.error || 'Failed to generate deck'
      });
      return;
    }

    socket.emit('deck-generation-progress', {
      stage: 'saving',
      message: 'Saving deck to database...',
      progress: 80
    });

    // Save the generated deck to MongoDB
    const { _id, ...deckWithoutId } = result.deck as any;
    const deckToSave: any = {
      _id: `generated-${Date.now()}`,
      ...deckWithoutId
    };

    await db.collection('decks').insertOne(deckToSave);
    
    socket.emit('deck-generation-complete', {
      deck: deckToSave,
      message: 'Deck generated successfully!',
      progress: 100
    });

  } catch (error) {
    console.error('Error in generateDeckWithEvents:', error);
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.emit('deck-generation-error', {
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    }
  }
}

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
});