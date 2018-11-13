import React from 'react';

import Marquee from 'react-smooth-marquee';

export const UserSection = ({ name, oldSaldo, newSaldo, logout }) => (
    <>
        <Marquee>Velkommen til nibble⁴. Trykk på butikk-itemsenene for å legge de til i handekurven.</Marquee>
        <button onClick={() => logout()} className="logout-button">Log out</button>

        <div className="user-information">
            <h4>{name}</h4>
            <h6>Old balance: {oldSaldo}</h6>
            <h6>New balance: {newSaldo}</h6>
        </div>
    </>
);