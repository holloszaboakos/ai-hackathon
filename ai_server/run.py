import uvicorn
from fastapi import FastAPI, WebSocket
from model_utils.voice_text_only import process_json_data

app = FastAPI()

@app.websocket("/text_and_voice_only")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        answer = process_json_data(data)
        await websocket.send_json(answer)


@app.websocket("/")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    while True:
        data = await websocket.receive_json()
        answer = process_json_data(data)
        await websocket.send_json(answer)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)