import json

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


def generate_webpage_report(client, html_code, content_list_str, boxed_image):
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
                        "text": content_list_str,
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

    return json.loads(response.choices[0].message.content[7:-3])