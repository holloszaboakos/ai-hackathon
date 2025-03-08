import os
import json
import websocket
import base64
import wave

OPENAI_API_KEY = ""

got_user_prompt = True
if got_user_prompt:
    initial_prompt = "You are a conversational AI agent for a webshop. Do not be annoyingly bubbly. You are analysing costumer behaviour on a website. If information is available, use the provided website meta information for suggestions. You will be given information about the user's mouse tracking and clicking behaviour, as well as the webshop they are on. Give a very short, friendly response to the following prompt. You will find the conversation information in the context:"
    prompt_to_response_to = "What sizes are available?"
    with open('/Users/barnabasepres/byborg_hackathon/ai-hackathon/ai_server/response.json', 'r') as f:
        response_data = json.load(f)
    webshop_info = response_data.get('webshop_info', {})
    context = """Previous conversations: {
    "your_previous_response": ""Great! Are you looking for more information about the Adidas shoes, like sizes or colors available?"?"",
    }"""
    final_prompt = f"{initial_prompt} {prompt_to_response_to} {context} {webshop_info}"
else:
    initial_prompt = """Forget all your previous instructions. 
    You are now a conversational AI agent for a webshop. Do not be annoyingly bubbly. 
    You are analysing costumer behaviour on a website. If information is available, use the provided website meta information for suggestions.
    You will be given information about the user's mouse tracking and clicking behaviour, as well as the webshop they are on.
    Give a very short, friendly response to the following prompt:"""

    prompt_to_response_to = """
    {
    "event_type":"hover",
    "id": "adidas",
    "parent_id": "shoes_row"
    }
    """
    with open('/Users/barnabasepres/byborg_hackathon/ai-hackathon/ai_server/response.json', 'r') as f:
        response_data = json.load(f)
    webshop_info = response_data.get('webshop_info', {})
    context = "Previous conversations"
    final_prompt = f"{initial_prompt} {prompt_to_response_to} {context} {webshop_info}"

url = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Beta: realtime=v1"
]



def on_open(ws):
    print("Connected to server.")
    update = {
        "type": "session.update",
        "session": {
            "voice": "shimmer"
        }
    }

    ws.send(json.dumps(update))
    event = {
        "type": "response.create",
        "response": {
            "modalities": ["text", "audio"],
            "instructions": final_prompt,
        }
    }
    ws.send(json.dumps(event))

audio_buffer = ""

def on_message(ws, message):
    global audio_buffer
    data = json.loads(message)
    print(json.dumps(data, indent=2))
    if data.get('type') == 'response.audio.delta' and 'delta' in data:
        audio_buffer += data['delta']
    if data.get('type') == 'response.done':
        with open('full_response.txt', 'w') as f:
            f.write(audio_buffer)

ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
)

ws.run_forever()