import os
from flask import Flask

app = Flask(__name__)
WEB_DIR = os.path.join(os.path.dirname(__file__), 'web')

@app.route('/')
def index():
    try:
        with open(os.path.join(WEB_DIR, 'index.html')) as f:
            return f.read()
    except:
        return "404", 404

@app.route('/<path:path>')
def serve(path):
    try:
        with open(os.path.join(WEB_DIR, path), 'rb') as f:
            return f.read()
    except:
        return "404", 404

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
