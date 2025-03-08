FROM huggingface/transformers-pytorch-gpu

# clone omniparser
WORKDIR /workspace
RUN git clone https://github.com/microsoft/OmniParser.git

# install dependencies
WORKDIR /workspace/OmniParser
RUN pip install -r requirements.txt

# download models
RUN mkdir weights
RUN huggingface-cli download microsoft/OmniParser-v2.0 --local-dir ./weights

RUN mv /workspace/OmniParser/weights/icon_caption /workspace/OmniParser/weights/icon_caption_florence

WORKDIR /workspace/OmniParser/omnitool/omniparserserver

EXPOSE 8000

ENTRYPOINT ["python3", "-m", "omniparserserver", "--som_model_path", "/workspace/OmniParser/weights/icon_detect/model.pt", "--caption_model_name", "florence2", "--caption_model_path", "/workspace/OmniParser/weights/icon_caption_florence/", "--device", "cuda", "--BOX_TRESHOLD", "0.05"]