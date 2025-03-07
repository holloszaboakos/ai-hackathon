import asyncio
import websockets
import json

async def send_json_data(uri, data):
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(data))
        while True:
            response = await websocket.recv()
            print(f"Received response: {response}")

if __name__ == "__main__":
    uri = "ws://localhost:8001/user_event"
    data = {"text": """I am on a button with the following information: 
    {
    "button_text": "Buy Now",
    "button_color": "green",
    "button_size": "large"
    }"""}
    asyncio.get_event_loop().run_until_complete(send_json_data(uri, data))