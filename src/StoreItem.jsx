import React from 'react';

import Marquee from 'react-smooth-marquee';

const API_IMAGE_BASE = process.env.REACT_APP_API_IMAGE_BASE;

export const StoreItem = ({ pk, name, price, description, addToBasket, isLoggedIn, image }) => (
    <div className="store-item" onClick={isLoggedIn ? () => addToBasket(pk) : null} style={{ opacity: (isLoggedIn ? 1 : 0.6), boxShadow: (isLoggedIn ? "0px 0px 25px black" : null) }}>
        <div className="store-image">
            <img src={image ? `${API_IMAGE_BASE}${image.sm}` : "https://placehold.it/150x180"} alt={description} />
        </div>
        <hr/>
        <Marquee>{name}</Marquee>
        <h5>{price}kr</h5>
        <p>{description}</p>
    </div>
);