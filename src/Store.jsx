import React from 'react';

import { StoreItem } from './StoreItem';

export const Store = ({ inventory, addToBasket, isLoggedIn }) => (
    <div className='store'>
        {inventory.map((inventoryItem) => (
            <StoreItem key={inventoryItem.pk} {...inventoryItem} isLoggedIn={isLoggedIn} addToBasket={(pk) => addToBasket(pk)} />
        ))}
    </div>
);