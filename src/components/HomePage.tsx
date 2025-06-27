import React from 'react';
import { useNavigate } from 'react-router-dom';
import { decks } from '../data/decks';
import { Deck } from '../types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const handleDeckSelect = (deck: Deck) => {
    navigate(`/deck/${deck.id}`);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🎯 Category.AI</h1>
        <p>Choose a deck to start playing</p>
      </header>
      
      <div className="deck-grid">
        {decks.map((deck) => (
          <div 
            key={deck.id} 
            className="deck-card"
            onClick={() => handleDeckSelect(deck)}
          >
            <div className="deck-emoji">{deck.emoji}</div>
            <h3 className="deck-name">{deck.name}</h3>
            <p className="deck-description">{deck.description}</p>
            <div className="deck-info">
              {deck.cards.length} cards
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage;