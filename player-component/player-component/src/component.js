import React, { useEffect, useRef, useState } from 'react';

function websocketToReadableStream(ws) {
    return new ReadableStream({
        start(controller) {
            ws.onmessage = (event) => controller.enqueue(event.data);
            ws.onerror = (error) => controller.error(error);
            ws.onclose = () => controller.close();
        }
    });
}

function PlayerComponent() {
    const videoRef = useRef(null);
    const [text, setText] = useState('');
    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const action = JSON.parse(event.data);
                if (action.type === 'response') {
                    setText(action.payload);
                }
            } else {
                const videoElement = videoRef.current;
                const blob = new Blob([event.data], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);

                videoElement.src = url;
                videoElement.play();
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        const sendPrompt = (payload) => {
            const action = { type: 'prompt', payload };
            ws.send(JSON.stringify(action));
        };

        // Listen for the custom "sendPrompt" event
        const handleSendPrompt = (event) => {
            sendPrompt(event.detail);
        };

        window.addEventListener('sendPrompt', handleSendPrompt);

        // Send a prompt action when the component mounts
        sendPrompt('Hello, server!');

        return () => {
            ws.close();
            window.removeEventListener('sendPrompt', handleSendPrompt);
        };
    }, []);
    return (
        <div>
            <h1>Player</h1>
        </div>
    );
}

export default PlayerComponent;
/*
function PlayerComponent() {
    const videoRef = useRef(null);
    const [text, setText] = useState('');

    useEffect(() => {
        const ws = new WebSocket('ws://localhost:8080');

        ws.onopen = () => {
            console.log('Connected to WebSocket server');
        };

        ws.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const action = JSON.parse(event.data);
                if (action.type === 'response') {
                    setText(action.payload);
                }
            } else {
                const videoElement = videoRef.current;
                const blob = new Blob([event.data], { type: 'video/mp4' });
                const url = URL.createObjectURL(blob);

                videoElement.src = url;
                videoElement.play();
            }
        };

        ws.onclose = () => {
            console.log('Disconnected from WebSocket server');
        };

        const sendPrompt = (payload) => {
            const action = { type: 'prompt', payload };
            ws.send(JSON.stringify(action));
        };

        // Listen for the custom "sendPrompt" event
        const handleSendPrompt = (event) => {
            sendPrompt(event.detail);
        };

        window.addEventListener('sendPrompt', handleSendPrompt);

        // Send a prompt action when the component mounts
        sendPrompt('Hello, server!');

        return () => {
            ws.close();
            window.removeEventListener('sendPrompt', handleSendPrompt);
        };
    }, []);

    return (
        <div>
            <h1>Player</h1>
            <p>{text}</p>
            <video ref={videoRef} controls />
        </div>
    );
}

export default PlayerComponent;
*/