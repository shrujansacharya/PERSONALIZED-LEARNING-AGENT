# api.py
import sys
import os
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from diffusers import StableDiffusionPipeline
import torch

# Optional helper to download from Hugging Face if model folder missing
from huggingface_hub import snapshot_download

MODEL_PATH = "./stable-diffusion-v1-4"
# Set HF_REPO_ID env var to your HF repo (e.g. "CompVis/stable-diffusion-v1-4" or "youruser/your-model")
HF_REPO_ID = os.getenv("HF_REPO_ID", "CompVis/stable-diffusion-v1-4")
HF_TOKEN = os.getenv("HF_TOKEN", None)  # required for private model repos

def ensure_model():
    """Download model from HF if MODEL_PATH is missing or empty."""
    if os.path.exists(MODEL_PATH) and os.listdir(MODEL_PATH):
        print(f"Model directory found at {MODEL_PATH}. Skipping download.", file=sys.stderr)
        return

    print(f"Model not found at {MODEL_PATH}. Attempting to download from HF repo '{HF_REPO_ID}'...", file=sys.stderr)
    try:
        snapshot_download(repo_id=HF_REPO_ID, local_dir=MODEL_PATH, token=HF_TOKEN, repo_type="model")
        print("Download complete.", file=sys.stderr)
    except Exception as e:
        print(f"❌ Failed to download model from Hugging Face: {e}", file=sys.stderr)
        print("Make sure HF_REPO_ID is correct and HF_TOKEN is set for private repos.", file=sys.stderr)
        sys.exit(1)

# --- Ensure model is present, then load ---
ensure_model()

try:
    dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    # Use local_files_only=True to avoid trying to fetch from HF at load time
    pipe = StableDiffusionPipeline.from_pretrained(MODEL_PATH, torch_dtype=dtype, local_files_only=True)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    pipe = pipe.to(device)
    print(f"✅ Model loaded successfully on {device}.", file=sys.stderr)
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
