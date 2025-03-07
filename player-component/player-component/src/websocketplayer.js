import { waitFor } from '@testing-library/dom';
import { useEffect, useRef, useState } from 'react';

const WebSocketVideoPlayer = ({ url }) => {
    const videoRef = useRef(null);
    const [mediaSource, setMediaSource] = useState(new MediaSource());



    useEffect(() => {
        console.log('WebSocketVideoPlayer mounted');
        const ws = new WebSocket(url);

        //ws.binaryType = 'arraybuffer';
        var queue = [];
        var streamingStarted = false;

        mediaSource.addEventListener('sourceopen', () => {
            console.log('MediaSource opened');

            console.log(ws.readyState);
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
            });
            ws.onmessage = (event) => {
                console.log('Received data:', event.data, sourceBuffer.updating);
                console.log('player',videoRef)
                console.log('player',mediaSource)
                if (streamingStarted) {
                    console.log(ws.readyState);
                    queue.push(new Uint8Array(event.data));
                } else {
                    console.log('appending received data:', event.data, sourceBuffer.updating);
                    streamingStarted = true;
                    sourceBuffer.appendBuffer(new Uint8Array(event.data));
                }
            };
        });

        ws.onerror = (error) => console.error('WebSocket Error:', error);
        ws.onclose = () => console.log('WebSocket closed');

        return () => {
            //ws.close();
        };
    }, [url]);

    /*
    return (
        <video ref={videoRef} controls autoPlay muted>
            {mediaSource && <source src="sample.mp4" type="video/mp4" />}
        </video>
    );
    */
   const media_url = URL.createObjectURL(mediaSource);

    return (
        <video ref={videoRef} autoPlay controls muted>
            {<source src={media_url} type="video/mp4" />}
        </video>
    );
};

export default WebSocketVideoPlayer;
