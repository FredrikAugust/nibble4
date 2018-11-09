import React from 'react';

export const BasketItem = ({ amount, name, price, pk, removeFromBasket }) => (
    <>
        <h5>{amount > 1 ? `${amount}x ` : null}{name}</h5>
        <span>Price: {amount * price}kr</span>
        <button onClick={() => removeFromBasket(pk)}>Remove {amount > 1 ? "1x " : null}from basket</button>
    </>
);