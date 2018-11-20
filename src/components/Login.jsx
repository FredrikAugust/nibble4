import React from 'react';

import Marquee from 'react-smooth-marquee';

export class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            input: [],
            timerID: -1,
        }

        this.keyLogger = this.keyLogger.bind(this);
        this.setupClearTimer = this.setupClearTimer.bind(this);
    }

    setupClearTimer() {
        const timerID = setInterval(() => {
            this.setState((props) => ({ ...props, input: [] }));
            console.log("Cleared RFID input.");
        }, 3000);

        this.setState((props) => ({ ...props, timerID: timerID }))
    }

    keyLogger(e) {
        if (e.keyCode === 13) {
            console.log(`Submitting login request with RFID: ${this.state.input.join('')}`);
            return this.props.login(this.state.input.join(''));
        }

        clearInterval(this.state.timerID);

        this.setState((props) => ({ ...props, input: [...props.input, e.key] }));
        console.log(`Current input: ${[...this.state.input]}`);

        this.setupClearTimer();
    };

    componentDidMount() {
        document.addEventListener('keydown', this.keyLogger);

        this.setupClearTimer();
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.keyLogger);

        clearInterval(this.state.timerID);
    }

    render() {
        return (
            <div className="login">
                <div className="beep-card">
                    <Marquee>学生証をスキャンしてください。</Marquee>
                </div>
            </div>
        );
    }
}