import os
from flask import Flask, send_file
from dotenv import load_dotenv

print("[BOT] Starting...")
load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

print(f"[BOT] WEB_DIR: {WEB_DIR}")
print(f"[BOT] WEB_DIR exists: {os.path.exists(WEB_DIR)}")

app = Flask(__name__, static_folder=WEB_DIR, static_url_path='/')

print("[BOT] Flask app created")


@app.route('/')
def index():
    print("[ROUTE] GET /")
    return send_file(os.path.join(WEB_DIR, 'index.html'))


@app.route('/<path:filename>')
def serve_file(filename):
    print(f"[ROUTE] GET /{filename}")
    filepath = os.path.join(WEB_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return "404", 404


if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    print(f"[BOT] PORT: {port}")
    print(f"[BOT] Starting Flask server...")
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
