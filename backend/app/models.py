from datetime import datetime, timezone

from .extensions import db


def utc_now():
    return datetime.now(timezone.utc).replace(tzinfo=None)


class TimestampMixin:
    created_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    updated_at = db.Column(db.DateTime, default=utc_now, onupdate=utc_now, nullable=False)


class User(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    nickname = db.Column(db.String(80), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=False)
    bio = db.Column(db.String(255), nullable=False, default="")
    level = db.Column(db.Integer, nullable=False, default=1)
    exp = db.Column(db.Integer, nullable=False, default=0)
    role = db.Column(db.String(20), nullable=False, default="VISITOR")
    is_active = db.Column(db.Boolean, nullable=False, default=True)


class PoiCategory(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(40), nullable=False, unique=True)
    name = db.Column(db.String(80), nullable=False)
    icon = db.Column(db.String(80), nullable=False)
    color = db.Column(db.String(40), nullable=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)


class Poi(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), nullable=False, unique=True)
    title = db.Column(db.String(120), nullable=False)
    subtitle = db.Column(db.String(120), nullable=False)
    era = db.Column(db.String(80), nullable=False)
    type = db.Column(db.String(40), nullable=False)
    region = db.Column(db.String(40), nullable=False, default="中轴")
    category_id = db.Column(db.Integer, db.ForeignKey("poi_category.id"), nullable=False)
    x_ratio = db.Column(db.Float, nullable=False)
    y_ratio = db.Column(db.Float, nullable=False)
    cover_image = db.Column(db.String(255), nullable=False)
    gallery = db.Column(db.JSON, nullable=False, default=list)
    summary = db.Column(db.Text, nullable=False)
    content = db.Column(db.Text, nullable=False)
    tags = db.Column(db.JSON, nullable=False, default=list)
    stay_minutes = db.Column(db.Integer, nullable=False, default=10)
    is_open = db.Column(db.Boolean, nullable=False, default=True)
    status = db.Column(db.String(20), nullable=False, default="PUBLISHED")
    route_hint = db.Column(db.String(120), nullable=False, default="")

    category = db.relationship("PoiCategory", backref="pois")


class Route(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), nullable=False, unique=True)
    title = db.Column(db.String(120), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(40), nullable=False)
    cover_image = db.Column(db.String(255), nullable=False)
    duration_minutes = db.Column(db.Integer, nullable=False)
    distance_meters = db.Column(db.Integer, nullable=False)
    audience = db.Column(db.String(120), nullable=False)
    is_locked = db.Column(db.Boolean, nullable=False, default=False)
    unlock_condition = db.Column(db.String(255), nullable=False, default="")
    svg_path = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), nullable=False, default="PUBLISHED")


class RouteStop(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    route_id = db.Column(db.Integer, db.ForeignKey("route.id"), nullable=False)
    poi_id = db.Column(db.Integer, db.ForeignKey("poi.id"), nullable=False)
    stop_order = db.Column(db.Integer, nullable=False)
    label = db.Column(db.String(80), nullable=False)
    dwell_minutes = db.Column(db.Integer, nullable=False, default=8)
    checkpoint_note = db.Column(db.String(255), nullable=False, default="")

    route = db.relationship("Route", backref="stops")
    poi = db.relationship("Poi", backref="route_stops")


class Badge(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)
    icon = db.Column(db.String(255), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    rarity = db.Column(db.String(40), nullable=False)
    category = db.Column(db.String(40), nullable=False)


class UserBadge(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey("badge.id"), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=utc_now, nullable=False)

    user = db.relationship("User", backref="user_badges")
    badge = db.relationship("Badge", backref="badge_users")


class Quest(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), nullable=False, unique=True)
    title = db.Column(db.String(120), nullable=False)
    summary = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(40), nullable=False)
    chapter = db.Column(db.String(80), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey("route.id"))
    cover_image = db.Column(db.String(255), nullable=False)
    reward_badge_id = db.Column(db.Integer, db.ForeignKey("badge.id"))
    reward_stamp = db.Column(db.String(120), nullable=False)
    unlock_condition = db.Column(db.String(255), nullable=False, default="")
    status = db.Column(db.String(20), nullable=False, default="PUBLISHED")

    route = db.relationship("Route", backref="quests")
    reward_badge = db.relationship("Badge", backref="reward_quests")


