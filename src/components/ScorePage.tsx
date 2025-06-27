import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { GameResult, Deck } from '../types';
import './ScorePage.css';

interface ScorePageState {
  results: GameResult[];
  deck: Deck;
  totalTime: number;
}

const ScorePage: React.FC = () => {
  const navigate = useNavigate();
  const { deckId } = useParams<{ deckId: string }>();
  const location = useLocation();
  const state = location.state as ScorePageState;

  if (!state || !state.results || !state.deck) {
    return (
      <div className="score-page">
        <div className="score-error">
          <h1>No game data found</h1>
          <button onClick={() => navigate('/')}>Go Home</button>
        </div>
      </div>
    );
  }

  const { results, deck, totalTime } = state;
  const correctAnswers = results.filter(r => r.result === 'correct');
  const passedAnswers = results.filter(r => r.result === 'pass');
  const accuracy = results.length > 0 ? Math.round((correctAnswers.length / results.length) * 100) : 0;

  const handlePlayAgain = () => {
    navigate(`/game/${deckId}`);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleBackToDeck = () => {
    navigate(`/deck/${deckId}`);
  };

  return (
    <div className="score-page">
      <div className="score-container">
        <div className="score-header">
          <div className="deck-info">
            <div className="deck-emoji">{deck.emoji}</div>
            <h1>{deck.name}</h1>
          </div>
          <div className="final-score">
            <div className="score-number">{correctAnswers.length}</div>
            <div className="score-label">Correct</div>
          </div>
        </div>

        <div className="score-stats">
          <div className="stat">
            <div className="stat-value">{correctAnswers.length}</div>
            <div className="stat-label">Correct</div>
          </div>
          <div className="stat">
            <div className="stat-value">{passedAnswers.length}</div>
            <div className="stat-label">Passed</div>
          </div>
          <div className="stat">
            <div className="stat-value">{accuracy}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
          <div className="stat">
            <div className="stat-value">{totalTime}s</div>
            <div className="stat-label">Time</div>
          </div>
        </div>

        <div className="results-section">
          <h2>Game Results</h2>
          <div className="results-list">
            {results.map((result, index) => (
              <div key={index} className={`result-item ${result.result}`}>
                <div className="result-icon">
                  {result.result === 'correct' ? '✅' : '❌'}
                </div>
                <div className="result-text">{result.card.text}</div>
                <div className="result-status">
                  {result.result === 'correct' ? 'Correct' : 'Passed'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="action-buttons">
          <button className="play-again-button" onClick={handlePlayAgain}>
            🎮 Play Again
          </button>
          <button className="deck-button" onClick={handleBackToDeck}>
            📋 Back to Deck
          </button>
          <button className="home-button" onClick={handleGoHome}>
            🏠 Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScorePage;