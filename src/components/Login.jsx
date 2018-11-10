import React, { useState, useEffect } from 'react';

import Marquee from 'react-smooth-marquee';

export const Login = ({ login }) => {
    /* Input hooks. Because of this wonderful addition we no longer have to implement callbacks modifying
       state to have a stateful representation of input values. */
    const [inputRFID, setInputRFID] = useState([]);

    const keyLogger = (e) => {
        if (e.keyCode === 13) {
            return login(inputRFID.join(''));
        }
        setInputRFID([...inputRFID, String.fromCharCode(e.keyCode)]);
    };

    const clearRFIDTimer = () => setInterval(() => setInputRFID([]), 3000);

    useEffect(() => {
        document.addEventListener('keydown', keyLogger);
        const timerID = clearRFIDTimer();

        return () => {
            document.removeEventListener('keydown', keyLogger);
            clearInterval(timerID);
        }
    });

    return (
        <div className="login">
            <div className="beep-card">
                <Marquee>学生証をスキャンしてください。</Marquee>
            </div>
        </div>
    );
}