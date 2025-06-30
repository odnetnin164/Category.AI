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

// Configure server timeouts
app.use((req, res, next) => {
  req.setTimeout(180000); // 3 minute request timeout
  res.setTimeout(180000); // 3 minute response timeout
  next();
});

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
    
    // Start background error deck retry service
    startErrorDeckRetryService();
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
    const { prompt, categoryName, cardCount, model }: GenerateDeckRequest = req.body;
    
    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Create placeholder deck immediately
    const placeholderDeck: any = {
      _id: `generating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: categoryName || 'Generating...',
      description: `AI is creating a deck based on: "${prompt}"`,
      emoji: '⏳',
      cards: [],
      status: 'generating',
      requestedAt: new Date().toISOString(),
      originalPrompt: prompt
    };

    // Save placeholder to database
    await db.collection('decks').insertOne(placeholderDeck);
    
    // Return the placeholder deck immediately
    res.json({ 
      deck: placeholderDeck,
      status: 'placeholder_created',
      message: 'Placeholder deck created, generation started in background'
    });

    // Generate deck asynchronously in background
    generateDeckInBackground({ prompt, categoryName, cardCount, model }, placeholderDeck._id, db);
    
  } catch (error) {
    console.error('Error creating placeholder deck:', error);
    res.status(500).json({ error: 'Failed to create placeholder deck' });
  }
});

app.post('/api/decks/:id/retry', async (req: Request, res: Response): Promise<void> => {
  try {
    const deckId = req.params.id;
    
    // Find the error deck
    const errorDeck = await db.collection('decks').findOne({ _id: deckId } as any);
    if (!errorDeck) {
      res.status(404).json({ error: 'Deck not found' });
      return;
    }
    
    if (errorDeck.status !== 'error') {
      res.status(400).json({ error: 'Deck is not in error status' });
      return;
    }
    
    if (!errorDeck.originalPrompt) {
      res.status(400).json({ error: 'No original prompt found for retry' });
      return;
    }
    
    console.log(`Manual retry requested for deck: ${deckId} - "${errorDeck.originalPrompt}"`);
    
    // Reset deck status to generating
    await db.collection('decks').updateOne(
      { _id: deckId } as any,
      {
        $set: {
          status: 'generating',
          description: `AI is retrying deck generation: "${errorDeck.originalPrompt}"`,
          emoji: '⏳'
        }
      }
    );
    
    // Start background generation for this deck
    const request: GenerateDeckRequest = {
      prompt: errorDeck.originalPrompt,
      categoryName: errorDeck.name !== 'Generating...' ? errorDeck.name : undefined,
      cardCount: 50, // Default card count
      model: undefined
    };
    
    // Start retry in background
    generateDeckInBackground(request, deckId.toString(), db).catch(err => {
      console.error(`Failed to restart generation for deck ${deckId}:`, err);
    });
    
    res.json({ 
      status: 'retry_started',
      message: 'Deck retry started in background'
    });
    
  } catch (error) {
    console.error('Error retrying deck:', error);
    res.status(500).json({ error: 'Failed to retry deck generation' });
  }
});

// Async function to generate deck in background and update placeholder
async function generateDeckInBackground(
  request: GenerateDeckRequest, 
  placeholderDeckId: string,
  db: Db
): Promise<void> {
  // @ts-ignore - Temporarily disable type checking for MongoDB operations
  console.log(`Starting background generation for deck: ${placeholderDeckId}`);
  
  let retryAttempt = 0;
  const maxContinuousRetries = 20; // Maximum total attempts before giving up
  const retryDelay = 5000; // 5 seconds between retry cycles
  
  while (retryAttempt < maxContinuousRetries) {
    try {
      console.log(`Deck generation cycle ${retryAttempt + 1}/${maxContinuousRetries} for: ${placeholderDeckId}`);
      
      const result = await generateDeck(request);
      
      if (result.success) {
        // Update placeholder deck with generated content
        await db.collection('decks').updateOne(
          { _id: placeholderDeckId } as any,
          { 
            $set: { 
              name: result.deck.name,
              description: result.deck.description,
              emoji: result.deck.emoji,
              cards: result.deck.cards,
              status: 'ready',
              generatedAt: new Date().toISOString()
            }
          }
        );
        
        console.log(`Successfully generated deck after ${retryAttempt + 1} cycles: ${placeholderDeckId}`);
        return; // Success - exit the retry loop
      }
      
      // If generation failed, log and continue to retry
      console.log(`Generation failed on cycle ${retryAttempt + 1}, retrying: ${result.error}`);
      
    } catch (error) {
      console.error(`Error in generation cycle ${retryAttempt + 1} for ${placeholderDeckId}:`, error);
    }
    
    retryAttempt++;
    
    // Wait before next retry cycle (unless this was the last attempt)
    if (retryAttempt < maxContinuousRetries) {
      console.log(`Waiting ${retryDelay}ms before next generation cycle...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // All retry attempts exhausted - mark as error
  console.error(`All ${maxContinuousRetries} generation cycles failed for deck: ${placeholderDeckId}`);
  try {
    await db.collection('decks').updateOne(
      { _id: placeholderDeckId } as any,
      { 
        $set: { 
          status: 'error',
          description: `Failed to generate deck after ${maxContinuousRetries} attempts`,
          emoji: '❌'
        }
      }
    );
  } catch (updateError) {
    console.error('Failed to update deck with final error status:', updateError);
  }
}

// Configure HTTP server timeouts
httpServer.keepAliveTimeout = 180000; // 3 minutes
httpServer.headersTimeout = 185000; // Slightly longer than keepAliveTimeout

// Background service to automatically retry error decks
async function startErrorDeckRetryService(): Promise<void> {
  console.log('Starting error deck retry service...');
  
  const retryErrorDecks = async () => {
    try {
      // Find all decks with error status
      const errorDecks = await db.collection('decks').find({ status: 'error' }).toArray();
      
      if (errorDecks.length > 0) {
        console.log(`Found ${errorDecks.length} error deck(s) to retry`);
        
        for (const errorDeck of errorDecks) {
          console.log(`Retrying error deck: ${errorDeck._id} - "${errorDeck.originalPrompt}"`);
          
          // Reset deck status to generating
          await db.collection('decks').updateOne(
            { _id: errorDeck._id } as any,
            {
              $set: {
                status: 'generating',
                description: `AI is retrying deck generation: "${errorDeck.originalPrompt}"`,
                emoji: '⏳'
              }
            }
          );
          
          // Start background generation for this deck
          const request: GenerateDeckRequest = {
            prompt: errorDeck.originalPrompt,
            categoryName: errorDeck.name !== 'Generating...' ? errorDeck.name : undefined,
            cardCount: 50, // Default card count
            model: undefined
          };
          
          // Start retry in background (don't await to allow parallel processing)
          generateDeckInBackground(request, errorDeck._id.toString(), db).catch(err => {
            console.error(`Failed to restart generation for deck ${errorDeck._id.toString()}:`, err);
          });
        }
      }
    } catch (error) {
      console.error('Error in retry service:', error);
    }
  };
  
  // Initial retry on startup
  setTimeout(retryErrorDecks, 5000); // Wait 5 seconds after startup
  
  // Periodic retry every 10 minutes
  setInterval(retryErrorDecks, 10 * 60 * 1000);
}

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`WebSocket server ready for connections`);
  console.log(`Request timeout: 3 minutes`);
});