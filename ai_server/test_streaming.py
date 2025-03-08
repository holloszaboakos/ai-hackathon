import os
import json
import websocket
import base64
import wave

def save_pcm16_as_wav(base64_data, output_filename, sample_rate=24000, channels=1):
    # Decode Base64 data
    pcm_data = base64.b64decode(base64_data)
    
    # Save as a WAV file
    with wave.open(output_filename, 'wb') as wf:
        wf.setnchannels(channels)  # Mono or Stereo
        wf.setsampwidth(2)  # PCM16 uses 2 bytes per sample
        wf.setframerate(sample_rate)  # Set the sample rate
        wf.writeframes(pcm_data)  # Write PCM data

        # Read the base64 data from message.txt


with open('full_response.txt', 'r') as file:
            base64_data = file.read().strip()

        # Call the function with the read data
save_pcm16_as_wav(base64_data, 'output2.wav')
