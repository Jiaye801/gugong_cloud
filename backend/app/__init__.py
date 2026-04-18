import os
from typing import Optional

from flask import Flask, send_from_directory

from .extensions import cors, db
from .routes import api_bp
from .seed import seed_demo_data


def create_app(test_config: Optional[dict] = None) -> Flask:
    app = Flask(__name__, static_folder="static")
    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "demo-palace-secret"),
        SQLALCHEMY_DATABASE_URI=os.environ.get("DATABASE_URL", "sqlite:///immersive_guide.db"),
        SQLALCHEMY_TRACK_MODIFICATIONS=False,
        JSON_AS_ASCII=False,
        UPLOAD_FOLDER=os.environ.get("UPLOAD_FOLDER", "app/uploads"),
        MAX_CONTENT_LENGTH=int(os.environ.get("MAX_CONTENT_LENGTH", 8 * 1024 * 1024)),
        SEED_ON_BOOT=os.environ.get("SEED_ON_BOOT", "true").lower() == "true",
    )

    if test_config:
        app.config.update(test_config)

    db.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})

    with app.app_context():
        db.create_all()
        if app.config.get("SEED_ON_BOOT", True):
            seed_demo_data()

    app.register_blueprint(api_bp, url_prefix="/api")

    @app.get("/health")
    def health():
        return {"ok": True}

    @app.get("/uploads/<path:filename>")
    def uploaded_file(filename: str):
        return send_from_directory(app.config["UPLOAD_FOLDER"], filename)

    return app
