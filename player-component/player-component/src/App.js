import React, { useState } from 'react';
import PlayerComponent from './component.js';
import WebSocketVideoPlayer from './websocketplayer.js'

function App() {
    const [prompt, setPrompt] = useState('');

    const handleSend = () => {
        // Send the prompt to the PlayerComponent
        const event = new CustomEvent('sendPrompt', { detail: prompt });
        window.dispatchEvent(event);
    };

    return (
        <div className="App">
            
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt"
            />
            <button onClick={handleSend}>Send</button>
            <WebSocketVideoPlayer url="ws://localhost:8080" />
        </div>
    );
}

export default App;