import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import CreateDeck from './components/CreateDeck';
import DeckDetails from './components/DeckDetails';
import GamePage from './components/GamePage';
import ScorePage from './components/ScorePage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateDeck />} />
          <Route path="/deck/:deckId" element={<DeckDetails />} />
          <Route path="/game/:deckId" element={<GamePage />} />
          <Route path="/score/:deckId" element={<ScorePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
