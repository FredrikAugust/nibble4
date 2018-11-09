import React from 'react';

import { StoreItem } from './StoreItem';

export const Store = ({ inventory, addToBasket, isLoggedIn }) => (
    <div style={{ width: '75%', display: 'flex', flexWrap: 'wrap' }}>
        {inventory.map((inventoryItem) => (
            <StoreItem key={inventoryItem.pk} {...inventoryItem} isLoggedIn={isLoggedIn} addToBasket={(pk) => addToBasket(pk)} />
        ))}
    </div>
);