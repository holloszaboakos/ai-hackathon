import sys
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import base64
from openai import OpenAI
import json
import bs4
import os

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

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

webpage_analysis_prompt = """"
You are an agent analyzing a webpage for a virtual assistant.
You have three inputs.
These are:
- the source code of a webpage
- a json-encoded list of interactable elements on the webpage with their index
- a screenshot of the webpage with the interactable elements and numbered by their index

Please analyze the webpage for interactable elements, such as buttons, forms, and links,
and provide possible reactions to interacting with elements from a virtual assistant.
The reactions are both a description field that describes the animation for a text-to-video model and the name field that identifies the animation.
These reactions should be informed by the theme of the webshop, and consist of movements of the assistant persona and their emotions.
You should also generate a short description of the webpage. This is for an assistant that helps users interact with webpages.
It should be detailed and informative and neutral in tone.
The return format should only be raw json string, and in this structure:
{
    "actions": [
        {
            "index": 0,
            "description": "the virtual assistant waves at the user",
            "name": "wave"
        },
        ...
    ],
    "description": "This is a webpage that sells shoes. It has a cart button and a search bar.",
}
"""

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python run.py <URL>")
        sys.exit(1)

    url = sys.argv[1]
    html_code = read_webpage(url)

    html_code_with_link_content = ""
    soup = bs4.BeautifulSoup(html_code, 'html.parser')
    links = [a['href'] for a in soup.find_all('a', href=True)]
    for link in links:
        if link.startswith("/"):
            link = url + link
        try:
            page_code = read_webpage(link)
            html_code += f"\n\nLink: {link}, html content: {page_code}"
        except:
            pass
    
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
                "role": "system",
                "content": [
                    {
                        "type": "text",
                        "text": webpage_analysis_prompt,
                    }
                ]
            },
            {
                "role": "user",
                "content": [
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

    content = json.loads(response.choices[0].message.content[7:-3])
    print("Initial generation completed successfully.")

    assistant_prompt = """
    This is a very hip and modern assistant that looks like a young anime girl with a ponytail.
    She is very energetic and friendly and always eager to help.
    She is very expressive and her movements are always exaggerated.
    Her webshop has the following description: {description}"""

    #print(assistant_prompt.format(description=content["description"], actions=json.dumps(content_list)))

    response = requests.get("http://localhost:7773/process", params={"user_request": assistant_prompt.format(description=content["description"])}, timeout=3600)
    full_content = response.json()
    #print(full_content)
    #print(content["description"])
    #print(json.dumps(content_list))
    full_content["webpage"] = content["description"]
    full_content["content_list"] = json.dumps(content_list)
    print("Assistant response generated successfully.")
    with open("full_data_new.json", "w") as f:
        json.dump(full_content, f)

    