import uvicorn
from fastapi import FastAPI, WebSocket
from model_utils.voice_text_only import process_data

app = FastAPI()

@app.websocket("/user_event")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        for answer in await process_data(data):
            await websocket.send_json(answer)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)