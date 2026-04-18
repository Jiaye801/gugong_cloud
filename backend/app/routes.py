from __future__ import annotations

import os
import uuid
from datetime import datetime, timezone
from typing import Optional

from flask import Blueprint, current_app, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from .demo_data import map_seed
from .extensions import db
from .models import Collection, Poi, PoiCategory, Quest, QuestStep, Reflection, Route, TopicArticle, User, UserBadge, UserQuestProgress, UserQuestStepProgress, UserRouteProgress, UserUpload
from .serializers import serialize_category, serialize_poi, serialize_profile, serialize_quest, serialize_reflection, serialize_route, serialize_topic, serialize_upload

api_bp = Blueprint("api", __name__)


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


def _json_payload():
    return request.get_json(silent=True) or {}


def issue_token(user: User) -> str:
    return f"user:{user.id}"


def user_from_token(token: Optional[str]) -> Optional[User]:
    if not token or not token.startswith("user:"):
        return None
    try:
        user_id = int(token.split(":", 1)[1])
    except ValueError:
        return None
    user = db.session.get(User, user_id)
    if not user or not user.is_active:
        return None
    return user


def fallback_user() -> Optional[User]:
    return User.query.filter_by(account="visitor").first() or User.query.order_by(User.id.asc()).first()


def current_user(*, allow_fallback: bool = True) -> Optional[User]:
    token = request.headers.get("X-Auth-Token")
    user = user_from_token(token)
    if user:
        return user
    return fallback_user() if allow_fallback else None


def require_admin() -> Optional[User]:
    user = user_from_token(request.headers.get("X-Auth-Token"))
    if not user or user.role != "ADMIN":
        return None
    return user


def auth_payload(user: Optional[User], token: Optional[str] = None):
    return {
        "authenticated": bool(user and token),
        "token": token,
        "user": serialize_profile(user) if user else None,
    }


@api_bp.get("/auth/session")
def auth_session():
    token = request.headers.get("X-Auth-Token")
    user = user_from_token(token)
    return jsonify(auth_payload(user, token if user else None))


@api_bp.post("/auth/register")
def auth_register():
    payload = _json_payload()
    account = (payload.get("account") or "").strip().lower()
    password = payload.get("password") or ""
    nickname = (payload.get("nickname") or "").strip()

    if len(account) < 3 or len(password) < 6 or len(nickname) < 2:
        return jsonify({"message": "账号至少 3 位、密码至少 6 位、昵称至少 2 位。"}), 400

    if User.query.filter_by(account=account).first():
        return jsonify({"message": "该账号已存在，请更换后重试。"}), 409

    user = User(
        account=account,
        password_hash=generate_password_hash(password, method="pbkdf2:sha256"),
        nickname=nickname,
        avatar_url="generated://assets/avatars/user-main.svg",
        bio="新加入的游客，正在开启第一段沉浸式导览旅程。",
        level=1,
        exp=0,
        role="VISITOR",
    )
    db.session.add(user)
    db.session.commit()
    token = issue_token(user)
    return jsonify(auth_payload(user, token))


@api_bp.post("/auth/login")
def auth_login():
    payload = _json_payload()
    account = (payload.get("account") or "").strip().lower()
    password = payload.get("password") or ""
    role = (payload.get("role") or "").strip().upper()

    user = User.query.filter_by(account=account, is_active=True).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"message": "账号或密码错误。"}), 401

    if role and user.role != role:
        return jsonify({"message": "所选身份与账号角色不匹配。"}), 403

    token = issue_token(user)
    return jsonify(auth_payload(user, token))


@api_bp.post("/auth/logout")
def auth_logout():
    return jsonify({"ok": True})


