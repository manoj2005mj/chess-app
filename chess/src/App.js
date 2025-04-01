import React, { useState } from 'react';
import './App.css';
import ChessGame from './components/ChessGame';
import ChessGame1 from './components/ChessGame1';

function App() {
  const [gameMode, setGameMode] = useState(null);
  const [apiKey, setApiKey] = useState('');

  const handleModeSelect = (mode) => {
    setGameMode(mode);
  };

  const handleApiKeySubmit = (e) => {
    e.preventDefault();
    setGameMode('llm');
  };

  if (!gameMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl mb-8">Choose Game Mode</h1>
        <div className="space-y-4">
          <button
            onClick={() => handleModeSelect('friend')}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-xl"
          >
            Play with a Friend
          </button>
          <button
            onClick={() => handleModeSelect('llm')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 text-xl block w-full"
          >
            Play with LLM
          </button>
        </div>
      </div>
    );
  }

  if (gameMode === 'llm' && !apiKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handleApiKeySubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Enter your Google GenAI API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="px-4 py-2 border rounded-lg w-80"
            required
          />
          <div className="flex space-x-4">
            <button
              type="submit"
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              Start Game
            </button>
            <button
              onClick={() => setGameMode(null)}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="App">
      {gameMode === 'friend' ? (
        <ChessGame />
      ) : (
        <ChessGame1 apiKey={apiKey} />
      )}
    </div>
  );
}

export default App;