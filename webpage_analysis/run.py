import sys
from webpage_utils.scraping import read_webpage_with_links, render_and_screenshot, encode_image
from webpage_utils.parsing import generate_webpage_report
import requests
from openai import OpenAI
import json
import bs4
import os
import base64


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python run.py <URL> <ASSISTANT_DESCRIPTION_FILE>")
        sys.exit(1)

    url = sys.argv[1]
    assistant_description_file = sys.argv[2]

    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    html_code = read_webpage_with_links(url)
    
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

    content = generate_webpage_report(client, html_code, json.dumps(content_list), boxed_image)
    
    print("Initial generation completed successfully.")

    assistant_prompt = """{assistant_description}
    His/her webshop has the following description: {description}"""
    with open(assistant_description_file, "r") as f:
        assistant_description = f.read()

    response = requests.get("http://localhost:7773/process", params={"user_request": assistant_prompt.format(
        assistant_description=assistant_description, description=content["description"])}, timeout=1800)
    full_content = response.json()

    full_content["webpage"] = content["description"]
    full_content["content_list"] = json.dumps(content_list)
    print("Assistant response generated successfully.")
    with open(f"full_data_{assistant_description_file.split('/')[-1].split('.')[0]}.json", "w") as f:
        json.dump(full_content, f)