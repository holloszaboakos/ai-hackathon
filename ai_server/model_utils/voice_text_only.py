import os
import json
import websocket
import base64
import wave
import websockets

OPENAI_API_KEY = ""

initial_prompt = "You are now a conversational AI agent for a webshop. You will receive information about user behavior, for example where they click, or what they hover over. Your task is to react to the webshop user’s behavior in a polite manner, softly encouraging them to stay longer on the website, or cite information about the item they are thinking about buying. Act friendly, do not appear pushy.Response to the following prompt:"
prompt_to_response_to = """I am on a button with the following information: 
{
  "button_text": "Buy Now",
  "button_color": "green",
  "button_size": "large"
}
"""


url = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17"
headers = [
    "Authorization: Bearer " + OPENAI_API_KEY,
    "OpenAI-Beta: realtime=v1"
]


async def process_data(input, callback):
    """
    Process the input JSON data and return a JSON with 'text' and 'voice' fields.

    Args:
        input_json (str): A JSON string containing the input data.

    Returns:
        str: A JSON string containing the 'text' and 'voice' fields.
    """

    event = {
        "type": "response.create",
        "response": {
            "modalities": ["text", "audio"],
            "instructions": f"{initial_prompt}:{input}",
        }
    }

    def on_open(ws):
        print("Connected to server.")
        ws.send(json.dumps(event))

    buffer = ""

    # Receiving messages will require parsing message payloads
    # from JSON
    def on_message(ws, message):
        print("on message called")
        data = json.loads(message)
        if(data.get('type') == "response.audio_transcript.delta") and 'delta' in data:
            transcript_to_send = {"type":"text", "content":data['delta']}
            callback(transcript_to_send)
        if data.get('type') == 'response.audio.delta' and 'delta' in data:
            # audio_to_send = {"type":"audio", "content":data['delta']}
            # callback(audio_to_send)
            buffer += data['delta']
        if data.get('type') == 'response.function_call_arguments.done' and 'arguments' in data:
            function_to_send = {"type":"function", "content": data['arguments']}
            callback(function_to_send)
        if data.get('type') == 'response.done':
            callback({"type":"done", "content": buffer})
            ws.close()
            return
    
    ws = websocket.WebSocketApp(
        url,
        header=headers,
        on_open=on_open,
        on_message=on_message,
    )

    ws.run_forever()

    # async with websockets.connect(url) as websocket:
    #     await websocket.send(json.dumps(event))
    #     while True:
    #         response = await websocket.recv()
    #         data = json.loads(response)
    #         print(data)
    #         if(data.get('type') == "response.audio_transcript.delta") and 'delta' in data:
    #             transcript_to_send = {"type":"text", "content":data['delta']}
    #             callback(transcript_to_send)
    #         if data.get('type') == 'response.audio.delta' and 'delta' in data:
    #             audio_to_send = {"type":"audio", "content":data['delta']}
    #             callback(audio_to_send)
    #         if data.get('type') == 'response.function_call_arguments.done' and 'arguments' in data:
    #             function_to_send = {"type":"function", "content": data['arguments']}
    #             callback(function_to_send)
    #         if data.get('type') == 'response.done':
    #             websocket.close()
    #             return