import os
from flask import Flask, send_file
from dotenv import load_dotenv

load_dotenv()

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

app = Flask(__name__, static_folder=WEB_DIR, static_url_path='/')


@app.route('/')
def index():
    return send_file(os.path.join(WEB_DIR, 'index.html'))


@app.route('/<path:filename>')
def serve_file(filename):
    filepath = os.path.join(WEB_DIR, filename)
    if os.path.exists(filepath):
        return send_file(filepath)
    return "404", 404


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
