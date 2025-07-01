import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card, GameResult, Deck } from '../types';
import './GamePage.css';

const GamePage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  
  const [deck, setDeck] = useState<Deck | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shuffledCards, setShuffledCards] = useState<Card[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [gameResults, setGameResults] = useState<GameResult[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameState, setGameState] = useState<'countdown' | 'playing' | 'finished'>('countdown');
  const [countdownValue, setCountdownValue] = useState(3);
  const [actionFeedback, setActionFeedback] = useState<'CORRECT' | 'PASS' | null>(null);
  const [isActionCooldown, setIsActionCooldown] = useState(false);
  const [orientationData, setOrientationData] = useState<{alpha: number, beta: number, gamma: number}>({alpha: 0, beta: 0, gamma: 0});
  const cooldownRef = useRef(false);
  const correctSoundRef = useRef<HTMLAudioElement | null>(null);
  const passSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Initialize audio files
    correctSoundRef.current = new Audio('/correct.mp3');
    passSoundRef.current = new Audio('/pass.mp3');
    
    // Preload audio files
    correctSoundRef.current.preload = 'auto';
    passSoundRef.current.preload = 'auto';

    const fetchDeck = async () => {
      if (!deckId) {
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const fetchedDeck = await apiService.getDeck(deckId);
        if (!fetchedDeck) {
          navigate('/');
          return;
        }
        setDeck(fetchedDeck);
        const shuffled = [...fetchedDeck.cards].sort(() => Math.random() - 0.5);
        setShuffledCards(shuffled);
      } catch (err) {
        setError('Failed to load deck');
        console.error('Error fetching deck:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeck();
  }, [deckId, navigate]);

  // Fullscreen functionality
  useEffect(() => {
    const enterFullscreen = async () => {
      if (gameState === 'playing') {
        try {
          if (document.documentElement.requestFullscreen) {
            await document.documentElement.requestFullscreen();
          } else if ((document.documentElement as any).webkitRequestFullscreen) {
            await (document.documentElement as any).webkitRequestFullscreen();
          } else if ((document.documentElement as any).msRequestFullscreen) {
            await (document.documentElement as any).msRequestFullscreen();
          }
        } catch (err) {
          console.log('Fullscreen not supported or denied:', err);
        }
      }
    };

    const exitFullscreen = async () => {
      if (gameState !== 'playing') {
        try {
          if (document.exitFullscreen) {
            await document.exitFullscreen();
          } else if ((document as any).webkitExitFullscreen) {
            await (document as any).webkitExitFullscreen();
          } else if ((document as any).msExitFullscreen) {
            await (document as any).msExitFullscreen();
          }
        } catch (err) {
          console.log('Exit fullscreen failed:', err);
        }
      }
    };

    if (gameState === 'playing') {
      enterFullscreen();
    } else {
      exitFullscreen();
    }

    // Cleanup on component unmount
    return () => {
      if (gameState === 'playing') {
        exitFullscreen();
      }
    };
  }, [gameState]);

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
    if (gameState !== 'playing' || currentCardIndex >= shuffledCards.length || cooldownRef.current) return;

    const currentCard = shuffledCards[currentCardIndex];
    const result: GameResult = {
      card: currentCard,
      result: action
    };

    // Play sound effect
    try {
      if (action === 'correct' && correctSoundRef.current) {
        correctSoundRef.current.currentTime = 0;
        correctSoundRef.current.play().catch(e => console.log('Sound play failed:', e));
      } else if (action === 'pass' && passSoundRef.current) {
        passSoundRef.current.currentTime = 0;
        passSoundRef.current.play().catch(e => console.log('Sound play failed:', e));
      }
    } catch (e) {
      console.log('Sound error:', e);
    }

    // Trigger vibration
    if ('vibrate' in navigator) {
      if (action === 'correct') {
        // Short, positive vibration pattern for correct
        navigator.vibrate([100, 50, 100]);
      } else {
        // Single longer vibration for pass
        navigator.vibrate([200]);
      }
    }

    setGameResults(prev => [...prev, result]);
    setActionFeedback(action === 'correct' ? 'CORRECT' : 'PASS');
    setIsActionCooldown(true);
    cooldownRef.current = true;

    setTimeout(() => {
      setActionFeedback(null);
      setCurrentCardIndex(prev => prev + 1);
      setIsActionCooldown(false);
      cooldownRef.current = false;
    }, 800);
  }, [gameState, currentCardIndex, shuffledCards]);

  const handleSkipToEnd = useCallback(() => {
    if (gameState !== 'playing') return;
    
    setGameState('finished');
    navigate(`/score/${deckId}`, { 
      state: { 
        results: gameResults, 
        deck: deck,
        totalTime: 60 - timeLeft 
      } 
    });
  }, [gameState, gameResults, deck, deckId, timeLeft, navigate]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    const handleDeviceOrientation = (event: any) => {
      const alpha = event.alpha || 0;
      const beta = event.beta || 0;
      const gamma = event.gamma || 0;
      
      setOrientationData({ alpha, beta, gamma });
      
      // Only trigger actions if not in cooldown
      // Gamma ranges from -90 to +90. When horizontal, we're near the extremes
      if (!cooldownRef.current) {
        if (gamma < 50 && gamma > 0) {
          handleCardAction('correct');
        } else if (gamma > -50 && gamma < 0) {
          handleCardAction('pass');
        }
      }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        handleCardAction('correct');
      } else if (event.key === 'ArrowUp') {
        handleCardAction('pass');
      }
    };

    const requestOrientationPermission = async () => {
      if (!('DeviceOrientationEvent' in window)) {
        console.log('DeviceOrientationEvent not supported');
        return;
      }

      if (typeof (window as any).DeviceOrientationEvent.requestPermission === 'function') {
        try {
          const permission = await (window as any).DeviceOrientationEvent.requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleDeviceOrientation, true);
          }
        } catch (error) {
          console.log('DeviceOrientation permission denied');
          window.addEventListener('deviceorientation', handleDeviceOrientation, true);
        }
      } else {
        window.addEventListener('deviceorientation', handleDeviceOrientation, true);
      }
    };

    requestOrientationPermission();
    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('deviceorientation', handleDeviceOrientation);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [gameState, handleCardAction]);

  if (loading) {
    return (
      <div className="game-page">
        <div className="loading">Loading game...</div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="game-page">
        <div className="error">{error || 'Deck not found'}</div>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
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
        <button className="skip-button" onClick={handleSkipToEnd}>End Game</button>
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

      <div className="debug-menu">
        <div className="debug-title">Sensors</div>
        <div className="debug-item">
          <span className="debug-label">Alpha:</span>
          <span className="debug-value">{orientationData.alpha.toFixed(1)}°</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Beta:</span>
          <span className="debug-value">{orientationData.beta.toFixed(1)}°</span>
        </div>
        <div className="debug-item">
          <span className="debug-label">Gamma:</span>
          <span className="debug-value">{orientationData.gamma.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
};

export default GamePage;