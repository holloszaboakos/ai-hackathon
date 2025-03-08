import asyncio
import websockets
import json

async def send_json_data(uri, data):
    try:
        async with websockets.connect(uri) as websocket:
            s = ""
            await websocket.send(json.dumps(data))
            while True:
                response = await websocket.recv()
                print(f"Received response: {json.loads(response).get('type')}")
                if json.loads(response).get('type') == "text":
                    s += json.loads(response).get('content')
                if json.loads(response).get('type') == "animation":
                    s += json.loads(response).get('content')
                if json.loads(response).get('type') == "done":
                    print(s)
                    print(json.loads(response).get('content'))
                    break
    except Exception as e:
        print(f"Failed to connect to {uri}: {e}")

if __name__ == "__main__":
    uri = "ws://localhost:8000/user_event"
    data = {"text": """A button was pressed and a shoe was added to the cart."""}
    asyncio.get_event_loop().run_until_complete(send_json_data(uri, data))