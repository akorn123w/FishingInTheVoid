import React from 'react';
import { StoreItem, STORE_ITEMS } from '../../constants/storeItems';

interface StoreProps {
    clickCount: number;
    onPurchase: (item: StoreItem) => void;
    purchasedItems: { [key: string]: number }; // itemId -> level
}

const Store: React.FC<StoreProps> = ({ clickCount, onPurchase, purchasedItems }) => {
    const availableItems = STORE_ITEMS.filter(item =>
        clickCount >= item.unlockAtClicks &&
        (!item.maxLevel || !purchasedItems[item.id] || purchasedItems[item.id] < item.maxLevel)
    );

    // Don't render anything if there are no available items
    if (availableItems.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                position: 'fixed',
                top: '80px',
                right: '20px',
                width: '300px',
                maxHeight: 'calc(100vh - 100px)',
                overflowY: 'auto',
                background: 'rgba(26, 26, 26, 0.9)',
                border: '2px solid #4a90e2',
                borderRadius: '10px',
                padding: '20px',
                color: '#ffffff',
                zIndex: 1000,
            }}
        >
            <h2 style={{ margin: '0 0 20px 0', color: '#4a90e2' }}>Store</h2>
            {availableItems.map(item => {
                const currentLevel = purchasedItems[item.id] || 0;
                const canAfford = clickCount >= item.cost;

                return (
                    <div
                        key={item.id}
                        style={{
                            marginBottom: '15px',
                            padding: '10px',
                            background: canAfford ? 'rgba(74, 144, 226, 0.1)' : 'rgba(255, 0, 0, 0.1)',
                            borderRadius: '5px',
                            border: '1px solid',
                            borderColor: canAfford ? '#4a90e2' : '#ff0000',
                        }}
                    >
                        <h3 style={{ margin: '0 0 5px 0', color: '#4a90e2' }}>{item.name}</h3>
                        <p style={{ margin: '0 0 10px 0', fontSize: '14px' }}>{item.description}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: canAfford ? '#ffffff' : '#ff0000' }}>
                                Cost: {item.cost} clicks
                            </span>
                            {item.maxLevel && (
                                <span style={{ color: '#999999' }}>
                                    Level: {currentLevel}/{item.maxLevel}
                                </span>
                            )}
                            <button
                                onClick={() => onPurchase(item)}
                                disabled={!canAfford}
                                style={{
                                    padding: '5px 10px',
                                    background: canAfford ? '#4a90e2' : '#666666',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: canAfford ? 'pointer' : 'not-allowed',
                                    opacity: canAfford ? 1 : 0.5,
                                }}
                            >
                                Purchase
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Store;