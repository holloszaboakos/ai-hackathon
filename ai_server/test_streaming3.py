import os
import json
import websocket

OPENAI_API_KEY = "API_KULCS"
url = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Beta: realtime=v1"
]

def on_open(ws):
    print("Connected to server.")
    
    event = {
        "type": "response.create",
        "response": {
            "modalities": ["text", "audio"],
            "instructions": "Please assist the user."
        }
    }
    ws.send(json.dumps(event))

# Receiving messages will require parsing message payloads
# from JSON
def on_message(ws, message):
    data = json.loads(message)
    print("Received event:", json.dumps(data, indent=2))

ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()
import base64
import wave

def save_pcm16_as_wav(base64_data, output_filename, sample_rate=24000, channels=1):
    # Decode Base64 data
    pcm_data = base64.b64decode(base64_data)
    
    # Save as a WAV file
    with wave.open(output_filename, 'wb') as wf:
        wf.setnchannels(channels)  # Mono or Stereo
        wf.setsampwidth(2)  # PCM16 uses 2 bytes per sample
        wf.setframerate(sample_rate)  # Set the sample rate
        wf.writeframes(pcm_data)  # Write PCM data

        # Read the base64 data from message.txt


with open('full_response.txt', 'r') as file:
            base64_data = file.read().strip()

        # Call the function with the read data
save_pcm16_as_wav(base64_data, 'output2.wav')
