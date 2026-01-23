# Backend Service

## Setup

1.  **Install Node Dependencies**:
    ```bash
    npm install
    ```

2.  **Install Python Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Environment Variables**:
    Ensure `.env` contains `OPENAI_API_KEY`, `MONGODB_URI`, etc.

## Running Locally

You need to run **BOTH** the Node.js server and the Python API.

1.  **Run Node.js Server** (Terminal 1):
    ```bash
    npm start
    ```
    *(Runs on port 5001)*

2.  **Run Python AI Service** (Terminal 2):
    ```bash
    python api.py
    ```
    *(Runs on port 5002)*

## Deployment

- **Node Backend**: Deploy as a Web Service (Command: `npm start`).
- **Python Backend**: Deploy as a Web Service (Command: `gunicorn -w 1 -b 0.0.0.0:5002 api:app` or `python api.py`).
- **Environment**: Set `PYTHON_API_URL` on the Node service to point to the Python service URL.
