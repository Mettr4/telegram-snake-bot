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


@app.before_request
def log_request():
    from flask import request
    print(f"[HTTP] {request.method} {request.path}", file=sys.stderr)


@app.route('/', methods=['GET'])
def index():
    filepath = os.path.join(WEB_DIR, 'index.html')
    print(f"[ROUTE] GET / -> {filepath}", file=sys.stderr)
    print(f"[ROUTE] File exists: {os.path.exists(filepath)}", file=sys.stderr)
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            print(f"[ROUTE] SUCCESS: Serving {len(content)} bytes", file=sys.stderr)
            return content
    except Exception as e:
        print(f"[ROUTE] ERROR: {e}", file=sys.stderr)
        return f"Error: {e}", 500


@app.route('/<filename>', methods=['GET'])
def serve_file(filename):
    filepath = os.path.join(WEB_DIR, filename)
    print(f"[ROUTE] GET /{filename} -> {filepath}", file=sys.stderr)
    print(f"[ROUTE] File exists: {os.path.exists(filepath)}", file=sys.stderr)
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            print(f"[ROUTE] SUCCESS: Serving {len(content)} bytes", file=sys.stderr)
            return content
    except FileNotFoundError:
        print(f"[ROUTE] ERROR: File not found", file=sys.stderr)
        return "404 Not Found", 404
    except Exception as e:
        print(f"[ROUTE] ERROR: {e}", file=sys.stderr)
        return f"Error: {e}", 500
