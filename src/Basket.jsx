import React from 'react';

import { BasketItem } from './BasketItem';

export const Basket = ({ basket, removeFromBasket, purchase }) => (
    <>
        {Object.keys(basket).map((e) => <BasketItem removeFromBasket={(pk) => removeFromBasket(pk)} key={e} {...basket[e]} />)}
        <button onClick={() => purchase()}>Purchase</button>
    </>
);