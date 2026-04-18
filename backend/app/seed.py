from __future__ import annotations

from werkzeug.security import generate_password_hash

from .demo_data import badge_seed, category_seed, poi_seed, quest_seed, quest_steps_seed, reflection_seed, route_seed, route_stops_seed, topic_seed
from .extensions import db
from .models import AdminUser, Badge, Poi, PoiCategory, Quest, QuestStep, Reflection, Route, RouteStop, TopicArticle, User, UserBadge, UserQuestProgress, UserQuestStepProgress, UserRouteProgress


def seed_demo_data() -> None:
    if User.query.first():
        return

    visitor = User(
        account="visitor",
        password_hash=generate_password_hash("visitor123", method="pbkdf2:sha256"),
        nickname="观澜",
        avatar_url="generated://assets/avatars/user-main.svg",
        bio="偏爱古建与园林空间，也喜欢沿着真实路线慢慢看完整个宫城。",
        level=6,
        exp=520,
        role="VISITOR",
    )
    admin_user = User(
        account="admin",
        password_hash=generate_password_hash("admin123", method="pbkdf2:sha256"),
        nickname="策展中台",
        avatar_url="generated://assets/avatars/admin.svg",
        bio="负责导览内容、路线、任务和用户投稿审核的管理账号。",
        level=10,
        exp=999,
        role="ADMIN",
    )
    admin_record = AdminUser(
        username="admin",
        password_hash=generate_password_hash("admin123", method="pbkdf2:sha256"),
        display_name="内容管理后台",
        avatar_url="generated://assets/avatars/admin.svg",
        role="ADMIN",
    )
    db.session.add_all([visitor, admin_user, admin_record])

    categories = {}
    for item in category_seed():
        category = PoiCategory(**item)
        db.session.add(category)
        categories[item["key"]] = category

    badges = {}
    for item in badge_seed():
        badge = Badge(**item)
        db.session.add(badge)
        badges[item["name"]] = badge

    db.session.flush()

    pois = {}
    for item in poi_seed():
        category_key = item.pop("category_key")
        poi = Poi(category_id=categories[category_key].id, **item)
        db.session.add(poi)
        pois[poi.slug] = poi

    routes = {}
    for item in route_seed():
        route = Route(**item)
        db.session.add(route)
        routes[route.slug] = route

    db.session.flush()

    for route_slug, stop_slugs in route_stops_seed().items():
        for index, slug in enumerate(stop_slugs, start=1):
            poi = pois[slug]
            db.session.add(
                RouteStop(
                    route_id=routes[route_slug].id,
                    poi_id=poi.id,
                    stop_order=index,
                    label=f"{index:02d}",
                    dwell_minutes=max(6, poi.stay_minutes),
                    checkpoint_note=f"建议在 {poi.title} 停留，查看建筑、展陈或讲解信息。",
                )
            )

    quests = {}
    for item in quest_seed():
        route_slug = item.pop("route_slug")
        reward_badge_name = item.pop("reward_badge_name")
        quest = Quest(route_id=routes[route_slug].id, reward_badge_id=badges[reward_badge_name].id, **item)
        db.session.add(quest)
        quests[quest.slug] = quest

    db.session.flush()

    for quest_slug, steps in quest_steps_seed().items():
        for step in steps:
            target_slug = step.pop("target_slug")
            db.session.add(QuestStep(quest_id=quests[quest_slug].id, target_poi_id=pois[target_slug].id, **step))

    for item in topic_seed():
        db.session.add(TopicArticle(**item))

    for item in reflection_seed():
        poi_slug = item.pop("poi_slug")
        db.session.add(Reflection(user_id=visitor.id, poi_id=pois[poi_slug].id, **item))

    db.session.flush()

    db.session.add_all(
        [
            UserBadge(user_id=visitor.id, badge_id=badges["中轴启封"].id),
            UserBadge(user_id=visitor.id, badge_id=badges["宫苑静观"].id),
            UserRouteProgress(user_id=visitor.id, route_id=routes["central-axis"].id, current_stop_order=5, completed_stops=4),
            UserRouteProgress(user_id=visitor.id, route_id=routes["three-halls-cining"].id, current_stop_order=11, completed_stops=11, is_completed=True),
            UserQuestProgress(user_id=visitor.id, quest_id=quests["chapter-axis-awakening"].id, current_step_order=4, completed_steps=3),
            UserQuestProgress(user_id=visitor.id, quest_id=quests["chapter-treasure-memory"].id, current_step_order=2, completed_steps=1),
        ]
    )

    axis_steps = QuestStep.query.join(Quest).filter(Quest.slug == "chapter-axis-awakening").all()
    for step in axis_steps[:3]:
        db.session.add(UserQuestStepProgress(user_id=visitor.id, quest_step_id=step.id, progress_value=1, is_completed=True))

    db.session.commit()
