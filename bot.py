import os
from flask import Flask
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "http://localhost:8080")

app = Flask(__name__)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

print("[OK] Flask app created")
print(f"[OK] WEB_DIR: {WEB_DIR}")
print(f"[OK] WEB_DIR exists: {os.path.exists(WEB_DIR)}")


@app.route('/', methods=['GET'])
def index():
    try:
        with open(os.path.join(WEB_DIR, 'index.html'), 'r') as f:
            return f.read()
    except Exception as e:
        return f"Error: {e}", 500


@app.route('/<filename>', methods=['GET'])
def serve_file(filename):
    try:
        filepath = os.path.join(WEB_DIR, filename)
        with open(filepath, 'rb') as f:
            return f.read()
    except FileNotFoundError:
        return "404 Not Found", 404
    except Exception as e:
        return f"Error: {e}", 500
