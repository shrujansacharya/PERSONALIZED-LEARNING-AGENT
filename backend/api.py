# api.py
import sys
import os
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch

# --- Load the model ONCE at startup ---
MODEL_PATH = "./stable-diffusion-v1-4"

try:
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    pipe = StableDiffusionPipeline.from_pretrained(MODEL_PATH, torch_dtype=dtype, local_files_only=True)
    pipe = pipe.to("cuda" if torch.cuda.is_available() else "cpu")
    print("✅ Model loaded successfully.", file=sys.stderr)
except Exception as e:
    print(f"❌ Error loading model: {e}", file=sys.stderr)
    sys.exit(1)

# --- Flask App ---
app = Flask(__name__)
CORS(app)

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()
    prompt = data.get('prompt')

    if not prompt:
        return jsonify({'error': 'Prompt is required.'}), 400

    try:
        print("🎨 Generating image...", file=sys.stderr)
        image = pipe(prompt, num_inference_steps=25).images[0]

        # Convert to Base64
        buffer = io.BytesIO()
        image.save(buffer, format="PNG")
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.read()).decode("utf-8")

        print("✅ Image generated successfully.", file=sys.stderr)
        return jsonify({'image_base64': img_base64})

    except Exception as e:
        print(f"❌ Error generating image: {e}", file=sys.stderr)
        return jsonify({'error': 'Failed to generate image.'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)
