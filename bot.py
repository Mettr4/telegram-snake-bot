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
flask_app = Flask(__name__)
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')


@flask_app.route('/')
def index():
    return send_from_directory(WEB_DIR, 'index.html')


@flask_app.route('/<path:path>')
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


def run_flask():
    flask_app.run(host='0.0.0.0', port=8080, debug=False, use_reloader=False)


def run_telegram_bot():
    app = Application.builder().token(TOKEN).build()
    app.add_handler(CommandHandler("start", start))

    print("🤖 Telegram бот запущен...")
    app.run_polling()


def main():
    # Start Flask in background thread
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()

    print("🌐 Веб-сервер запущен на http://0.0.0.0:8080")

    # Run Telegram bot in main thread
    run_telegram_bot()


if __name__ == "__main__":
    main()
