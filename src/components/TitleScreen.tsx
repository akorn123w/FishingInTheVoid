import React from 'react';

interface TitleScreenProps {
    onStart: () => void;
}

const TitleScreen: React.FC<TitleScreenProps> = ({ onStart }) => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: '#1a1a1a',
                color: '#ffffff',
            }}
        >
            <h1
                style={{
                    fontSize: '4rem',
                    marginBottom: '2rem',
                    textShadow: '0 0 20px rgba(74, 144, 226, 0.8)',
                }}
            >
                Fishing In The Void
            </h1>
            <button
                onClick={onStart}
                style={{
                    padding: '1rem 3rem',
                    fontSize: '1.5rem',
                    color: '#ffffff',
                    background: 'transparent',
                    border: '3px solid #4a90e2',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.background = '#4a90e2';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
            >
                Start
            </button>
        </div>
    );
};

export default TitleScreen;