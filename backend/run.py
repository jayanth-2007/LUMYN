import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    host = os.getenv("HOST", "127.0.0.1")
    debug = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1")
    print(f"\n=======================================================")
    print(f"  LUMYN Backend Server running on http://{host}:{port}")
    print(f"  Storage Mode: File-based JSON & Uploads (NO DATABASE)")
    print(f"=======================================================\n")
    app.run(host=host, port=port, debug=debug)
