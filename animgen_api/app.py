from fastapi import FastAPI, HTTPException
import json
import requests
import base64
from PIL import Image
from io import BytesIO
from tqdm import tqdm
from openai import OpenAI
import os

app = FastAPI()

client = OpenAI(
    api_key = os.getenv("HF_API_KEY")
)

def agent_prompt(user_request):
    generate_animation_prompts = [
        {
            "role": "system",
            "content": """You are a masterful UX designer. Your job is to decide what kind of animations to prepare for an AI agent.
First reason about the cues and functions the AI agent will perform.
Then carefully design the AI agent's static description as a prompt to a text-to-image model, it should be a plain background, standing, distant, full body picture.
Finally list the animations you want to generate for the AI agent including a short description, then a prompt for each animation.
The AI's reactions should be expressive, exeggerated, and reactive to the user's possible inputs. Make sure to use deep emotional detail, as the video generator is relatively numb.
Respond with a corresponding JSON object with the following structure:
1. Reasoning about the AI agent's cues and functions. 
2. Static description of the AI agent. It should be a standing full body character. Choose the AI's voice (male, female, neutral) as well.
3. List of animations with descriptions and prompts.

The animation descriptions should be short and clear. The animation prompts should clearly define all intents in detail as well as directions (up, down, right, left) if relevant, and should be distinct from the others.
Avoid designing directional cues, prefer emotions. You can only animate the character (or their possessions) as the webpage is static. The shopping section is to the left.
Mandatory aspects of the animations: greeting, negative, positive feedback, thinking, surprise, celebration, other business-related and base emotions (such as disgust).

#### Examples:

Static description: A friendly blue eyed brunette with a ponytail, wearing a white blouse and a black skirt. Full body standing photograph with a white background, perfect photograph. Top to toe view, facing the camera. Distant, full figure, single person.
Cue: We need to greet the user.
Short description: A woman smiling and waving at the camera.
Prompt: A beautiful woman with a wiggling ponytail, smiling and waving at the camera happily. Cheerful friendly greeting, single person.
     
Cue: We need to applaud the user as they add a new item to their cart.
Short description: Positive feedback for adding an item to the cart.
Prompt: A beautiful woman clapping and showing a thumbs up to the camera affirmatively. Encouraging applause, single person, thumbs up emote.
"""
        },
        {"role": "user", "content": user_request}
    ]
    return generate_animation_prompts

def agent_json_schema():
    return {
        "name": "vid_prompt_schema",
        "schema": {
            "type": "object",
            "properties": {
                "reasoning": {
                    "type": "string"
                },
                "static_description": {
                    "type": "object",
                    "properties": {
                        "description": {
                            "type": "string",
                            "description": " A standing full body character description (no background), no close-ups."
                        },
                        "voice": {
                            "type": "string",
                            "enum": ["male", "female", "neutral"]
                        }
                    }
                },
                "animations": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "description": {"type": "string"},
                            "prompt": {"type": "string"}
                        }
                    }
                }
            }
        }
    }

class AnimationGeneratorAgent:
    def __init__(self):
        self.anims = []
        self.data = None

    def generate_static_img(self):
        self.static_path = None
        if self.data is None:
            raise Exception("You must generate animations first")
        if self.data["static_description"]:
            # Use the description as prompt for image generation.
            self.static_path = self.generate_image(self.data["static_description"]["description"])

    def get_animations(self):
        if self.data is None:
            raise Exception("You must generate animations first")
        if not self.static_path:
            raise Exception("You must generate the static image first")
        # Download static image using PIL and a remote URL.
        r = requests.get("http://localhost:7771" + self.static_path, stream=True)
        if r.status_code == 200:
            img = Image.open(BytesIO(r.content))
        else:
            raise Exception("Failed to download image")
        img.save("tmp.png")
        for i in tqdm(range(len(self.data["animations"]))):
            path = self.generate_video("tmp.png", self.data["animations"][i]["prompt"], "still, static")
            self.anims.append({
                "description": self.data["animations"][i]["description"],
                "path": path
            })

    def generate_video(self, image, prompt, negative_prompt):
        url = "http://localhost:7771/generate/video"
        with open(image, "rb") as f:
            img_data = f.read()
        img_base64 = base64.b64encode(img_data).decode("utf-8")
        payload = {
            "img_base64": img_base64,
            "prompt": prompt,
            "negative_prompt": negative_prompt
        }
        response = requests.post(url, data=payload)
        return response.json().get("filename", None)

    def generate_image(self, prompt):
        url = "http://localhost:7771/generate/image"
        payload = {"prompt": prompt}
        response = requests.post(url, data=payload)
        print("Image endpoint response:", response.json())
        return response.json().get("filename", None)

    def generate_descriptions(self, user_request):
        prompt_messages = agent_prompt(user_request)
        schema = agent_json_schema()
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=prompt_messages,
            response_format={"type": "json_schema", "json_schema": schema},
            temperature=0.5
        )
        print(response)
        try:
            data = json.loads(response.choices[0].message.content)
            self.data = data
            return data
        except Exception as e:
            self.data = None
            return None

    def save_data_to_json(self):
        with open("data.json", "w") as f:
            json.dump(self.data, f)
        with open("anims.json", "w") as f:
            json.dump(self.anims, f)
        with open("full_data.json", "w") as f:
            json.dump({"data": self.data, "anims": self.anims}, f)

@app.get("/process")
def process(user_request: str):
    agent = AnimationGeneratorAgent()
    # Example user request.
    data = agent.generate_descriptions(user_request)
    if data is None:
        raise HTTPException(status_code=500, detail="Failed to generate animation descriptions")
    try:
        agent.generate_static_img()
        agent.get_animations()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    # Optionally, save the generated data to JSON files.
    # agent.save_data_to_json()
    return {"data": agent.data, "anims": agent.anims}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=7773)