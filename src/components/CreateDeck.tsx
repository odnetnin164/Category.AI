import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './CreateDeck.css';

const CreateDeck: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [formData, setFormData] = useState({
    prompt: '',
    categoryName: '',
    cardCount: 50, // Default to 50 cards
    model: ''
  });


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

    setIsGenerating(true);
    setErrorMessage('');
    
    try {
      const response = await apiService.startDeckGeneration({
        prompt: formData.prompt,
        categoryName: formData.categoryName || undefined,
        cardCount: formData.cardCount,
        model: formData.model || undefined
      });
      
      // Redirect to home page immediately after placeholder creation
      navigate('/', { state: { fromCreate: true } });
      
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
          <p>🤖 Creating placeholder deck...</p>
          <p>You'll be redirected to the home page shortly</p>
        </div>
      )}
    </div>
  );
};

export default CreateDeck;