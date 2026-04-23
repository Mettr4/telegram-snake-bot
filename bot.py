import os
import sys
from flask import Flask, send_file
from dotenv import load_dotenv

print("[BOT] Starting...", file=sys.stderr)
load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

print(f"[BOT] WEB_DIR: {WEB_DIR}", file=sys.stderr)
print(f"[BOT] WEB_DIR exists: {os.path.exists(WEB_DIR)}", file=sys.stderr)

app = Flask(__name__, static_folder=WEB_DIR, static_url_path='/')

print("[BOT] Flask app created", file=sys.stderr)


@app.route('/')
def index():
    print("[ROUTE] GET /", file=sys.stderr)
    return send_file(os.path.join(WEB_DIR, 'index.html'))


@app.route('/<path:filename>')
def serve_file(filename):
    print(f"[ROUTE] GET /{filename}", file=sys.stderr)
    filepath = os.path.join(WEB_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return "404", 404


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    print(f"[BOT] PORT env: {os.getenv('PORT')}", file=sys.stderr)
    print(f"[BOT] Running on 0.0.0.0:{port}", file=sys.stderr)
    sys.stderr.flush()
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
