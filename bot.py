import os
from flask import Flask, request
import requests
import json

app = Flask(__name__)
WEB_DIR = os.path.join(os.path.dirname(__file__), 'web')
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://telegram-snake-bot.onrender.com")

# Flask routes for web app
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

@app.route('/webhook', methods=['POST'])
def webhook():
    data = request.get_json()

    if 'message' in data:
        chat_id = data['message']['chat']['id']
        text = data['message'].get('text', '')

        if text == '/start':
            # Send message with Web App button
            keyboard = {
                "inline_keyboard": [[
                    {
                        "text": "🎮 Играть в приложении",
                        "web_app": {"url": WEB_APP_URL}
                    }
                ]]
            }

            message = {
                "chat_id": chat_id,
                "text": "🐍 Добро пожаловать в Snake Game!\n\nНажми на кнопку ниже чтобы начать играть!\n\nУправление: ⬆️⬇️⬅️➡️ или свайп",
                "reply_markup": keyboard
            }

            requests.post(f"https://api.telegram.org/bot{TOKEN}/sendMessage", json=message)

    return 'ok', 200

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
