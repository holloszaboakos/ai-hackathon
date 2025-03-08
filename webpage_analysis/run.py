import sys
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import base64
from openai import OpenAI
import json

def read_webpage(url):
    response = requests.get(url)
    if response.status_code == 200:
        return response.text

def render_and_screenshot(url):
    options = Options()
    options.headless = True
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    
    # Connect to the remote Selenium server
    driver = webdriver.Remote(
        command_executor='http://localhost:4444/wd/hub',
        options=options
    )
    driver.get(url)
    driver.save_screenshot('webpage_screenshot.png')
    driver.quit()

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

client = OpenAI()

webpage_analysis_prompt = """"These are the source code of a webpage,
a json-encoded list of interactable elements on the webpage with their index,
and a screenshot of the webpage with the interactable elements and numbered by their index.
Please analyze the webpage for interactable elements, such as buttons, forms, and links,
and provide possible reactions from a virtual assistant helping the user interact with the webpage.
The reactions are both a text that the assistant says and an emotion and / or movement.
These reactions should be funny, witty and should make the user feel comfortable and engaged.
Give these possible reactions in a list with the indexes from the json-encoded list."""

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    html_code = read_webpage(url)
    render_and_screenshot(url)
    print("Screenshot saved successfully.")

    base64_image = encode_image("webpage_screenshot.png")

    result = requests.post("http://localhost:12320/parse", json={"base64_image": base64_image})
    content_list = result.json()["parsed_content_list"]
    for i, c in enumerate(content_list):
        c["index"] = i
    boxed_image = result.json()["som_image_base64"]
    with open("boxed_image.png", "wb") as f:
        f.write(base64.b64decode(boxed_image))
    print("Omniparser ran succesfully.")


    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": webpage_analysis_prompt,
                    },
                    {
                        "type": "text",
                        "text": json.dumps(content_list),
                    },
                    {
                        "type": "text",
                        "text": html_code,
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/png;base64,{boxed_image}"},
                    },
                ],
            }
        ],
    )

    print(response.choices[0].message.content)