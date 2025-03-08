import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [dc, setDc] = useState<RTCDataChannel | null>(null);
  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [key, setKey] = useState<any | null>(null);

  useEffect(() => {
    if (!pc) return;

    // Set up to play remote audio from the model
    const audioEl = document.createElement("audio");
    audioEl.autoplay = true;
    pc.ontrack = e => audioEl.srcObject = e.streams[0];

    //Add local audio track for microphone input in the browser
    navigator.mediaDevices.getUserMedia({
      audio: true
    }).then(async (ms) => {
      pc.addTrack(ms.getTracks()[0])

      if (dc) dc.close();
      // Set up data channel for sending and receiving events
      setDc(pc.createDataChannel("oai-events"));

      // Start the session using the Session Description Protocol (SDP)
      const offer = await pc.createOffer()
      console.log("OFFER");
      await pc.setLocalDescription(offer);

      const baseUrl = "https://api.openai.com/v1/realtime";
      const model = "gpt-4o-realtime-preview-2024-12-17";
      const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/sdp"
        },
      });

      const answer = {
        type: "answer" as RTCSdpType,
        sdp: await sdpResponse.text(),
      };
      await pc.setRemoteDescription(answer);
    })
    //const offer = await pc.createOffer()
    //})
  }, [pc, key])

  useEffect(() => {
    if (!dc) return;

    dc.addEventListener("message", (e) => {
      // Realtime server events appear here!
      console.log("EVEEENTTTT");
      console.log(e);
    });
  }, [dc])

  useEffect(() => {
    console.log("RENDERED!!!!");

    console.log("OPENAI_API_KEY");
    console.log(process.env.OPENAI_API_KEY);
    fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer TTOOKKEENN`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2024-12-17",
        voice: "verse",
      }),
    }).then(async (r) => {
      console.log("RESPONSE");

      const data = await r.json();
      console.log(data);
      setKey(data.client_secret.value);

      // Create a peer connection
      if (pc) {
        pc.close();
      }
      setPc(new RTCPeerConnection());
    });

    return () => {
      if (dc) {
        dc.close();
      }
      if (pc) {
        pc.close();
      }
    }
  }, [])



  return (
    <div className="container">
      <button className="waves-effect waves-light btn" onClick={() => {
        if (dc) {
          const responseCreate = {
            type: "response.create",
            response: {
              modalities: ["text"],
              instructions: "Write a haiku about code",
            },
          };
          dc.send(JSON.stringify(responseCreate));
        }
      }}>Speak</button>
    </div>
  );
}

export default App;
