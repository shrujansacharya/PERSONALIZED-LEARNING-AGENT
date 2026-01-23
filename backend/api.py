# api.py
import os
import io
import base64
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/generate', methods=['POST'])
def generate():
    try:
        data = request.get_json()
        prompt = data.get('prompt')

        if not prompt:
            return jsonify({'error': 'Prompt is required.'}), 400

        print(f"🎨 Generating image for prompt: {prompt}")

        # Use Stability AI instead of OpenAI
        api_host = os.getenv('API_HOST', 'https://api.stability.ai')
        api_key = os.getenv("STABILITY_API_KEY")
        engine_id = "stable-diffusion-xl-1024-v1-0" # Updated to a valid engine ID

        if not api_key:
             return jsonify({'error': 'STABILITY_API_KEY not found in environment.'}), 500

        import requests
        response = requests.post(
            f"{api_host}/v1/generation/{engine_id}/text-to-image",
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": f"Bearer {api_key}"
            },
            json={
                "text_prompts": [
                    {
                        "text": prompt
                    }
                ],
                "cfg_scale": 7,
                "height": 1024,
                "width": 1024,
                "samples": 1,
                "steps": 30,
            },
        )

        if response.status_code != 200:
            raise Exception(f"Non-200 response: {response.text}")

        data = response.json()
        # Stability returns a list of artifacts
        image_data = data["artifacts"][0]["base64"]

        return jsonify({'image_base64': image_data})

    except Exception as e:
        print(f"❌ Error generating image: {e}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PYTHON_PORT', 5002))
    app.run(host='0.0.0.0', port=port)
