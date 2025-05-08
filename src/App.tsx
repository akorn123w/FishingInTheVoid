import React, { useState, useEffect } from 'react';
import TitleScreen from './components/TitleScreen';
import LoadingScreen from './components/LoadingScreen';
import Game from './components/Game';
import audioManager from './utils/AudioManager';
import './App.css'

type GameState = 'title' | 'loading' | 'game';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('title');

  // Load sounds when the component mounts
  useEffect(() => {
    // Example of loading a sound file
    // Replace 'background-music.mp3' with your actual sound file
    audioManager.loadSound('background', '/sounds/background-music.mp3');
    audioManager.setLoop('background', true);
    audioManager.setVolume('background', 0.5);
  }, []);

  const handleStart = () => {
    setGameState('loading');
    // Play background music when game starts
    audioManager.play('background');
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