import asyncio
import websockets
import json

async def send_json_data(uri, data):
    try:
        async with websockets.connect(uri) as websocket:
            await websocket.send(json.dumps(data))
            while True:
                response = await websocket.recv()
                print(f"Received response: {json.loads(response).get('type')}")
                if json.loads(response).get('type') == "done":
                    # with open("output.txt", "w") as f:
                    #     f.write(json.loads(response).get("content"))
                    break
    except Exception as e:
        print(f"Failed to connect to {uri}: {e}")

if __name__ == "__main__":
    uri = "ws://localhost:8000/user_event"
    data = {"text": """I am on a button with the following information: 
    {
    "button_text": "Buy Now",
    "button_color": "green",
    "button_size": "large"
    }"""}
    asyncio.get_event_loop().run_until_complete(send_json_data(uri, data))