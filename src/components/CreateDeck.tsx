import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { socketService, DeckGenerationProgress, DeckGenerationComplete, DeckGenerationError } from '../services/socketService';
import './CreateDeck.css';

const CreateDeck: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<DeckGenerationProgress | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    prompt: '',
    categoryName: '',
    cardCount: 50, // Default to 50 cards
    model: ''
  });

  useEffect(() => {
    // Connect to WebSocket when component mounts
    const connectSocket = async () => {
      try {
        await socketService.connect();
        console.log('WebSocket connected successfully');
      } catch (error) {
        console.error('Failed to connect to WebSocket:', error);
        setErrorMessage('Failed to connect to server. Please refresh and try again.');
      }
    };

    connectSocket();

    // Setup event listeners
    const handleProgress = (data: DeckGenerationProgress) => {
      setGenerationProgress(data);
    };

    const handleComplete = (data: DeckGenerationComplete) => {
      setGenerationProgress({ stage: 'saving', message: data.message, progress: 100 });
      
      // Convert deck for compatibility
      const deck = {
        ...data.deck,
        id: data.deck._id,
        cards: data.deck.cards.map((card: any) => ({
          ...card,
          id: card.id.toString()
        }))
      };
      
      // Navigate to the newly created deck after a brief delay
      setTimeout(() => {
        navigate(`/deck/${deck.id}`);
      }, 1000);
    };

    const handleError = (data: DeckGenerationError) => {
      setIsGenerating(false);
      setGenerationProgress(null);
      setErrorMessage(data.error);
    };

    socketService.onDeckGenerationProgress(handleProgress);
    socketService.onDeckGenerationComplete(handleComplete);
    socketService.onDeckGenerationError(handleError);

    // Cleanup on component unmount
    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
    };
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'cardCount' ? parseInt(value) || 20 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.prompt.trim()) {
      setErrorMessage('Please enter a prompt for the deck');
      return;
    }

    if (!socketService.isSocketConnected()) {
      setErrorMessage('Not connected to server. Please refresh and try again.');
      return;
    }

    const socketId = socketService.getSocketId();
    if (!socketId) {
      setErrorMessage('WebSocket connection not ready. Please try again.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setGenerationProgress(null);
    
    try {
      await apiService.startDeckGeneration({
        prompt: formData.prompt,
        categoryName: formData.categoryName || undefined,
        cardCount: formData.cardCount,
        model: formData.model || undefined
      }, socketId);
      
      // The rest is handled by WebSocket events
    } catch (error) {
      console.error('Error starting deck generation:', error);
      setErrorMessage('Failed to start deck generation. Please try again.');
      setIsGenerating(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="create-deck-page">
      <header className="create-deck-header">
        <button className="back-button" onClick={handleCancel}>
          ← Back to Home
        </button>
        <h1>🎨 Create New Deck</h1>
        <p>Generate a custom deck using AI</p>
      </header>

      <form className="create-deck-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prompt">
            Category Name *
            <span className="field-description">What category should this deck be about?</span>
          </label>
          <textarea
            id="prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            placeholder="e.g., Famous movie directors, Types of programming languages, Countries in Europe..."
            rows={3}
            required
            disabled={isGenerating}
          />
        </div>

        <div className="advanced-options">
          <button
            type="button"
            className="advanced-toggle"
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={isGenerating}
          >
            ⚙️ Advanced Options {showAdvanced ? '▲' : '▼'}
          </button>

          {showAdvanced && (
            <div className="advanced-content">
              <div className="form-group">
                <label htmlFor="categoryName">
                  Custom Deck Name
                  <span className="field-description">Override the auto-generated deck name</span>
                </label>
                <input
                  type="text"
                  id="categoryName"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleInputChange}
                  placeholder="e.g., Movie Directors"
                  disabled={isGenerating}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="cardCount">
                    Number of Cards
                  </label>
                  <select
                    id="cardCount"
                    name="cardCount"
                    value={formData.cardCount}
                    onChange={handleInputChange}
                    disabled={isGenerating}
                  >
                    <option value={10}>10 cards</option>
                    <option value={15}>15 cards</option>
                    <option value={20}>20 cards</option>
                    <option value={25}>25 cards</option>
                    <option value={30}>30 cards</option>
                    <option value={50}>50 cards</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="model">
                    AI Model
                  </label>
                  <input
                    type="text"
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    placeholder="e.g., gpt-4, gpt-3.5-turbo"
                    disabled={isGenerating}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={handleCancel}
            disabled={isGenerating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="generate-button"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : (
              '✨ Generate Deck'
            )}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className="error-status">
          <p>❌ {errorMessage}</p>
        </div>
      )}

      {isGenerating && (
        <div className="generation-status">
          {generationProgress ? (
            <>
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${generationProgress.progress}%` }}
                  ></div>
                </div>
                <span className="progress-text">{generationProgress.progress}%</span>
              </div>
              <p>🤖 {generationProgress.message}</p>
              <p className="stage-info">Stage: {generationProgress.stage}</p>
            </>
          ) : (
            <>
              <p>🤖 Connecting to AI service...</p>
              <p>This may take a moment</p>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateDeck;