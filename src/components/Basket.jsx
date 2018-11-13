import React from 'react';

import { BasketItem } from './BasketItem';

export const Basket = ({ basket, removeFromBasket, purchase, newSaldo }) => (
    <div className="basket">
        <button className="purchase-button" disabled={newSaldo < 0} onClick={() => purchase()}>{newSaldo < 0 ? "Ikke nok penger >:(" : "K J Ø P"}</button>
        {Object.keys(basket).map((e) => <BasketItem removeFromBasket={(pk) => removeFromBasket(pk)} key={e} {...basket[e]} />)}
    </div>
);