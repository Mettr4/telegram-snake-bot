import os
from flask import Flask, send_file

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

app = Flask(__name__)


@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def catch_all(path):
    # Если path пуст - это запрос к корню
    if path == '' or path == '/':
        filepath = os.path.join(WEB_DIR, 'index.html')
    else:
        filepath = os.path.join(WEB_DIR, path)

    # Проверяем существует ли файл
    if os.path.exists(filepath):
        try:
            return send_file(filepath)
        except Exception as e:
            return f"Error sending file: {e}", 500

    # Если это запрос к папке - попробуем загрузить index.html
    if os.path.isdir(filepath):
        index_path = os.path.join(filepath, 'index.html')
        if os.path.exists(index_path):
            return send_file(index_path)

    return f"Not found: {filepath}", 404
