import os
import json
import websocket
import base64
import wave

OPENAI_API_KEY = ""

initial_prompt = "You are now a conversational AI agent for a webshop. You will receive information about user behavior, for example where they click, or what they hover over. Your task is to react to the webshop user’s behavior in a polite manner, softly encouraging them to stay longer on the website, or cite information about the item they are thinking about buying. Act friendly, do not appear pushy.Response to the following prompt:"
prompt_to_response_to = """I am on a button with the following information: 
{
  "button_text": "Buy Now",
  "button_color": "green",
  "button_size": "large"
}
"""


def save_pcm16_as_wav(base64_data, output_filename, sample_rate=24000, channels=1):
    # Decode Base64 data
    pcm_data = base64.b64decode(base64_data)
    
    # Save as a WAV file
    with wave.open(output_filename, 'wb') as wf:
        wf.setnchannels(channels)  # Mono or Stereo
        wf.setsampwidth(2)  # PCM16 uses 2 bytes per sample
        wf.setframerate(sample_rate)  # Set the sample rate
        wf.writeframes(pcm_data)  # Write PCM data



url = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17"
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
            "instructions": f"{initial_prompt}:{prompt_to_response_to}",
        }
    }
    ws.send(json.dumps(event))

# Receiving messages will require parsing message payloads
# from JSON
def on_message(ws, message):
    data = json.loads(message)
    if(data.get('type') == "response.audio_transcript.delta") and 'delta' in data:
        transcript_to_send = {"type":"text", "data":data['delta']}
    if data.get('type') == 'response.audio.delta' and 'delta' in data:
        audio_to_send = {"type":"audio", "data":data['delta']}


ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()