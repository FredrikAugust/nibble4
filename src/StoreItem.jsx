import React from 'react';

export const StoreItem = ({ pk, name, price, addToBasket, isLoggedIn }) => (
    <div style={{ width: '25%', height: '25vw' }}>
        <h5>{name} - {price}kr</h5>
        {isLoggedIn ? <button onClick={() => addToBasket(pk)}>Add to basket</button> : null}
    </div>
);