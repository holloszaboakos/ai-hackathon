import { useEffect, useRef, useState } from 'react';
import {
    gotTriplet
} from "./reducers/cartReducer";
import { useAppDispatch } from '../hooks'
import { toast } from 'react-toastify';
import { json } from 'stream/consumers';
import { waitFor } from '@testing-library/dom';
import { wait } from '@testing-library/user-event/dist/utils';
import { Tuple } from '@reduxjs/toolkit';

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

function getPromiseFromEvent(item: any, event: any) {
    return new Promise<void>((resolve) => {
        const listener = () => {
            item.removeEventListener(event, listener);
            resolve();
        }
        item.addEventListener(event, listener);
    })
  }
  
var promptList: Array<string> = [];
var history: Array<{prompt: string, answer: string}> = [];


export async function sendPrompt(prompt: string) {
    //console.log('Sending prompt:', prompt.length);
    console.log('Sending prompt:', prompt);
    const ws = new WebSocket("ws://localhost:8000/user_event");

    function playAudio(base64: string) {
        playPCM16(base64, 22000, 1);
    }
    var text = '';
    function displayText(new_text: string) {
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
        console.log("data", data);

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
        history.push({prompt: prompt, answer: text});
        toast(text);
        toast((t) => (<img
            className="toast-image"
            width={280}
            src={image_path}
            alt={image_path} />
        ))
    };

    async function waitForButtonClick() {
        await getPromiseFromEvent(ws, "close")
    }

    const a = JSON.stringify({ text: prompt, history: history });

    console.log('sending:', a);
    ws.onopen = () => ws.send(a);
    await waitForButtonClick();
    return text;
};

