import os
from flask import Flask, request
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler
import asyncio

app = Flask(__name__)
WEB_DIR = os.path.join(os.path.dirname(__file__), 'web')
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "https://telegram-snake-bot.onrender.com")

# Telegram Bot
tg_app = Application.builder().token(TOKEN).build()

async def start(update: Update, context):
    keyboard = [
        [InlineKeyboardButton("🎮 Играть в приложении", web_app=WebAppInfo(url=WEB_APP_URL))],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "🐍 Добро пожаловать в Snake Game!\n\n"
        "Нажми на кнопку ниже чтобы начать играть!\n\n"
        "Управление: ⬆️⬇️⬅️➡️ или свайп",
        reply_markup=reply_markup
    )

tg_app.add_handler(CommandHandler("start", start))

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
async def webhook():
    data = request.get_json()
    update = Update.de_json(data, tg_app.bot)
    await tg_app.process_update(update)
    return 'ok'

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