class QuestStep(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    quest_id = db.Column(db.Integer, db.ForeignKey("quest.id"), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    step_order = db.Column(db.Integer, nullable=False)
    step_type = db.Column(db.String(40), nullable=False)
    target_poi_id = db.Column(db.Integer, db.ForeignKey("poi.id"))
    target_count = db.Column(db.Integer, nullable=False, default=1)
    reward_fragment = db.Column(db.String(80), nullable=False, default="")
    unlock_condition = db.Column(db.String(255), nullable=False, default="")

    quest = db.relationship("Quest", backref="steps")
    target_poi = db.relationship("Poi", backref="quest_steps")


class UserQuestProgress(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    quest_id = db.Column(db.Integer, db.ForeignKey("quest.id"), nullable=False)
    current_step_order = db.Column(db.Integer, nullable=False, default=1)
    completed_steps = db.Column(db.Integer, nullable=False, default=0)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    started_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    completed_at = db.Column(db.DateTime)

    user = db.relationship("User", backref="quest_progresses")
    quest = db.relationship("Quest", backref="user_progresses")


class UserQuestStepProgress(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    quest_step_id = db.Column(db.Integer, db.ForeignKey("quest_step.id"), nullable=False)
    progress_value = db.Column(db.Integer, nullable=False, default=0)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    completed_at = db.Column(db.DateTime)

    user = db.relationship("User", backref="quest_step_progresses")
    quest_step = db.relationship("QuestStep", backref="user_progresses")


class UserRouteProgress(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    route_id = db.Column(db.Integer, db.ForeignKey("route.id"), nullable=False)
    current_stop_order = db.Column(db.Integer, nullable=False, default=1)
    completed_stops = db.Column(db.Integer, nullable=False, default=0)
    is_completed = db.Column(db.Boolean, nullable=False, default=False)
    started_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    completed_at = db.Column(db.DateTime)

    user = db.relationship("User", backref="route_progresses")
    route = db.relationship("Route", backref="user_progresses")


class UserPoiVisit(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    poi_id = db.Column(db.Integer, db.ForeignKey("poi.id"), nullable=False)
    visited_at = db.Column(db.DateTime, default=utc_now, nullable=False)
    visit_source = db.Column(db.String(40), nullable=False, default="MAP")
    route_id = db.Column(db.Integer, db.ForeignKey("route.id"))

    user = db.relationship("User", backref="poi_visits")
    poi = db.relationship("Poi", backref="user_visits")
    route = db.relationship("Route", backref="visit_logs")


class UserUpload(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    poi_id = db.Column(db.Integer, db.ForeignKey("poi.id"), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(255), nullable=False, default="")
    status = db.Column(db.String(20), nullable=False, default="PENDING")
    review_note = db.Column(db.String(255), nullable=False, default="")

    user = db.relationship("User", backref="uploads")
    poi = db.relationship("Poi", backref="uploads")


class Reflection(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    poi_id = db.Column(db.Integer, db.ForeignKey("poi.id"), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    content = db.Column(db.Text, nullable=False)
    image_url = db.Column(db.String(255), nullable=False, default="")
    mood_tag = db.Column(db.String(40), nullable=False, default="静观")
    is_public = db.Column(db.Boolean, nullable=False, default=True)
    status = db.Column(db.String(20), nullable=False, default="PENDING")
    featured = db.Column(db.Boolean, nullable=False, default=False)

    user = db.relationship("User", backref="reflections")
    poi = db.relationship("Poi", backref="reflections")


class Collection(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    target_type = db.Column(db.String(20), nullable=False)
    target_id = db.Column(db.Integer, nullable=False)

    user = db.relationship("User", backref="collections")


class TopicArticle(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(120), nullable=False, unique=True)
    title = db.Column(db.String(120), nullable=False)
    subtitle = db.Column(db.String(120), nullable=False)
    cover_image = db.Column(db.String(255), nullable=False)
    content_blocks = db.Column(db.JSON, nullable=False, default=list)
    gallery = db.Column(db.JSON, nullable=False, default=list)
    tags = db.Column(db.JSON, nullable=False, default=list)
    status = db.Column(db.String(20), nullable=False, default="PUBLISHED")
    published_at = db.Column(db.DateTime, default=utc_now, nullable=False)


class AdminUser(TimestampMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password_hash = db.Column(db.String(255), nullable=False)
    display_name = db.Column(db.String(80), nullable=False)
    avatar_url = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(40), nullable=False, default="ADMIN")
    is_active = db.Column(db.Boolean, nullable=False, default=True)
