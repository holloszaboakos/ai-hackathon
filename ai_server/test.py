import asyncio
import websockets
import json

async def send_json_data(uri, data):
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(data))
        response = await websocket.recv()
        print(f"Received response: {response}")

if __name__ == "__main__":
    uri = "ws://localhost:8000"
    data = {
        "message": "Hello, Server!",
        "timestamp": "2023-10-01T12:00:00Z"
    }
    asyncio.get_event_loop().run_until_complete(send_json_data(uri, data))