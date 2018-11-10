import React from 'react';

import { StoreItem } from './StoreItem';

export const Store = ({ inventory, addToBasket, isLoggedIn }) => {
    const stats = React.useMemo(() => {
        return JSON.parse(localStorage.getItem(`stats-${isLoggedIn}`)) || []
 }, [isLoggedIn])

    return (
        <div className='store'>
            {inventory.sort((a, b) => {
                if (!stats.length) {
                    return a.name < b.name;
                }

                a = stats.find((e) => (Number(e.item) === Number(a.pk))).count;
                b = stats.find((e) => (Number(e.item) === Number(b.pk))).count;

                if (a === b) return 0;
                if (a > b) return 1;
                if (a < b) return -1;
            }).map((inventoryItem) => (
                <StoreItem key={inventoryItem.pk} {...inventoryItem} isLoggedIn={isLoggedIn} addToBasket={(pk) => addToBasket(pk)} />
            ))}
        </div>
    );
 };