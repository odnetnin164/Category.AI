export interface Card {
  id: string;
  text: string;
  info?: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  emoji: string;
  cards: Card[];
}

export interface GameResult {
  card: Card;
  result: 'correct' | 'pass';
}

export interface GameSession {
  deck: Deck;
  results: GameResult[];
  score: number;
  totalCards: number;
  timeElapsed: number;
}