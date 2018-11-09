import React, { useState, useEffect } from 'react';

import Marquee from 'react-smooth-marquee';

export const Login = ({ login }) => {
    /* Input hooks. Because of this wonderful addition we no longer have to implement callbacks modifying
       state to have a stateful representation of input values. */
    const [inputRFID, setInputRFID] = useState('');

    const submit = () => { login(inputRFID); setInputRFID(''); };

    const inputRef = React.createRef();

    useEffect(() => inputRef.current.focus());

    return (
        <div className="login" onClick={() => inputRef.current.focus()}>
            <input
                autoFocus
                ref={inputRef}
                placeholder="RFID"
                type="text"
                value={inputRFID}
                onKeyDown={(e) => e.keyCode === 13 ? submit() : null}
                onChange={(e) => setInputRFID(e.target.value)}
                style={{ position: "absolute", top: "-69em" }}
            />
            <div className="beep-card">
                <Marquee>学生証をスキャンしてください。</Marquee>
            </div>
        </div>
    );
}