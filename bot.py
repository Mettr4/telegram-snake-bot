import os
import sys
from flask import Flask
from dotenv import load_dotenv

print("[BOT] Loading environment...", file=sys.stderr)
load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "http://localhost:8080")

print("[BOT] Creating Flask app...", file=sys.stderr)
app = Flask(__name__)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

print(f"[BOT] Flask app created", file=sys.stderr)
print(f"[BOT] WEB_DIR: {WEB_DIR}", file=sys.stderr)
print(f"[BOT] WEB_DIR exists: {os.path.exists(WEB_DIR)}", file=sys.stderr)


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
