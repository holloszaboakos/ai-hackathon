import { useEffect, useState } from "react";



function MyVoiceComponent() {
    const [dc, setDc] = useState<RTCDataChannel | null>(null);

    useEffect(() => {
        if (!dc) return;

        dc.addEventListener("message", (e) => {
            // Realtime server events appear here!
            console.log("EVEEENTTTT");
            console.log(e);
        });

        // Send a message to the model
        
    },[dc])

    useEffect(() => {

        console.log("OPENAI_API_KEY");
        console.log(process.env.OPENAI_API_KEY);
        fetch("https://api.openai.com/v1/realtime/sessions", { 
            method: "POST",
            headers: {
                "Authorization": `Bearer APIKEY!!!!`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-realtime-preview-2024-12-17",
                voice: "verse",
            }),
        }).then(async (r) => { 
            const data = await r.json();
            console.log(data);
            const EPHEMERAL_KEY = data.client_secret.value;
    
            // Create a peer connection
            const pc = new RTCPeerConnection();
    
            // Set up to play remote audio from the model
            const audioEl = document.createElement("audio");
            audioEl.autoplay = true;
            pc.ontrack = e => audioEl.srcObject = e.streams[0];
    
            // Add local audio track for microphone input in the browser
            const ms = await navigator.mediaDevices.getUserMedia({
                audio: true
            });
            pc.addTrack(ms.getTracks()[0]);
    
            // Set up data channel for sending and receiving events
            setDc(pc.createDataChannel("oai-events"));
    
            // Start the session using the Session Description Protocol (SDP)
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
    
            const baseUrl = "https://api.openai.com/v1/realtime";
            const model = "gpt-4o-realtime-preview-2024-12-17";
            const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
                method: "POST",
                body: offer.sdp,
                headers: {
                    Authorization: `Bearer ${EPHEMERAL_KEY}`,
                    "Content-Type": "application/sdp"
                },
            });
    
            const answer = {
                type: "answer" as RTCSdpType,
                sdp: await sdpResponse.text(),
            };
            await pc.setRemoteDescription(answer);
        });
    })



    return (
        <div className="container">
            <button className="waves-effect waves-light btn" onClick={()=>{
                if(dc) {
                    dc.send("How are you model today? We have such a nice weather? What is your opinion? Keep talking! I am listening to you!");
                }
            }}>Speak</button>
        </div>
    );
}

export default MyVoiceComponent;