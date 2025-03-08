import uvicorn
from fastapi import FastAPI, WebSocket
from model_utils.voice_text_only import process_data
import asyncio

app = FastAPI()

@app.websocket("/user_event")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    def send_data_back(data):
        asyncio.create_task(websocket.send_json(data))

    while True:
        data = await websocket.receive_json()
        await process_data(data, send_data_back)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, ws_max_size=16 * 1024 * 1024)