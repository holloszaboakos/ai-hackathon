// filepath: /home/susitsm/byborg/ai-hackathon/player-component/server.js
const WebSocket = require('ws');
const fs = require('fs');

const wss = new WebSocket.Server({ port: 8080 });

const respones = [
    {type: 'text', content: "hello"},
     {type: 'animation', content: "anim_id"},
      {type: 'audio', content: "b64encoded_audio"}
];

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (message) => {
        const action = JSON.parse(message);
        if (action.type === 'prompt') {
            console.log('Received prompt:', action.payload);
        }
    });

    fs.readFile("/home/susitsm/byborg/ai-hackathon/player-component/player-component/public/message.txt", "utf8", (err, data) => {
        if (err) {
          console.error("Error reading file:", err);
          return;
        }
        ws.send(JSON.stringify({ type: "audio", content: data}));
      });
    /*
    // Example of sending a video stream to the client
    const stream = fs.createReadStream('/home/susitsm/byborg/ai-hackathon/player-component/player-component/public/sample.mp4');
    stream.on('data', (chunk) => {
        console.log('Sending chunk of data');
        ws.send(chunk);
    });

    stream.on('end', () => {
        ws.close();
    });
    */

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');