@api_bp.get("/bootstrap")
def bootstrap():
    user = current_user()
    categories = PoiCategory.query.order_by(PoiCategory.sort_order.asc()).all()
    pois = Poi.query.filter_by(status="PUBLISHED").all()
    routes = Route.query.filter_by(status="PUBLISHED").all()
    quests = Quest.query.filter_by(status="PUBLISHED").all()
    topics = TopicArticle.query.filter_by(status="PUBLISHED").all()
    reflections = Reflection.query.filter_by(status="APPROVED").order_by(Reflection.created_at.desc()).all()
    uploads = UserUpload.query.order_by(UserUpload.created_at.desc()).all()
    return jsonify(
        {
            "map": map_seed(),
            "categories": [serialize_category(item) for item in categories],
            "pois": [serialize_poi(item) for item in pois],
            "routes": [serialize_route(item) for item in routes],
            "quests": [serialize_quest(item) for item in quests],
            "topics": [serialize_topic(item) for item in topics],
            "reflections": [serialize_reflection(item) for item in reflections],
            "uploads": [serialize_upload(item) for item in uploads],
            "profile": serialize_profile(user),
        }
    )


@api_bp.get("/pois")
def list_pois():
    return jsonify([serialize_poi(item) for item in Poi.query.order_by(Poi.title.asc()).all()])


@api_bp.get("/pois/<slug>")
def get_poi(slug: str):
    poi = Poi.query.filter_by(slug=slug).first_or_404()
    reflections = Reflection.query.filter_by(poi_id=poi.id, status="APPROVED").order_by(Reflection.created_at.desc()).all()
    uploads = UserUpload.query.filter_by(poi_id=poi.id).order_by(UserUpload.created_at.desc()).all()
    related_routes = {stop.route for stop in poi.route_stops}
    return jsonify(
        {
            "poi": serialize_poi(poi),
            "reflections": [serialize_reflection(item) for item in reflections],
            "uploads": [serialize_upload(item) for item in uploads],
            "relatedRoutes": [serialize_route(item) for item in related_routes],
        }
    )


@api_bp.get("/routes")
def list_routes():
    return jsonify([serialize_route(item) for item in Route.query.order_by(Route.id.asc()).all()])


@api_bp.get("/routes/<slug>")
def get_route(slug: str):
    route = Route.query.filter_by(slug=slug).first_or_404()
    return jsonify(serialize_route(route))


@api_bp.post("/routes/<int:route_id>/advance")
def advance_route(route_id: int):
    user = current_user()
    payload = _json_payload()
    action = payload.get("action", "next")
    progress = UserRouteProgress.query.filter_by(user_id=user.id, route_id=route_id).first() if user else None
    route = Route.query.get_or_404(route_id)
    total_stops = len(route.stops)

    if not progress:
        progress = UserRouteProgress(user_id=user.id, route_id=route_id, current_stop_order=1, completed_stops=0)
        db.session.add(progress)

    if action == "complete":
        progress.completed_stops = max(progress.completed_stops, progress.current_stop_order)
    elif action == "skip":
        progress.current_stop_order = min(progress.current_stop_order + 1, total_stops)
    else:
        progress.completed_stops = max(progress.completed_stops, progress.current_stop_order)
        progress.current_stop_order = min(progress.current_stop_order + 1, total_stops)

    if progress.completed_stops >= total_stops:
        progress.is_completed = True
        progress.completed_at = utc_now()

    db.session.commit()
    return jsonify(
        {
            "ok": True,
            "progress": {
                "routeId": route_id,
                "currentStopOrder": progress.current_stop_order,
                "completedStops": progress.completed_stops,
                "isCompleted": progress.is_completed,
            },
        }
    )


@api_bp.get("/quests")
def list_quests():
    return jsonify([serialize_quest(item) for item in Quest.query.order_by(Quest.id.asc()).all()])


