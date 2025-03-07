const fs = require('fs');
const http = require('http');
const { Server } = require('socket.io');
const { RTCPeerConnection, RTCSessionDescription } = require('wrtc');

const server = http.createServer();
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('offer', async (message) => {
        const offer = new RTCSessionDescription(message);
        const peerConnection = new RTCPeerConnection();

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('ice-candidate', event.candidate);
            }
        };

        peerConnection.ontrack = (event) => {
            const stream = event.streams[0];
            const videoTrack = stream.getVideoTracks()[0];
            const videoStream = fs.createReadStream('/home/susitsm/byborg/ai-hackathon/player-component/player-component/public/sample.mp4');

            videoStream.on('data', (chunk) => {
                console.log('Sending chunk of data');
                videoTrack.write(chunk);
            });

            videoStream.on('end', () => {
                peerConnection.close();
            });
        };

        await peerConnection.setRemoteDescription(offer);
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        socket.emit('answer', answer);
    });

    socket.on('ice-candidate', async (message) => {
        const candidate = new RTCIceCandidate(message);
        await peerConnection.addIceCandidate(candidate);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log('RTC server is running on http://localhost:8080');
});