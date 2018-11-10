import React from 'react';

import { BasketItem } from './BasketItem';

export const Basket = ({ basket, removeFromBasket, purchase }) => (
    <div className="basket">
        <button className="purchase-button" onClick={() => purchase()}>Purchase</button>
        {Object.keys(basket).map((e) => <BasketItem removeFromBasket={(pk) => removeFromBasket(pk)} key={e} {...basket[e]} />)}
    </div>
);