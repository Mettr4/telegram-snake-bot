import os
from flask import Flask

app = Flask(__name__)
WEB_DIR = os.path.dirname(__file__) + '/web'


@app.route('/')
def index():
    try:
        with open(os.path.join(WEB_DIR, 'index.html'), 'r') as f:
            return f.read()
    except:
        return "index.html not found", 404


@app.route('/<path:path>')
def serve(path):
    try:
        filepath = os.path.join(WEB_DIR, path)
        with open(filepath, 'rb') as f:
            return f.read()
    except:
        return "404", 404
