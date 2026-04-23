import os
from flask import Flask

app = Flask(__name__)
WEB_DIR = os.path.join(os.path.dirname(__file__), 'web')

@app.route('/')
def index():
    filepath = os.path.join(WEB_DIR, 'index.html')
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return f.read()
    return "index.html not found", 404

@app.route('/<path:path>')
def serve(path):
    filepath = os.path.join(WEB_DIR, path)
    if os.path.exists(filepath) and os.path.isfile(filepath):
        with open(filepath, 'rb') as f:
            return f.read()
    return "404", 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    print(f'Starting on port {port}')
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
