import os
from flask import Flask

app = Flask(__name__)
WEB_DIR = os.path.dirname(os.path.abspath(__file__)) + '/web'


def read_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except:
        with open(filepath, 'rb') as f:
            return f.read()


@app.route('/', defaults={'path': 'index.html'})
@app.route('/<path:path>')
def serve(path):
    filepath = os.path.join(WEB_DIR, path)

    # Если запрашивают папку - отдаем index.html
    if os.path.isdir(filepath):
        filepath = os.path.join(filepath, 'index.html')

    # Если файл существует - отдаем его
    if os.path.isfile(filepath):
        try:
            content = read_file(filepath)
            return content
        except Exception as e:
            return f"Error: {e}", 500

    return "404 Not Found", 404
