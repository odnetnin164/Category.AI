import React, { useState, useEffect, useRef } from 'react';
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(false);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

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

  const handleDeleteDeck = async () => {
    if (!deck || !deckId) return;
    
    try {
      setDeleting(true);
      await apiService.deleteDeck(deckId);
      navigate('/');
    } catch (err) {
      setError('Failed to delete deck. Please try again.');
      console.error('Error deleting deck:', err);
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="deck-details">
      <div className="deck-details-card">
        <div className="options-menu" ref={optionsMenuRef}>
          <button 
            className="options-gear" 
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            aria-label="Options"
          >
            ⚙️
          </button>
          {showOptionsMenu && (
            <div className="options-dropdown">
              <button 
                className="delete-option" 
                onClick={() => {
                  setShowDeleteConfirm(true);
                  setShowOptionsMenu(false);
                }}
                disabled={deleting}
              >
                🗑️ Delete Deck
              </button>
            </div>
          )}
        </div>
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

      {showDeleteConfirm && (
        <div className="delete-confirmation">
          <div className="delete-modal">
            <h3>Delete Deck?</h3>
            <p>Are you sure you want to delete "{deck.name}"? This action cannot be undone.</p>
            <div className="delete-actions">
              <button 
                className="confirm-delete" 
                onClick={handleDeleteDeck}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                className="cancel-delete" 
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckDetails;