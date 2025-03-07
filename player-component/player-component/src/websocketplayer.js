import { useEffect, useRef, useState } from 'react';

function playPCM16(base64String, sampleRate = 22000, numChannels = 1) {

    //console.log('Pb64 audio',base64String);
    let binaryString = atob(base64String);
    let byteArray = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
    }

    let int16Array = new Int16Array(byteArray.buffer);
    let float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0; // Convert to -1.0 to 1.0
    }

    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    let audioBuffer = audioCtx.createBuffer(numChannels, float32Array.length / numChannels, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        let channelData = audioBuffer.getChannelData(channel);
        for (let i = 0; i < channelData.length; i++) {
            channelData[i] = float32Array[i * numChannels + channel]; // Interleaved PCM handling
        }
    }
    let source = audioCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioCtx.destination);
    source.start();
    console.log('Playing audio');
}



const WebSocketVideoPlayer = ({ url, prompt }) => {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const imageRef = useRef(null);
    const textRef = useRef(null);





    const sendPrompt = (prompt) => {
        //console.log('Sending prompt:', prompt.length);
        console.log('Sending prompt:', prompt);
        const ws = new WebSocket(url);

        const mediaSource = new MediaSource();
        console.log(mediaSource);

        mediaSource.addEventListener('sourceopen', () => {
            console.log('MediaSource opened');
        });
        mediaSource.addEventListener('sourceclose', () => {
            console.log('MediaSource closed');
        });
        mediaSource.addEventListener('sourceended', () => {
            console.log('MediaSource ended');
        });

        //ws.binaryType = 'arraybuffer';
        var queue = [];
        var streamingStarted = false;
        mediaSource.addEventListener('sourceopen', () => {

            const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
            if (!MediaSource.isTypeSupported(mimeCodec)) {
                console.error("MIME type or codec not supported");
            }
            const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);

            sourceBuffer.addEventListener("onerror", (event) => {
                console.log("Media source error", event);
            });

            sourceBuffer.addEventListener('updateend', () => {
                if (!sourceBuffer.updating && mediaSource.readyState === 'open') {
                    if (queue.length>0) {
                        const data = queue.shift(); // pop from the beginning
                        console.log('appending from queue, queue length:', queue.length);
                        sourceBuffer.appendBuffer(data);
                    } else { // the queue runs empty, so we must force-feed the next packet
                        streamingStarted = false;
                    }
                }
                else {
                    console.error('asdf');
                }
                mediaSource.endOfStream();
            });

            function playStreamedAudio(base64) {
                const data = new Uint8Array(Buffer.from(base64, "base64"));

                console.log("data",data);
                if (streamingStarted) {
                    queue.push(data);
                } else {
                    console.log('appending received data:', data, sourceBuffer.updating);
                    streamingStarted = true;
                    sourceBuffer.appendBuffer(data);
                }
            }

        });
        function playAudio(base64) {
            playPCM16(base64, 22000, 1);
        }
        function displayText(text) {
            console.log('displaying text:', text);
        }
        function displayImage(image_path) {
            console.log('displaying image:', image_path);
        }
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            //console.log("data",data);

            switch (data.type) {
                case 'audio':
                    playAudio(data.content);
                    break;
                case 'animation':
                    displayImage(data.content);
                    break;
                case 'text':
                    displayText(data.content);
                    break;
                default:
                    console.error('Unknown data type:', data.type);
            }

        };

        ws.onerror = (error) => console.error('WebSocket Error:', error);
        ws.onclose = () => { console.log('WebSocket closed');};

        return () => {
            //ws.close();
        };
    };


    useEffect(() => {
        
        // Listen for the custom "sendPrompt" event
        /*
        const handleSendPrompt = (event) => {
            console.log('sendPrompt event', event);
            sendPrompt(event.detail);
        };
    
        window.addEventListener('sendPrompt', handleSendPrompt);
        */
       sendPrompt(prompt);
        }, [prompt]);

    /*
    return (
        <video ref={videoRef} controls autoPlay muted>
            {mediaSource && <source src="sample.mp4" type="video/mp4" />}
        </video>
    );
    */
   /*
   const media_url = URL.createObjectURL(mediaSource);


    return (
        <><video ref={videoRef} autoPlay controls muted>
            {<source src={media_url} type="video/mp4" />}
        </video>
        <a href={media_url} />"{media_url}"</>
    );
    */
    return (
        <div>
            <h1>Player</h1>
        </div>
    );
};

export default WebSocketVideoPlayer;
