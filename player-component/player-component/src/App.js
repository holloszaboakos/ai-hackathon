import React, { useState } from 'react';
import WebSocketVideoPlayer from './websocketplayer.js'

function App() {
    const [prompt, setPrompt] = useState('');
    const [sentPrompt, setSentPrompt] = useState('');

    const handleSend = () => {
        // Send the prompt to the PlayerComponent
        setSentPrompt(prompt);
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
            <WebSocketVideoPlayer prompt={sentPrompt} url="ws://localhost:8080" />
        </div>
    );
}

export default App;