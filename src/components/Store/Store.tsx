import React, { useEffect, useState } from 'react';
import { StoreItem, ItemRarity } from '../../constants/storeItems';
import { handlePurchase } from './storeLogic';

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
        <div style={{
            position: 'fixed',
            top: '70px',
            right: '20px',
            padding: '10px',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            borderRadius: '10px',
            color: 'white',
            width: expandedItem ? '300px' : '150px',
            maxHeight: 'calc(100vh - 90px)',
            overflowY: 'auto',
            zIndex: 1000,
            transition: 'width 0.3s ease'
        }}>
            <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '1.1em' }}>Store</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableItems.map(item => {
                    const currentLevel = purchasedItems[item.id] || 0;
                    const nextLevel = item.levels[currentLevel];
                    const canAfford = clickCount >= nextLevel.cost;
                    const isMaxLevel = currentLevel >= item.levels.length;
                    const rarityStyles = getRarityStyles(nextLevel.rarity, canAfford);
                    const isExpanded = expandedItem === item.id;

                    return (
                        <div
                            key={item.id}
                            onClick={() => !isMaxLevel && canAfford && onPurchase(item)}
                            style={{
                                padding: isExpanded ? '10px' : '8px',
                                border: `1px solid ${rarityStyles.borderColor}`,
                                borderRadius: '5px',
                                background: rarityStyles.background,
                                color: rarityStyles.textColor,
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'all 0.3s ease',
                                cursor: canAfford && !isMaxLevel ? 'pointer' : 'not-allowed',
                                opacity: canAfford ? 1 : 0.7,
                                transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
                                boxShadow: isExpanded ? `0 0 10px ${rarityStyles.borderColor}33` : 'none'
                            }}
                            onMouseEnter={() => setExpandedItem(item.id)}
                            onMouseLeave={() => setExpandedItem(null)}
                        >
                            {/* Shine effect */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: `${shinePosition}%`,
                                width: '300%',
                                height: '100%',
                                background: `linear-gradient(90deg,
                                    transparent 0%,
                                    ${rarityStyles.borderColor}22 15%,
                                    ${rarityStyles.borderColor}22 35%,
                                    transparent 50%)`,
                                transform: 'translateX(-50%)',
                                pointerEvents: 'none',
                                transition: 'left 0.1s linear'
                            }} />

                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <h3 style={{
                                            margin: 0,
                                            fontSize: '0.9em',
                                            color: rarityStyles.textColor
                                        }}>
                                            {item.name}
                                        </h3>
                                        {isExpanded && (
                                            <span style={{
                                                fontSize: '0.8em',
                                                color: rarityStyles.textColor
                                            }}>
                                                Lvl {currentLevel + 1}/{item.levels.length}
                                            </span>
                                        )}
                                    </div>
                                    {isExpanded && (
                                        <div style={{
                                            fontSize: '0.8em',
                                            color: rarityStyles.textColor,
                                            opacity: 0.8,
                                            marginTop: '4px'
                                        }}>
                                            {nextLevel.effect.type === 'additive' ? '+' : 'x'}{nextLevel.effect.value}
                                        </div>
                                    )}
                                </div>
                                {isExpanded && (
                                    <div style={{
                                        fontSize: '0.9em',
                                        color: canAfford ? rarityStyles.textColor : '#666666',
                                        padding: '6px 12px',
                                        background: canAfford ? rarityStyles.gradient : 'rgba(102, 102, 102, 0.2)',
                                        border: `1px solid ${canAfford ? rarityStyles.borderColor : '#666666'}`,
                                        borderRadius: '4px',
                                        minWidth: '80px',
                                        textAlign: 'center'
                                    }}>
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