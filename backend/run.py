import sys
import os

from app import create_app
from app.extensions import db
from app.seed import seed_demo_data


def init_database():
    app = create_app({"SEED_ON_BOOT": False})
    with app.app_context():
        db.drop_all()
        db.create_all()
        seed_demo_data()
    print("database initialized")


def run_server():
    app = create_app()
    port = int(os.environ.get("PORT", "5000"))
    app.run(debug=True, port=port)


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "init-db":
        init_database()
    else:
        run_server()
