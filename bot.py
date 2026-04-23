import sys
import os

print("BOT.PY: Loading...", flush=True)

from flask import Flask

print("BOT.PY: Flask imported", flush=True)

app = Flask(__name__)

print("BOT.PY: App created", flush=True)

@app.route('/test')
def test():
    return "TEST OK"

@app.route('/')
def index():
    return "HELLO WORLD"

print("BOT.PY: Routes registered", flush=True)

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8080))
    print(f"BOT.PY: Starting on port {port}", flush=True)
    app.run(host='0.0.0.0', port=port, debug=False)
