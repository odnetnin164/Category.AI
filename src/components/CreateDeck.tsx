import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import './CreateDeck.css';

const CreateDeck: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [formData, setFormData] = useState({
    prompt: '',
    categoryName: '',
    cardCount: 20,
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
      alert('Please enter a prompt for the deck');
      return;
    }

    setIsGenerating(true);
    
    try {
      const newDeck = await apiService.generateDeck({
        prompt: formData.prompt,
        categoryName: formData.categoryName || undefined,
        cardCount: formData.cardCount,
        model: formData.model || undefined
      });
      
      // Navigate to the newly created deck
      navigate(`/deck/${newDeck.id}`);
    } catch (error) {
      console.error('Error generating deck:', error);
      alert('Failed to generate deck. Please try again.');
    } finally {
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

      {isGenerating && (
        <div className="generation-status">
          <p>🤖 AI is creating your deck...</p>
          <p>This may take 30-60 seconds</p>
        </div>
      )}
    </div>
  );
};

export default CreateDeck;