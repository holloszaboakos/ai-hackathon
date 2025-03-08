

# Requirements
- Python 3.11.11
- Docker Engine 28.0.0
- Docker Compose v2.33.0
- npm 10.9
- Node.js 22.14

# Communication ports
- React client 3000
- Backend server 8000
- Selenium 4444
- Omniparser 12320
- Comfyui 8188
- Wan2.1 prompter server 7771
- Video artifact httpd server 7772
- Animation generator API (for agentic use) 7773

# AI Dependencies and Installation
- OpenAI (gpt-4o-mini-realtime) - Whisper included
- OmniParserv2 (as indicated in the omniparser repository [here](https://github.com/microsoft/OmniParser))
- Wan2.1 14B 720p 8bit (+vae, +clip, +t5) as per the huggingface comfy UI [repository](https://huggingface.co/Comfy-Org/Wan_2.1_ComfyUI_repackaged)
- Flux.1 Schnell (with 8bit t5)

We have refrained from Hunyuan and MotionGPT due to their reliance on either high computational resources or the unmaintained nature of their codebase.