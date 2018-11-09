import React from 'react';

export const UserSection = ({ name, oldSaldo, newSaldo, logout, updateInventory }) => (
    <>
        <h4>{name}</h4>
        <h6>Old balance: {oldSaldo}</h6>
        <h6>New balance: {newSaldo}</h6>
        <button onClick={() => logout()}>Log out</button>
        <button onClick={() => updateInventory()}>Update inventory</button>
    </>
);