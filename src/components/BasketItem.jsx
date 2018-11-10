import React from 'react';

export const BasketItem = ({ amount, name, price, pk, removeFromBasket }) => (
    <div className="basket-item" onClick={() => removeFromBasket(pk)}>
        <hr />
        <h5>{amount > 1 ? `${amount}x ` : null}{name}</h5>
        <span>Price: {amount * price}kr</span>
        <button>Remove {amount > 1 ? "1x " : null}</button>
    </div>
);