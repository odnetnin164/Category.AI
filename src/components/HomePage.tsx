import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';
import { Deck } from '../types';
import './HomePage.css';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryingDecks, setRetryingDecks] = useState<Set<string>>(new Set());
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [deletingDecks, setDeletingDecks] = useState<Set<string>>(new Set());
  const optionsMenuRef = useRef<HTMLDivElement>(null);

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

    const updateGeneratingDecks = async () => {
      try {
        setDecks(prevDecks => {
          // Find decks that need updates (generating or error status)
          const decksToUpdate = prevDecks.filter(deck => 
            deck.status === 'generating' || deck.status === 'error'
          );
          
          if (decksToUpdate.length === 0) {
            return prevDecks; // No decks to update
          }
          
          // Fetch updates for these specific decks
          const deckIds = decksToUpdate.map(deck => deck.id);
          apiService.getUpdatedDecks(deckIds).then(updatedDecks => {
            if (updatedDecks.length > 0) {
              setDecks(currentDecks => {
                let hasChanges = false;
                const newDecks = currentDecks.map(deck => {
                  const updatedDeck = updatedDecks.find(uDeck => uDeck.id === deck.id);
                  if (updatedDeck) {
                    // Check if there's actually a change
                    if (deck.status !== updatedDeck.status || 
                        deck.name !== updatedDeck.name ||
                        deck.description !== updatedDeck.description ||
                        deck.cards.length !== updatedDeck.cards.length) {
                      hasChanges = true;
                      return updatedDeck;
                    }
                  }
                  return deck;
                });
                
                return hasChanges ? newDecks : currentDecks;
              });
            }
          }).catch(err => {
            console.error('Error updating generating decks:', err);
          });
          
          return prevDecks; // Return original state immediately
        });
      } catch (err) {
        console.error('Error in updateGeneratingDecks:', err);
      }
    };

    // Initial fetch of all decks
    fetchDecks();
    
    // Set up periodic refresh for only generating decks
    const interval = setInterval(updateGeneratingDecks, 3000); // Check every 3 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Handle click outside to close options menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target as Node)) {
        setShowOptionsMenu(null);
      }
    };

    if (showOptionsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptionsMenu]);

  // Handle navigation from create page - trigger immediate update to show new placeholder
  useEffect(() => {
    if (location.state?.fromCreate) {
      // Small delay to ensure backend has created the placeholder
      setTimeout(async () => {
        try {
          const generatingDecks = await apiService.getGeneratingDecks();
          if (generatingDecks.length > 0) {
            setDecks(prevDecks => {
              const newDecks = [...prevDecks];
              generatingDecks.forEach(newDeck => {
                if (!newDecks.find(deck => deck.id === newDeck.id)) {
                  newDecks.push(newDeck);
                }
              });
              return newDecks;
            });
          }
        } catch (err) {
          console.error('Error fetching new placeholder deck:', err);
        }
      }, 500);
    }
  }, [location.state]);

  const handleDeckSelect = (deck: Deck) => {
    // Don't allow clicking on generating or error decks
    if (deck.status === 'generating' || deck.status === 'error') {
      return;
    }
    navigate(`/deck/${deck.id}`);
  };

  const handleRetryDeck = async (deck: Deck) => {
    if (retryingDecks.has(deck.id)) {
      return; // Already retrying
    }
    
    setRetryingDecks(prev => new Set(prev).add(deck.id));
    setShowOptionsMenu(null); // Close options menu
    
    try {
      await apiService.retryDeck(deck.id);
      console.log(`Retry started for deck: ${deck.id}`);
      
      // Update the deck status immediately for better UX
      setDecks(prevDecks => 
        prevDecks.map(d => 
          d.id === deck.id 
            ? { ...d, status: 'generating' as const, emoji: '⏳' }
            : d
        )
      );
    } catch (error) {
      console.error('Failed to retry deck:', error);
      setError(`Failed to retry deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setRetryingDecks(prev => {
        const newSet = new Set(prev);
        newSet.delete(deck.id);
        return newSet;
      });
    }
  };

  const handleDeleteDeck = async (deck: Deck) => {
    if (deletingDecks.has(deck.id)) {
      return; // Already deleting
    }
    
    setDeletingDecks(prev => new Set(prev).add(deck.id));
    setShowOptionsMenu(null); // Close options menu
    
    try {
      await apiService.deleteDeck(deck.id);
      console.log(`Deck deleted: ${deck.id}`);
      
      // Remove the deck from the list immediately
      setDecks(prevDecks => prevDecks.filter(d => d.id !== deck.id));
    } catch (error) {
      console.error('Failed to delete deck:', error);
      setError(`Failed to delete deck: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setDeletingDecks(prev => {
        const newSet = new Set(prev);
        newSet.delete(deck.id);
        return newSet;
      });
    }
  };

  const getDeckStatus = (deck: Deck) => {
    switch (deck.status) {
      case 'generating':
        return { text: 'Generating...', class: 'status-generating' };
      case 'error':
        return { text: 'Error', class: 'status-error' };
      case 'ready':
      default:
        return null;
    }
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
        {decks.map((deck) => {
          const status = getDeckStatus(deck);
          const isDisabled = deck.status === 'generating' || deck.status === 'error';
          const isRetrying = retryingDecks.has(deck.id);
          const isDeleting = deletingDecks.has(deck.id);
          const showGear = deck.status === 'error' || deck.status === 'ready';
          
          return (
            <div 
              key={deck.id} 
              className={`deck-card ${isDisabled ? 'deck-disabled' : ''} ${status?.class || ''}`}
              onClick={() => handleDeckSelect(deck)}
            >
              {showGear && (
                <div className="options-menu" ref={optionsMenuRef}>
                  <button 
                    className="options-gear" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowOptionsMenu(showOptionsMenu === deck.id ? null : deck.id);
                    }}
                    aria-label="Options"
                  >
                    ⚙️
                  </button>
                  {showOptionsMenu === deck.id && (
                    <div className="options-dropdown">
                      {deck.status === 'error' && (
                        <button 
                          className="retry-option" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRetryDeck(deck);
                          }}
                          disabled={isRetrying}
                        >
                          🔄 {isRetrying ? 'Retrying...' : 'Retry'}
                        </button>
                      )}
                      <button 
                        className="delete-option" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDeck(deck);
                        }}
                        disabled={isDeleting}
                      >
                        🗑️ {isDeleting ? 'Deleting...' : 'Delete Deck'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              <div className="deck-emoji">{deck.emoji}</div>
              <h3 className="deck-name">{deck.name}</h3>
              <p className="deck-description">{deck.description}</p>
              <div className="deck-info">
                {status ? (
                  <span className="deck-status">{status.text}</span>
                ) : (
                  <span>{deck.cards.length} cards</span>
                )}
              </div>
              {deck.status === 'generating' && (
                <div className="generating-spinner">⏳</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;