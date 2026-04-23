import os
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, ContextTypes
from flask import Flask, send_from_directory, request
import logging

load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
WEB_APP_URL = os.getenv("WEB_APP_URL", "http://localhost:8080")
WEBHOOK_URL = os.getenv("WEBHOOK_URL", "https://example.com")

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Flask app
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
WEB_DIR = os.path.join(SCRIPT_DIR, 'web')

# Debug: print paths
print(f"DEBUG: SCRIPT_DIR = {SCRIPT_DIR}")
print(f"DEBUG: WEB_DIR = {WEB_DIR}")
print(f"DEBUG: WEB_DIR exists = {os.path.exists(WEB_DIR)}")
if os.path.exists(WEB_DIR):
    print(f"DEBUG: WEB_DIR contents = {os.listdir(WEB_DIR)}")

app = Flask(__name__, static_folder=WEB_DIR, static_url_path='')

# Telegram app
tg_app = Application.builder().token(TOKEN).build()


@app.route('/')
def index():
    return send_from_directory(WEB_DIR, 'index.html')


@app.route('/<path:filename>')
def serve_static(filename):
    return send_from_directory(WEB_DIR, filename)


@app.route('/telegram/webhook', methods=['POST'])
async def telegram_webhook():
    data = request.get_json()
    if data:
        update = Update.de_json(data, tg_app.bot)
        await tg_app.process_update(update)
    return 'ok'


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [InlineKeyboardButton("🎮 Играть в приложении", web_app=WebAppInfo(url=WEB_APP_URL))],
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


async def initialize():
    tg_app.add_handler(CommandHandler("start", start))
    print("🤖 Telegram бот инициализирован (webhook mode)")


@app.before_request
async def setup():
    if not hasattr(app, '_telegram_initialized'):
        await initialize()
        app._telegram_initialized = True


if __name__ == "__main__":
    port = int(os.getenv('PORT', 8080))
    print(f"🌐 Веб-сервер запущен на http://0.0.0.0:{port}")
    # For local development only
    app.run(host='0.0.0.0', port=port, debug=False, use_reloader=False)
