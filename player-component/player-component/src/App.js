import React, { useState } from 'react';
import PlayerComponent from './component.js';
import WebSocketVideoPlayer from './websocketplayer.js'
import RTCAudioPlayer from './rtcaudioplayer.js'

function App() {
    const [prompt, setPrompt] = useState('');

    const handleSend = () => {
        // Send the prompt to the PlayerComponent
        const event = new CustomEvent('sendPrompt', { prompt: prompt.current });
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
            <RTCAudioPlayer url="ws://localhost:8080" />
        </div>
    );
}

export default App;