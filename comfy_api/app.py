from fastapi import FastAPI, Form, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os
from tester import generate_image
from tester_vid import gen_video

app = FastAPI()

STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(STATIC_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.post("/generate/image")
async def generate_image_endpoint(prompt: str = Form(...)):
    try:
        output_filename = generate_image(prompt)
        return {"filename": output_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/video")
async def generate_video_endpoint(img_base64: str = Form(...), prompt: str = Form(...), negative_prompt: str = Form(...)):
    try:
        output_filename = gen_video(img_base64, prompt, negative_prompt)
        return {"filename": output_filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
