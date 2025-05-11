import React from 'react';
import { StoreItem } from '../../constants/storeItems';
import './PurchasedItems.css';

interface PurchasedItemsProps {
    items: StoreItem[];
    purchasedItems: { [key: string]: number };
}

export const PurchasedItems: React.FC<PurchasedItemsProps> = ({ items, purchasedItems }) => {
    // Filter only items that have been purchased and get their highest level
    const purchasedItemList = items
        .filter(item => purchasedItems[item.id] > 0)
        .map(item => ({
            ...item,
            currentLevel: purchasedItems[item.id]
        }));

    if (purchasedItemList.length === 0) {
        return null;
    }

    return (
        <div className="purchased-items-container">
            <h3 className="purchased-items-title">Purchased Items</h3>
            <div className="purchased-items-list">
                {purchasedItemList.map(item => {
                    const levelInfo = item.levels[item.currentLevel - 1];
                    const isMaxLevel = item.currentLevel >= item.levels.length;

                    return (
                        <div
                            key={item.id}
                            className={`purchased-item ${levelInfo.rarity} ${isMaxLevel ? 'max-level' : ''}`}
                        >
                            <div className="purchased-item-name">{item.name}</div>
                            <div className="purchased-item-level">
                                Level {item.currentLevel}/{item.levels.length}
                                {isMaxLevel && ' (Max)'}
                            </div>
                            <div className="purchased-item-effect">
                                {levelInfo.effect.type === 'additive' ? '+' : 'x'}{levelInfo.effect.value}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};