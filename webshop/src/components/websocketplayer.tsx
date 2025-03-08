import { useEffect, useRef, useState } from 'react';
import {
    gotTriplet
} from "./reducers/cartReducer";
import { useAppDispatch } from '../hooks'
import { toast } from 'react-toastify';
import { json } from 'stream/consumers';
import { waitFor } from '@testing-library/dom';
import { wait } from '@testing-library/user-event/dist/utils';

export function playPCM16(base64String: string, sampleRate = 22000, numChannels = 1) {

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

    let audioCtx = new (window.AudioContext)();

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

function getPromiseFromEvent(item:any, event:any) {
    return new Promise<void>((resolve) => {
      const listener = () => {
        item.removeEventListener(event, listener);
        resolve();
      }
      item.addEventListener(event, listener);
    })
  }
  


export async function sendPrompt(prompt: string) {        
    //console.log('Sending prompt:', prompt.length);
    console.log('Sending prompt:', prompt);
    const ws = new WebSocket("ws://localhost:8000/user_event");

    const mediaSource = new MediaSource();
    console.log(mediaSource);
    console.log('Sending prompt:', prompt);

    //ws.binaryType = 'arraybuffer';
    var queue: Uint8Array[] = [];
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
                if (queue.length > 0) {
                    const data = queue.shift(); // pop from the beginning
                    console.log('appending from queue, queue length:', queue.length);
                    sourceBuffer.appendBuffer(data as BufferSource);
                } else { // the queue runs empty, so we must force-feed the next packet
                    streamingStarted = false;
                }
            }
            else {
                console.error('asdf');
            }
            mediaSource.endOfStream();
        });

        function playStreamedAudio(base64: WithImplicitCoercion<string> | { [Symbol.toPrimitive](hint: "string"): string; }) {
            const data = new Uint8Array(Buffer.from(base64, "base64"));

            console.log("data", data);
            if (streamingStarted) {
                queue.push(data);
            } else {
                console.log('appending received data:', data, sourceBuffer.updating);
                streamingStarted = true;
                sourceBuffer.appendBuffer(data);
            }
        }

    });
    var audio_base64 = '';
    function playAudio(base64: string) {
        playPCM16(base64, 22000, 1);
    }
    var text = '';
    function displayText(new_text:string) {
        text = text + new_text;
        console.log('displaying text:', text);
    }
    var image_path = '';
    function displayImage(_image_path: any) {
        image_path = _image_path;
        console.log('displaying image:', image_path);
    }
    var done = false;
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log("data",data);

        switch (data.type) {
            case 'audio':
            case 'done':
                playAudio(data.content);
                ws.close();
                done = true;
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
    ws.onclose = () => {
        console.log('WebSocket closed'); 
        console.log(text);
        //playPCM16(audio_base64, 22000, 1);
        toast(text);
        toast((t) => (<img className="bottom-right-image" src={image_path} alt="Bottom Right" />))
    };

    async function waitForButtonClick() {
        await getPromiseFromEvent(ws, "close")
      }

    const a = JSON.stringify({ text: prompt});
    console.log('sending:', a);
    ws.onopen = () => ws.send(a);
    await waitForButtonClick();
    return text;
};

