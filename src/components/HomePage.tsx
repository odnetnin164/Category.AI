import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Deck } from '../types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true);
        const fetchedDecks = await apiService.getDecks();
        setDecks(fetchedDecks);
      } catch (err) {
        setError('Failed to load decks. Please try again.');
        console.error('Error fetching decks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, []);

  const handleDeckSelect = (deck: Deck) => {
    navigate(`/deck/${deck.id}`);
  };

  if (loading) {
    return (
      <div className="home-page">
        <div className="loading">Loading decks...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-page">
        <div className="error">{error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <h1>🎯 Category.AI</h1>
        <p>Choose a deck to start playing</p>
        <button 
          className="create-deck-button"
          onClick={() => navigate('/create')}
        >
          ✨ Create New Deck
        </button>
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