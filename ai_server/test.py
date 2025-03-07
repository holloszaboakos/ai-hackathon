import asyncio
import websockets
import json

async def send_json_data(uri, data):
    async with websockets.connect(uri) as websocket:
        await websocket.send(json.dumps(data))
        response = await websocket.recv()
        print(f"Received response: {response}")

if __name__ == "__main__":
    uri = "ws://localhost:8000"
    data = {
        "eventType": "hover",
        "timestamp": "2025-03-07T12:34:56Z",
        "user": {
            "id": "123456",
            "sessionId": "abc-def-ghi-789"
        },
        "page": {
            "url": "https://examplewebshop.com/products",
            "title": "Product Listing"
        },
        "interaction": {
            "element": {
                "componentType": "ProductCard",
                "reactProps": {
                    "id": "product-98765",
                    "name": "Wireless Headphones",
                    "price": "$99.99",
                    "imageSrc": "https://examplewebshop.com/images/headphones.jpg",
                    "link": "https://examplewebshop.com/product/98765"
                },
                "textContent": "Wireless Headphones - $99.99",
                "position": {
                    "x": 250,
                    "y": 400
                }
            }
        }
    }
    asyncio.get_event_loop().run_until_complete(send_json_data(uri, data))