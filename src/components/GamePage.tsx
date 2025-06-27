import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { decks } from '../data/decks';
import { Card, GameResult } from '../types';
import './GamePage.css';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const [deck] = useState(() => decks.find(d => d.id === deckId));
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdownValue, setCountdownValue] = useState(3);
  const [actionFeedback, setActionFeedback] = useState<'CORRECT' | 'PASS' | null>(null);
  const [isActionCooldown, setIsActionCooldown] = useState(false);

  useEffect(() => {
    if (!deck) {
      navigate('/');
      return;
    }

    const shuffled = [...deck.cards].sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [deck, navigate]);

  useEffect(() => {
    if (gameState === 'countdown') {
      const timer = setTimeout(() => {
        if (countdownValue > 1) {
          setCountdownValue(countdownValue - 1);
        } else {
          setGameState('playing');
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdownValue, gameState]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameState('finished');
      navigate(`/score/${deckId}`, { 
        state: { 
          results: gameResults, 
          deck: deck,
          totalTime: 60 
        } 
      });
    }
  }, [gameState, timeLeft, gameResults, deck, deckId, navigate]);

  useEffect(() => {
    if (gameState === 'playing' && currentCardIndex >= shuffledCards.length && shuffledCards.length > 0) {
      setGameState('finished');
      navigate(`/score/${deckId}`, { 
        state: { 
          results: gameResults, 
          deck: deck,
          totalTime: 60 - timeLeft 
        } 
      });
    }
  }, [currentCardIndex, shuffledCards.length, gameState, gameResults, deck, deckId, timeLeft, navigate]);

  const handleCardAction = useCallback((action: 'correct' | 'pass') => {
    if (gameState !== 'playing' || currentCardIndex >= shuffledCards.length || isActionCooldown) return;

    const currentCard = shuffledCards[currentCardIndex];
    const result: GameResult = {
      card: currentCard,
      result: action
    };

    setGameResults(prev => [...prev, result]);
    setActionFeedback(action === 'correct' ? 'CORRECT' : 'PASS');
    setIsActionCooldown(true);

    setTimeout(() => {
      setActionFeedback(null);
      setCurrentCardIndex(prev => prev + 1);
      setIsActionCooldown(false);
    }, 800);
  }, [gameState, currentCardIndex, shuffledCards, isActionCooldown]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
      const beta = event.beta || 0;
      
      if (beta > 45) {
        handleCardAction('correct');
      } else if (beta < -20) {
        handleCardAction('pass');
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        handleCardAction('correct');
      } else if (event.key === 'ArrowUp') {
        handleCardAction('pass');
      }
    };

    window.addEventListener('deviceorientation', handleDeviceOrientation);
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, handleCardAction]);

  if (!deck) {
    return <div>Loading...</div>;
  }

  if (gameState === 'countdown') {
    return (
      <div className="game-page countdown-screen">
        <div className="countdown-content">
          <h1>Get Ready!</h1>
          <div className="countdown-number">{countdownValue}</div>
          <p>Hold your phone horizontally above your forehead</p>
          <div className="tilt-instructions">
            <div className="tilt-instruction">
              <div className="tilt-arrow">↓</div>
              <div>Tilt DOWN for CORRECT</div>
            </div>
            <div className="tilt-instruction">
              <div className="tilt-arrow">↑</div>
              <div>Tilt UP to PASS</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentCardIndex >= shuffledCards.length) {
    return (
      <div className="game-page">
        <div className="game-finished">
          <h1>All cards completed!</h1>
          <p>Redirecting to results...</p>
        </div>
      </div>
    );
  }

  const currentCard = shuffledCards[currentCardIndex];

  return (
    <div className={`game-page ${actionFeedback ? `feedback-${actionFeedback.toLowerCase()}` : ''}`}>
      <div className="game-header">
        <div className="timer">{timeLeft}s</div>
        <div className="score">{gameResults.filter(r => r.result === 'correct').length}/{gameResults.length}</div>
      </div>

      <div className="card-display">
        {actionFeedback ? (
          <div className="action-feedback">
            {actionFeedback}
          </div>
        ) : (
          <div className="current-card">
            {currentCard.text}
          </div>
        )}
      </div>


      <div className="debug-controls">
        <button onClick={() => handleCardAction('correct')}>✓ Correct</button>
        <button onClick={() => handleCardAction('pass')}>✗ Pass</button>
      </div>
    </div>
  );
};

export default GamePage;