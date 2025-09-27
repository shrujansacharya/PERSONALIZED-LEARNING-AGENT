from flask import Flask, request, jsonify
from diffusers import StableDiffusionPipeline
import torch
import os
from datetime import datetime
import sys

app = Flask(__name__)

MODEL_PATH = "./stable-diffusion-v1-4"
OUTPUT_DIR = "./uploads/theme_images"

try:
    pipe = StableDiffusionPipeline.from_pretrained(MODEL_PATH, torch_dtype=torch.float32)
    if torch.cuda.is_available():
        pipe = pipe.to("cuda")
        sys.stderr.write("Model loaded successfully on GPU.\n")
    else:
        pipe = pipe.to("cpu")
        sys.stderr.write("Model loaded successfully on CPU.\n")
except Exception as e:
    sys.stderr.write(f"Error loading model: {e}\n")
    sys.exit(1)

def generate_image(prompt):
    try:
        sys.stderr.write("Starting image generation...\n")
        image = pipe(prompt).images[0]
        os.makedirs(OUTPUT_DIR, exist_ok=True)
        filename = f"{hash(prompt)}-{datetime.now().strftime('%Y%m%d%H%M%S%f')}.png"
        image_path = os.path.join(OUTPUT_DIR, filename)
        image.save(image_path)
        sys.stderr.write("Image generated successfully.\n")
        return image_path.replace("\\", "/").replace("./", "/")
    except Exception as e:
        sys.stderr.write(f"Error generating image: {e}\n")
        return None

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({'error': 'No prompt provided'}), 400
    image_path = generate_image(prompt)
    if image_path:
        return jsonify({'path': image_path})
    else:
        return jsonify({'error': 'Failed to generate image'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
