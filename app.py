# ─────────────────────────────────────────────────────
# app.py  — Flask application entry point
# ─────────────────────────────────────────────────────

from flask import Flask, send_from_directory
from flask_cors import CORS
from backend.routes import match_bp
import os

app = Flask(
    __name__,
    static_folder="frontend",
    static_url_path="",
)
CORS(app)

# Register API blueprint
app.register_blueprint(match_bp)

# Serve the frontend SPA
@app.route("/")
@app.route("/<path:path>")
def serve_frontend(path="index.html"):
    file_path = os.path.join(app.static_folder, path)
    if os.path.isfile(file_path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
