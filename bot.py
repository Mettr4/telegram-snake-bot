import sys
print("BOT.PY: Loading...", file=sys.stderr, flush=True)

from flask import Flask

print("BOT.PY: Flask imported", file=sys.stderr, flush=True)

app = Flask(__name__)

print("BOT.PY: App created", file=sys.stderr, flush=True)

@app.route('/test')
def test():
    return "TEST OK"

@app.route('/')
def index():
    return "HELLO WORLD"

print("BOT.PY: Routes registered", file=sys.stderr, flush=True)
