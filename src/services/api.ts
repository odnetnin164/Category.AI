import { Deck } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://localhost';

export interface GenerateDeckRequest {
  prompt: string;
  categoryName?: string;
  cardCount?: number;
  model?: string;
}

export const apiService = {
  async getDecks(): Promise<Deck[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/decks`);
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      const decks = await response.json();
      // Convert MongoDB _id to id for compatibility
      return decks.map((deck: any) => ({
        ...deck,
        id: deck._id,
        cards: deck.cards.map((card: any) => ({
          ...card,
          id: card.id.toString()
        }))
      }));
    } catch (error) {
      console.error('Error fetching decks:', error);
      throw error;
    }
  },

  async getUpdatedDecks(deckIds: string[]): Promise<Deck[]> {
    try {
      if (deckIds.length === 0) {
        return [];
      }
      
      const response = await fetch(`${API_BASE_URL}/api/decks`);
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      const decks = await response.json();
      
      // Filter only the specific deck IDs we want to update
      return decks
        .filter((deck: any) => deckIds.includes(deck._id))
        .map((deck: any) => ({
          ...deck,
          id: deck._id,
          cards: deck.cards.map((card: any) => ({
            ...card,
            id: card.id.toString()
          }))
        }));
    } catch (error) {
      console.error('Error fetching updated decks:', error);
      return []; // Return empty array on error to not break the UI
    }
  },

  async getGeneratingDecks(): Promise<Deck[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/decks`);
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      const decks = await response.json();
      // Filter only generating and error decks and convert format
      return decks
        .filter((deck: any) => deck.status === 'generating' || deck.status === 'error')
        .map((deck: any) => ({
          ...deck,
          id: deck._id,
          cards: deck.cards.map((card: any) => ({
            ...card,
            id: card.id.toString()
          }))
        }));
    } catch (error) {
      console.error('Error fetching generating decks:', error);
      return []; // Return empty array on error to not break the UI
    }
  },

  async getDeck(id: string): Promise<Deck | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/decks/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch deck');
      }
      const deck = await response.json();
      // Convert MongoDB _id to id for compatibility
      return {
        ...deck,
        id: deck._id,
        cards: deck.cards.map((card: any) => ({
          ...card,
          id: card.id.toString()
        }))
      };
    } catch (error) {
      console.error('Error fetching deck:', error);
      throw error;
    }
  },

  async startDeckGeneration(request: GenerateDeckRequest): Promise<{ deck: any; status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/decks/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to start deck generation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error starting deck generation:', error);
      throw error;
    }
  },

  async retryDeck(deckId: string): Promise<{ status: string; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/decks/${deckId}/retry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to retry deck generation');
      }

      return await response.json();
    } catch (error) {
      console.error('Error retrying deck:', error);
      throw error;
    }
  },

  // Keep the old method for backward compatibility, but deprecated
  async generateDeck(request: GenerateDeckRequest): Promise<Deck> {
    console.warn('generateDeck is deprecated. Use startDeckGeneration with WebSocket events instead.');
    try {
      const response = await fetch(`${API_BASE_URL}/api/decks/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate deck');
      }

      const deck = await response.json();
      // Convert MongoDB _id to id for compatibility
      return {
        ...deck,
        id: deck._id,
        cards: deck.cards.map((card: any) => ({
          ...card,
          id: card.id.toString()
        }))
      };
    } catch (error) {
      console.error('Error generating deck:', error);
      throw error;
    }
  }
};