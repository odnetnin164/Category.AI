import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Deck } from '../types';
import './DeckDetails.css';

const DeckDetails: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDeck = async () => {
      if (!deckId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const fetchedDeck = await apiService.getDeck(deckId);
        if (!fetchedDeck) {
          setError('Deck not found');
        } else {
          setDeck(fetchedDeck);
        }
      } catch (err) {
        setError('Failed to load deck. Please try again.');
        console.error('Error fetching deck:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, navigate]);

  if (loading) {
    return (
      <div className="deck-details">
        <div className="loading">Loading deck...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="deck-details">
        <h1>{error || 'Deck not found'}</h1>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const handleStartGame = () => {
    navigate(`/game/${deck.id}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="deck-details">
      <div className="deck-details-card">
        <div className="deck-header">
          <div className="deck-emoji-large">{deck.emoji}</div>
          <h1 className="deck-title">{deck.name}</h1>
          <p className="deck-desc">{deck.description}</p>
        </div>
        
        <div className="deck-stats">
          <div className="stat">
            <div className="stat-number">{deck.cards.length}</div>
            <div className="stat-label">Cards</div>
          </div>
          <div className="stat">
            <div className="stat-number">60</div>
            <div className="stat-label">Seconds</div>
          </div>
        </div>

        <div className="game-instructions">
          <h3>How to Play:</h3>
          <ul>
            <li>Hold your phone horizontally above your forehead</li>
            <li>Tilt down if you guess correctly ✅</li>
            <li>Tilt up if you want to pass ❌</li>
            <li>You have 60 seconds to get as many as possible!</li>
          </ul>
        </div>

        <div className="action-buttons">
          <button className="start-button" onClick={handleStartGame}>
            🎮 Start Game
          </button>
          <button className="back-button" onClick={handleGoHome}>
            ← Back to Decks
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckDetails;