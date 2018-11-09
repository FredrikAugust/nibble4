import React, { useState } from 'react';

export const Login = ({ login }) => {
    /* Input hooks. Because of this wonderful addition we no longer have to implement callbacks modifying
       state to have a stateful representation of input values. */
    const [inputRFID, setInputRFID] = useState('');

    const submit = () => { login(inputRFID); setInputRFID(''); };

    return (
        <>
            <h3>Sign in</h3>
            <input
                autoFocus
                placeholder="RFID"
                type="text"
                value={inputRFID}
                onKeyDown={(e) => e.keyCode === 13 ? submit() : null}
                onChange={(e) => setInputRFID(e.target.value)}
            />
            <input type="submit" onClick={submit} value="Login" />
        </>
    );
}