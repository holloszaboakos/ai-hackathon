import os
import json
import websocket
import base64
import wave
import websockets
import asyncio

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

initial_prompt = """Forget all your previous instructions. 
    You are now a conversational AI agent for a webshop. Do not be annoyingly bubbly. 
    You are analysing costumer behaviour on a website. If information is available, use the provided website meta information for suggestions.
    You will be given information about the user's mouse tracking and clicking behaviour, as well as the webshop they are on.
    You need to use a tool called play_animation to select the closest animation available for the user's action.
    These are the possible animations:
    {action_list}
    This is a short description of the webpage: {description}
    Give a very short, friendly response to the following prompt:
    {input}"""


url = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Beta: realtime=v1"
]


async def process_data(input, callback):
    global buffer
    buffer = ""
    context = ""
    with open("response_2.json", "r") as f:
        context = json.load(f)

    input = json.loads(input)
    action_list = "\n".join([f'"link": "{action["name"]}", "description": "{action["text"]}"' for action in context["actions"]])
    history = []
    for pa_pair in input["history"]:
        history.append({"type": "message", "role": "user", "content": pa_pair["prompt"]})
        history.append({"type": "message", "role": "assistant", "content": pa_pair["answer"]})

    event = {
        "type": "response.create",
        "response": {
            "modalities": ["text", "audio"],
            "instructions": initial_prompt.format(input=input["text"], description=context['description'], action_list=action_list),
            "tools": [
                {
                    "type": "function",
                    "name": "play_animation",
                    "description": "Trigger an animation from the built-in assistant. Use only the link list given in the instructions.",
                    "parameters": {
                        "type": "object",
                        "properties": {
                            "link": { "type": "string", "description": "The link of the animation to play." }
                        },
                        "required": ["link"]
                    }
                }
            ],
            "tool_choice": "required",
            "input": history
        }
    }

    def on_open(ws):
        print("Connected to server.")
        ws.send(json.dumps(event))

    # Receiving messages will require parsing message payloads
    # from JSON
    def on_message(ws, message):
        global buffer
        print("on message called")
        data = json.loads(message)
        print(data.get("error", "no error"))
        if(data.get('type') == "response.audio_transcript.delta") and 'delta' in data:
            transcript_to_send = {"type":"text", "content":data['delta']}
            callback(transcript_to_send)
        if data.get('type') == 'response.audio.delta' and 'delta' in data:
            # audio_to_send = {"type":"audio", "content":data['delta']}
            # callback(audio_to_send)
            buffer += data['delta']
        if data.get('type') == 'response.function_call_arguments.done' and 'arguments' in data:
            function_to_send = {"type":"animation", "content": data['arguments']}
            callback(function_to_send)
        if data.get('type') == 'response.done':
            callback({"type":"done",
                      "content": buffer})
            ws.close()
            return
    
    ws = websocket.WebSocketApp(
        url,
        header=headers,
        on_open=on_open,
        on_message=on_message,
    )

    ws.run_forever()