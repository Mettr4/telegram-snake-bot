from flask import Flask

app = Flask(__name__)

@app.route('/test')
def test():
    return "TEST OK"

@app.route('/')
def index():
    return "HELLO WORLD"