@api_bp.post("/quests/<int:quest_id>/steps/<int:step_id>/complete")
def complete_quest_step(quest_id: int, step_id: int):
    user = current_user()
    step = QuestStep.query.filter_by(id=step_id, quest_id=quest_id).first_or_404()
    progress = UserQuestStepProgress.query.filter_by(user_id=user.id, quest_step_id=step.id).first()
    if not progress:
        progress = UserQuestStepProgress(user_id=user.id, quest_step_id=step.id)
        db.session.add(progress)

    progress.progress_value = step.target_count
    progress.is_completed = True
    progress.completed_at = utc_now()

    quest_progress = UserQuestProgress.query.filter_by(user_id=user.id, quest_id=quest_id).first()
    if not quest_progress:
        quest_progress = UserQuestProgress(user_id=user.id, quest_id=quest_id)
        db.session.add(quest_progress)

    db.session.flush()
    completed_count = UserQuestStepProgress.query.join(QuestStep).filter(UserQuestStepProgress.user_id == user.id, QuestStep.quest_id == quest_id, UserQuestStepProgress.is_completed.is_(True)).count()
    total_steps = QuestStep.query.filter_by(quest_id=quest_id).count()
    quest_progress.completed_steps = completed_count
    quest_progress.current_step_order = min(completed_count + 1, total_steps)

    if completed_count >= total_steps:
        quest_progress.is_completed = True
        quest_progress.completed_at = utc_now()
        quest = db.session.get(Quest, quest_id)
        if quest and quest.reward_badge_id:
            exists = UserBadge.query.filter_by(user_id=user.id, badge_id=quest.reward_badge_id).first()
            if not exists:
                db.session.add(UserBadge(user_id=user.id, badge_id=quest.reward_badge_id))

    db.session.commit()
    return jsonify({"ok": True, "profile": serialize_profile(current_user())})


@api_bp.get("/topics")
def list_topics():
    return jsonify([serialize_topic(item) for item in TopicArticle.query.order_by(TopicArticle.published_at.desc()).all()])


@api_bp.get("/topics/<slug>")
def get_topic(slug: str):
    return jsonify(serialize_topic(TopicArticle.query.filter_by(slug=slug).first_or_404()))


@api_bp.get("/profile")
def get_profile():
    return jsonify(serialize_profile(current_user()))


@api_bp.post("/collections/toggle")
def toggle_collection():
    user = current_user()
    payload = _json_payload()
    existing = Collection.query.filter_by(user_id=user.id, target_type=payload.get("targetType"), target_id=payload.get("targetId")).first()
    if existing:
        db.session.delete(existing)
        active = False
    else:
        db.session.add(Collection(user_id=user.id, target_type=payload.get("targetType"), target_id=payload.get("targetId")))
        active = True
    db.session.commit()
    return jsonify({"ok": True, "active": active, "profile": serialize_profile(current_user())})


@api_bp.post("/uploads")
def create_upload():
    user = current_user()
    poi_id = request.form.get("poiId", type=int)
    caption = request.form.get("caption", "")
    file = request.files.get("file")
    if not poi_id or not file:
        return jsonify({"message": "poiId 和 file 为必填项。"}), 400

    ext = os.path.splitext(file.filename or "")[1] or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    upload_dir = current_app.config["UPLOAD_FOLDER"]
    os.makedirs(upload_dir, exist_ok=True)
    file.save(os.path.join(upload_dir, filename))

    record = UserUpload(user_id=user.id, poi_id=poi_id, caption=caption, image_url=f"/uploads/{filename}", status="PENDING")
    db.session.add(record)
    db.session.commit()
    return jsonify({"ok": True, "upload": serialize_upload(record)})


@api_bp.post("/reflections")
def create_reflection():
    user = current_user()
    payload = _json_payload()
    reflection = Reflection(
        user_id=user.id,
        poi_id=payload["poiId"],
        title=payload["title"],
        content=payload["content"],
        image_url=payload.get("imageUrl", ""),
        mood_tag=payload.get("moodTag", "静观"),
        is_public=payload.get("isPublic", True),
        status="PENDING",
        featured=False,
    )
    db.session.add(reflection)
    db.session.commit()
    return jsonify({"ok": True, "reflection": serialize_reflection(reflection)})


