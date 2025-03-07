import { useEffect, useRef, useState } from "react";


export default function RTCAudioPlayer() {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [events, setEvents] = useState([]);
  const [dataChannel, setDataChannel] = useState(null);
  const peerConnection = useRef(null);
  const audioElement = useRef(null);

  // Attach event listeners to the data channel when a new one is created
  useEffect(() => {
    if (dataChannel) {
      // Append new server events to the list
      dataChannel.addEventListener("message", (e) => {
        setEvents((prev) => [JSON.parse(e.data), ...prev]);
      });

      // Set session active when the data channel is opened
      dataChannel.addEventListener("open", () => {
        setIsSessionActive(true);
        setEvents([]);
      });
    }
  }, [dataChannel]);

const apiKey = "<redacted>";

    // Get an ephemeral key from the Fastify server
        const response = fetch(
          "https://api.openai.com/v1/realtime/sessions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4o-realtime-preview-2024-12-17",
              voice: "verse",
            }),
          },
        ).then(async (tokenResponse) => {
            console.log('apikey', apiKey);
            const data = await tokenResponse.json();
            console.log('data', data);
            const EPHEMERAL_KEY = data.client_secret.value;
    
    
        // Create a peer connection
        const pc = new RTCPeerConnection();
    
        // Set up to play remote audio from the model
        audioElement.current = document.createElement("audio");
        audioElement.current.autoplay = true;
        pc.ontrack = (e) => (audioElement.current.srcObject = e.streams[0]);
    
    
        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");
        setDataChannel(dc);
    
        // Start the session using the Session Description Protocol (SDP)
        const offer = await pc.createOffer();
        console.log('offer', offer);
        await pc.setLocalDescription(offer);
    
        const baseUrl = "https://api.openai.com/v1/realtime";
        const model = "gpt-4o-realtime-preview-2024-12-17";
        const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
          method: "POST",
          body: offer.sdp,
          headers: {
            Authorization: `Bearer ${EPHEMERAL_KEY}`,
            "Content-Type": "application/sdp",
          },
        });
    
        const answer = {
          type: "answer",
          sdp: await sdpResponse.text(),
        };
        console.log('answer', answer);
        await pc.setRemoteDescription(answer);
    
        peerConnection.current = pc;
    
        }
        );
    
    

  // Stop current session, clean up peer connection and data channel
  function stopSession() {
    if (dataChannel) {
      dataChannel.close();
    }

    peerConnection.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.stop();
      }
    });

    if (peerConnection.current) {
      peerConnection.current.close();
    }

    setIsSessionActive(false);
    setDataChannel(null);
    peerConnection.current = null;
  }

  // Send a message to the model
  function sendClientEvent(message) {
    if (dataChannel) {
      message.event_id = message.event_id || crypto.randomUUID();
      dataChannel.send(JSON.stringify(message));
      setEvents((prev) => [message, ...prev]);
    } else {
      console.error(
        "Failed to send message - no data channel available",
        message,
      );
    }
  }

  // Send a text message to the model
  function sendTextMessage(message) {
    const event = {
      type: "conversation.item.create",
      item: {
        type: "message",
        role: "user",
        content: [
          {
            type: "input_text",
            text: message,
          },
        ],
      },
    };

    sendClientEvent(event);
    sendClientEvent({ type: "response.create" });
  }



// Listen for the custom "sendPrompt" event
const handleSendPrompt = (event) => {
    console.log('sendPrompt event', event);
};

window.addEventListener('sendPrompt', handleSendPrompt);

  return (
    <></>
  );
}
