from io import BytesIO

from app import create_app
from app.extensions import db
from app.seed import seed_demo_data


def create_test_client():
    app = create_app(
        {
            "TESTING": True,
            "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
            "SEED_ON_BOOT": False,
            "UPLOAD_FOLDER": "test_uploads",
        }
    )
    with app.app_context():
        db.create_all()
        seed_demo_data()
    return app.test_client()


def test_bootstrap_payload():
    client = create_test_client()
    response = client.get("/api/bootstrap")
    assert response.status_code == 200
    data = response.get_json()
    assert data["map"]["sourceName"] == "故宫博物院开放区域总图"
    assert len(data["pois"]) >= 30
    assert len(data["routes"]) >= 6
    assert len(data["quests"]) >= 3
    assert any(item["title"] == "交泰殿东侧文创融合馆" for item in data["pois"])


def test_auth_and_admin_flow():
    client = create_test_client()

    register_response = client.post(
        "/api/auth/register",
        json={"account": "newvisitor", "password": "visitor123", "nickname": "新游客"},
    )
    assert register_response.status_code == 200
    token = register_response.get_json()["token"]

    session_response = client.get("/api/auth/session", headers={"X-Auth-Token": token})
    assert session_response.status_code == 200
    assert session_response.get_json()["authenticated"] is True

    forbidden_response = client.get("/api/admin/overview", headers={"X-Auth-Token": token})
    assert forbidden_response.status_code == 403

    admin_login = client.post(
        "/api/auth/login",
        json={"account": "admin", "password": "admin123", "role": "ADMIN"},
    )
    assert admin_login.status_code == 200
    admin_token = admin_login.get_json()["token"]

    admin_overview = client.get("/api/admin/overview", headers={"X-Auth-Token": admin_token})
    assert admin_overview.status_code == 200
    assert admin_overview.get_json()["poiCount"] >= 30


def test_upload_and_reflection_flow():
    client = create_test_client()
    upload_response = client.post(
        "/api/uploads",
        data={
            "poiId": "1",
            "caption": "测试上传",
            "file": (BytesIO(b"fake-image-data"), "demo.jpg"),
        },
        content_type="multipart/form-data",
    )
    assert upload_response.status_code == 200
    upload_data = upload_response.get_json()
    assert upload_data["upload"]["status"] == "PENDING"

    reflection_response = client.post(
        "/api/reflections",
        json={
            "poiId": 1,
            "title": "测试感悟",
            "content": "这里的空间层次很漂亮。",
            "imageUrl": upload_data["upload"]["imageUrl"],
            "moodTag": "惊喜",
            "isPublic": True,
        },
    )
    assert reflection_response.status_code == 200
    reflection_data = reflection_response.get_json()
    assert reflection_data["reflection"]["status"] == "PENDING"
