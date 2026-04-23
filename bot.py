import os
import asyncio
from dotenv import load_dotenv
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from game import SnakeGame, Direction

load_dotenv()
TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")

games = {}


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    games[user_id] = SnakeGame()

    keyboard = [
        [InlineKeyboardButton("⬆️", callback_data="up")],
        [InlineKeyboardButton("⬅️", callback_data="left"),
         InlineKeyboardButton("⬇️", callback_data="down"),
         InlineKeyboardButton("➡️", callback_data="right")],
        [InlineKeyboardButton("🔄 Новая игра", callback_data="restart")],
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)

    message = await update.message.reply_text(
        "🐍 Игра Змейка!\n\n" + games[user_id].render(),
        reply_markup=reply_markup
    )
    context.user_data['game_message_id'] = message.message_id
    context.user_data['game_task'] = asyncio.create_task(game_loop(user_id, update, context))


async def button(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    user_id = query.from_user.id

    if user_id not in games:
        await query.answer("Сначала начните игру с /start")
        return

    game = games[user_id]

    if query.data == "up":
        game.set_direction(Direction.UP)
    elif query.data == "down":
        game.set_direction(Direction.DOWN)
    elif query.data == "left":
        game.set_direction(Direction.LEFT)
    elif query.data == "right":
        game.set_direction(Direction.RIGHT)
    elif query.data == "restart":
        game.reset()

    await query.answer()


async def game_loop(user_id: int, update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        while True:
            if user_id not in games:
                break

            game = games[user_id]
            game.update()

            keyboard = [
                [InlineKeyboardButton("⬆️", callback_data="up")],
                [InlineKeyboardButton("⬅️", callback_data="left"),
                 InlineKeyboardButton("⬇️", callback_data="down"),
                 InlineKeyboardButton("➡️", callback_data="right")],
                [InlineKeyboardButton("🔄 Новая игра", callback_data="restart")],
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)

            text = game.render()
            if game.game_over:
                text += "\n\n💀 Игра окончена! Нажми 🔄 для новой игры"

            try:
                await context.bot.edit_message_text(
                    chat_id=update.effective_chat.id,
                    message_id=context.user_data.get('game_message_id'),
                    text=text,
                    reply_markup=reply_markup
                )
            except:
                pass

            await asyncio.sleep(0.5)
    except asyncio.CancelledError:
        pass


def main():
    app = Application.builder().token(TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(CallbackQueryHandler(button))

    print("🤖 Бот запущен...")
    app.run_polling()


if __name__ == "__main__":
    main()
