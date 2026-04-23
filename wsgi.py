import os
import sys
import traceback

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    print("DEBUG: Importing bot module...")
    from bot import app
    print("DEBUG: Successfully imported bot and app!")
    print(f"DEBUG: App = {app}")
except Exception as e:
    print(f"ERROR: Failed to import bot: {e}")
    traceback.print_exc()
    raise

if __name__ == "__main__":
    port = int(os.getenv('PORT', 8080))
    app.run(host='0.0.0.0', port=port)
