import os
import threading
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
from flask import Flask, send_from_directory

load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "http://localhost:8080")

# Flask app for serving web game
app = Flask(__name__)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')


@app.route('/')
def index():
    return send_from_directory(WEB_DIR, 'index.html')


@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(WEB_DIR, path)


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🎮 Играть в приложении", web_app=WebAppInfo(url=WEB_APP_URL))],
        [InlineKeyboardButton("📖 Правила", callback_data="rules")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(
        "🐍 Добро пожаловать в Snake Game!\n\n"
        "Нажми на кнопку ниже чтобы начать играть в полноценное приложение с пиксель-артом!\n\n"
        "Управление:\n"
        "⬆️⬇️⬅️➡️ - Стрелки или свайп на экране\n"
        "Ешь яблоки и избегай столкновений!",
        reply_markup=reply_markup
    )


def run_telegram_bot():
    tg_app = Application.builder().token(TOKEN).build()
    tg_app.add_handler(CommandHandler("start", start))
    print("🤖 Telegram бот запущен...")
    tg_app.run_polling()


def start_bot_thread():
    bot_thread = threading.Thread(target=run_telegram_bot, daemon=True)
    bot_thread.start()


if __name__ == "__main__":
    start_bot_thread()
    print("🌐 Веб-сервер запущен на http://0.0.0.0:8080")
    app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)
