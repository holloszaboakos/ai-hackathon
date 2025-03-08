import requests
import base64

def test_generate_image():
    url = "http://localhost:7771/generate/image"
    payload = {'prompt': 'A cute dog sitting in a field'}
    response = requests.post(url, data=payload)
    print("Image endpoint response:", response.json())

def test_generate_video():
    url = "http://localhost:7771/generate/video"
    with open("example.png", "rb") as f:
        img_data = f.read()
    img_base64 = base64.b64encode(img_data).decode('utf-8')
    payload = {
        'img_base64': img_base64,
        'prompt': 'A cute dog doing jiujitsu',
        'negative_prompt': 'still, static'
    }
    response = requests.post(url, data=payload)
    print("Video endpoint response:", response.json())

if __name__ == "__main__":
    test_generate_image()
    test_generate_video()
