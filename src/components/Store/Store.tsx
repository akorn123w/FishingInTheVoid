import React, { useEffect, useState } from 'react';
import { StoreItem, ItemRarity } from '../../constants/storeItems';
import { handlePurchase } from './storeLogic';
import './Store.css';

interface StoreProps {
    items: StoreItem[];
    clickCount: number;
    clickBonus: number;
    clickMultiplier: number;
    purchasedItems: { [key: string]: number };
    onPurchase: (item: StoreItem) => void;
}

const getRarityStyles = (rarity: ItemRarity, canAfford: boolean): {
    background: string;
    textColor: string;
    borderColor: string;
    gradient: string;
    hoverBackground: string;
} => {
    const baseStyles = {
        common: {
            background: 'rgba(255, 255, 255, 0.1)',
            textColor: '#ffffff',
            borderColor: '#ffffff',
            gradient: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.2) 100%)',
            hoverBackground: 'rgba(255, 255, 255, 0.15)'
        },
        uncommon: {
            background: 'rgba(30, 255, 0, 0.1)',
            textColor: '#1eff00',
            borderColor: '#1eff00',
            gradient: 'linear-gradient(45deg, rgba(30,255,0,0.1) 0%, rgba(30,255,0,0.2) 100%)',
            hoverBackground: 'rgba(30, 255, 0, 0.15)'
        },
        rare: {
            background: 'rgba(0, 112, 221, 0.1)',
            textColor: '#0070dd',
            borderColor: '#0070dd',
            gradient: 'linear-gradient(45deg, rgba(0,112,221,0.1) 0%, rgba(0,112,221,0.2) 100%)',
            hoverBackground: 'rgba(0, 112, 221, 0.15)'
        },
        epic: {
            background: 'rgba(163, 53, 238, 0.1)',
            textColor: '#a335ee',
            borderColor: '#a335ee',
            gradient: 'linear-gradient(45deg, rgba(163,53,238,0.1) 0%, rgba(163,53,238,0.2) 100%)',
            hoverBackground: 'rgba(163, 53, 238, 0.15)'
        },
        legendary: {
            background: 'rgba(255, 128, 0, 0.1)',
            textColor: '#ff8000',
            borderColor: '#ff8000',
            gradient: 'linear-gradient(45deg, rgba(255,128,0,0.1) 0%, rgba(255,128,0,0.2) 100%)',
            hoverBackground: 'rgba(255, 128, 0, 0.15)'
        }
    };

    const style = baseStyles[rarity];
    if (!canAfford) {
        return {
            ...style,
            background: style.background.replace('0.1', '0.05'),
            textColor: style.textColor + '80',
            borderColor: style.borderColor + '80',
            gradient: style.gradient.replace('0.1', '0.05').replace('0.2', '0.1'),
            hoverBackground: style.hoverBackground.replace('0.15', '0.08')
        };
    }
    return style;
};

export const Store: React.FC<StoreProps> = ({
    items,
    clickCount,
    clickBonus,
    clickMultiplier,
    purchasedItems,
    onPurchase
}) => {
    const [shinePosition, setShinePosition] = useState(0);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());

    // Animate shine effect with smooth looping
    useEffect(() => {
        let animationFrame: number;
        let lastTime = performance.now();
        const duration = 3000; // 3 seconds for one complete cycle

        const animate = (currentTime: number) => {
            const deltaTime = currentTime - lastTime;
            lastTime = currentTime;

            setShinePosition(prev => {
                const newPosition = (prev + (deltaTime / duration) * 100) % 100;
                return newPosition;
            });

            animationFrame = requestAnimationFrame(animate);
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, []);

    // Update visible items when click count changes
    useEffect(() => {
        const newlyVisible = items
            .filter(item => clickCount >= item.unlockAtClicks)
            .map(item => item.id);

        if (newlyVisible.length > 0) {
            setVisibleItems(prev => new Set([...prev, ...newlyVisible]));
        }
    }, [clickCount, items]);

    // Filter items that are either currently unlocked or have been visible before
    const availableItems = items.filter(item =>
        visibleItems.has(item.id) || clickCount >= item.unlockAtClicks
    );

    // Early return after all hooks are declared
    if (availableItems.length === 0) {
        return null;
    }

    return (
        <div className={`store-container ${expandedItem ? 'expanded' : ''}`}>
            <h2 className="store-title">Store</h2>
            <div className="store-items">
                {availableItems.map(item => {
                    const currentLevel = purchasedItems[item.id] || 0;
                    const nextLevel = item.levels[currentLevel];
                    const canAfford = clickCount >= nextLevel.cost;
                    const isMaxLevel = currentLevel >= item.levels.length;
                    const isExpanded = expandedItem === item.id;

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isMaxLevel && canAfford && onPurchase(item)}
                            className={`store-item ${nextLevel.rarity} ${isExpanded ? 'expanded' : ''} ${(!canAfford || isMaxLevel) ? 'disabled' : ''}`}
                            onMouseEnter={() => setExpandedItem(item.id)}
                            onMouseLeave={() => setExpandedItem(null)}
                        >
                            {/* Shine effect */}
                            <div
                                className="store-item-shine"
                                style={{
                                    left: `${shinePosition}%`,
                                    background: `linear-gradient(90deg,
                                        transparent 0%,
                                        ${getRarityColor(nextLevel.rarity)}22 15%,
                                        ${getRarityColor(nextLevel.rarity)}22 35%,
                                        transparent 50%)`
                                }}
                            />

                            <div className="store-item-content">
                                <div className="store-item-info">
                                    <div className="store-item-header">
                                        <h3 className="store-item-name">
                                            {item.name}
                                        </h3>
                                        {isExpanded && (
                                            <span className="store-item-level">
                                                Lvl {currentLevel + 1}/{item.levels.length}
                                            </span>
                                        )}
                                    </div>
                                    {isExpanded && (
                                        <div className="store-item-effect">
                                            {nextLevel.effect.type === 'additive' ? '+' : 'x'}{nextLevel.effect.value}
                                        </div>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div className="store-item-cost">
                                        {isMaxLevel ? 'Max' : `${nextLevel.cost} clicks`}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Helper function to get rarity color
const getRarityColor = (rarity: ItemRarity): string => {
    switch (rarity) {
        case 'common': return '#ffffff';
        case 'uncommon': return '#1eff00';
        case 'rare': return '#0070dd';
        case 'epic': return '#a335ee';
        case 'legendary': return '#ff8000';
        default: return '#ffffff';
    }
};