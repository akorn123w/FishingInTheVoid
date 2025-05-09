import React, { useState, useEffect } from 'react';
import TitleScreen from './components/TitleScreen';
import LoadingScreen from './components/LoadingScreen';
import Game from './components/Game';
import './App.css'

type GameState = 'title' | 'loading' | 'game';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('title');

  const handleStart = () => {
    setGameState('loading');
    setTimeout(() => {
      setGameState('game');
    }, 2000);
  };

  return (
    <>
      {gameState === 'title' && <TitleScreen onStart={handleStart} />}
      {gameState === 'loading' && <LoadingScreen />}
      {gameState === 'game' && <Game />}
    </>
  );
};

export default App;