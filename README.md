# 🐍 Telegram Snake Game Bot

Простой бот для Telegram с игрой "Змейка" на Python.

## 📋 Требования

- Python 3.8+
- Токен Telegram Bot API

## 🚀 Установка

1. Создайте виртуальное окружение:
```bash
python -m venv venv
source venv/bin/activate  # На Windows: venv\Scripts\activate
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

4. Добавьте ваш токен бота в `.env`:
```
TELEGRAM_BOT_TOKEN=your_actual_bot_token_here
```

## 🎮 Запуск

```bash
python bot.py
```

## 📖 Как играть

1. Отправьте `/start` боту
2. Используйте кнопки для управления змейкой
3. Ешьте яблоки 🍎 и избегайте столкновений
4. Нажмите 🔄 чтобы начать новую игру

## 🎯 Игровые правила

- Змейка движется по сетке 10x10
- Съедание яблока добавляет 10 очков
- Столкновение со стеной или самой собой заканчивает игру
