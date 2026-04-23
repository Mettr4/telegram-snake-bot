import sys
import traceback

print("[WSGI] Starting import...", file=sys.stderr)
try:
    from bot import app
    print("[WSGI] Successfully imported app", file=sys.stderr)
except Exception as e:
    print(f"[WSGI] ERROR importing app: {e}", file=sys.stderr)
    traceback.print_exc(file=sys.stderr)
    raise

if __name__ == "__main__":
    app.run()
