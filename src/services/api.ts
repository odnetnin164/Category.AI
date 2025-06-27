import { Deck } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001';

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
  }
};