@api_bp.get("/admin/overview")
def admin_overview():
    admin = require_admin()
    if not admin:
        return jsonify({"message": "当前账号没有后台访问权限。"}), 403

    return jsonify(
        {
            "poiCount": Poi.query.count(),
            "routeCount": Route.query.count(),
            "questCount": Quest.query.count(),
            "reflectionPending": Reflection.query.filter_by(status="PENDING").count(),
            "uploadPending": UserUpload.query.filter_by(status="PENDING").count(),
            "topicCount": TopicArticle.query.count(),
            "pois": [serialize_poi(item) for item in Poi.query.order_by(Poi.id.asc()).all()],
            "routes": [serialize_route(item) for item in Route.query.order_by(Route.id.asc()).all()],
            "quests": [serialize_quest(item) for item in Quest.query.order_by(Quest.id.asc()).all()],
            "topics": [serialize_topic(item) for item in TopicArticle.query.order_by(TopicArticle.id.asc()).all()],
            "uploads": [serialize_upload(item) for item in UserUpload.query.order_by(UserUpload.created_at.desc()).all()],
            "reflections": [serialize_reflection(item) for item in Reflection.query.order_by(Reflection.created_at.desc()).all()],
        }
    )


def _crud_response(model, serializer, model_id=None):
    if not require_admin():
        return jsonify({"message": "当前账号没有后台访问权限。"}), 403

    if request.method == "GET":
        return jsonify([serializer(item) for item in model.query.order_by(model.id.asc()).all()])

    payload = _json_payload()
    if request.method == "POST":
        record = model(**payload)
        db.session.add(record)
        db.session.commit()
        return jsonify(serializer(record))

    record = model.query.get_or_404(model_id)
    if request.method == "DELETE":
        db.session.delete(record)
        db.session.commit()
        return jsonify({"ok": True})

    for key, value in payload.items():
        setattr(record, key, value)
    db.session.commit()
    return jsonify(serializer(record))


@api_bp.route("/admin/pois", methods=["GET", "POST"])
def admin_pois():
    return _crud_response(Poi, serialize_poi)


@api_bp.route("/admin/pois/<int:model_id>", methods=["PUT", "DELETE"])
def admin_poi_detail(model_id: int):
    return _crud_response(Poi, serialize_poi, model_id)


@api_bp.route("/admin/routes", methods=["GET", "POST"])
def admin_routes():
    return _crud_response(Route, serialize_route)


@api_bp.route("/admin/routes/<int:model_id>", methods=["PUT", "DELETE"])
def admin_route_detail(model_id: int):
    return _crud_response(Route, serialize_route, model_id)


@api_bp.route("/admin/quests", methods=["GET", "POST"])
def admin_quests():
    return _crud_response(Quest, serialize_quest)


@api_bp.route("/admin/quests/<int:model_id>", methods=["PUT", "DELETE"])
def admin_quest_detail(model_id: int):
    return _crud_response(Quest, serialize_quest, model_id)


@api_bp.route("/admin/topics", methods=["GET", "POST"])
def admin_topics():
    return _crud_response(TopicArticle, serialize_topic)


@api_bp.route("/admin/topics/<int:model_id>", methods=["PUT", "DELETE"])
def admin_topic_detail(model_id: int):
    return _crud_response(TopicArticle, serialize_topic, model_id)


@api_bp.post("/admin/review/upload/<int:upload_id>")
def admin_review_upload(upload_id: int):
    if not require_admin():
        return jsonify({"message": "当前账号没有后台访问权限。"}), 403

    payload = _json_payload()
    upload = UserUpload.query.get_or_404(upload_id)
    upload.status = payload.get("status", upload.status)
    upload.review_note = payload.get("reviewNote", upload.review_note)
    db.session.commit()
    return jsonify({"ok": True, "upload": serialize_upload(upload)})


@api_bp.post("/admin/review/reflection/<int:reflection_id>")
def admin_review_reflection(reflection_id: int):
    if not require_admin():
        return jsonify({"message": "当前账号没有后台访问权限。"}), 403

    payload = _json_payload()
    reflection = Reflection.query.get_or_404(reflection_id)
    reflection.status = payload.get("status", reflection.status)
    reflection.featured = payload.get("featured", reflection.featured)
    db.session.commit()
    return jsonify({"ok": True, "reflection": serialize_reflection(reflection)})
