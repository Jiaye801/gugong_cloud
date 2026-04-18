from __future__ import annotations

from typing import Optional

from .models import Collection, Poi, PoiCategory, Quest, QuestStep, Reflection, Route, RouteStop, TopicArticle, User, UserBadge, UserQuestProgress, UserQuestStepProgress, UserRouteProgress, UserUpload


def serialize_category(category: PoiCategory):
    return {
        "id": category.id,
        "key": category.key,
        "name": category.name,
        "icon": category.icon,
        "color": category.color,
    }


def serialize_poi(poi: Poi):
    return {
        "id": poi.id,
        "slug": poi.slug,
        "title": poi.title,
        "subtitle": poi.subtitle,
        "era": poi.era,
        "type": poi.type,
        "region": poi.region,
        "categoryId": poi.category_id,
        "categoryKey": poi.category.key,
        "xRatio": poi.x_ratio,
        "yRatio": poi.y_ratio,
        "coverImage": poi.cover_image,
        "gallery": poi.gallery,
        "summary": poi.summary,
        "content": poi.content,
        "tags": poi.tags,
        "stayMinutes": poi.stay_minutes,
        "isOpen": poi.is_open,
        "status": poi.status,
        "routeHint": poi.route_hint,
    }


def serialize_route_stop(stop: RouteStop):
    return {
        "id": stop.id,
        "routeId": stop.route_id,
        "poiId": stop.poi_id,
        "stopOrder": stop.stop_order,
        "label": stop.label,
        "dwellMinutes": stop.dwell_minutes,
        "checkpointNote": stop.checkpoint_note,
        "poi": serialize_poi(stop.poi),
    }


def serialize_route(route: Route):
    stops = sorted(route.stops, key=lambda item: item.stop_order)
    return {
        "id": route.id,
        "slug": route.slug,
        "title": route.title,
        "summary": route.summary,
        "type": route.type,
        "coverImage": route.cover_image,
        "durationMinutes": route.duration_minutes,
        "distanceMeters": route.distance_meters,
        "audience": route.audience,
        "isLocked": route.is_locked,
        "unlockCondition": route.unlock_condition,
        "svgPath": route.svg_path,
        "status": route.status,
        "stops": [serialize_route_stop(stop) for stop in stops],
    }


def serialize_badge(badge):
    return {
        "id": badge.id,
        "name": badge.name,
        "icon": badge.icon,
        "description": badge.description,
        "rarity": badge.rarity,
        "category": badge.category,
    }


def serialize_user_badge(user_badge: UserBadge):
    return {
        "id": user_badge.id,
        "unlockedAt": user_badge.unlocked_at.isoformat(),
        "badge": serialize_badge(user_badge.badge),
    }


def serialize_quest_step(step: QuestStep):
    return {
        "id": step.id,
        "questId": step.quest_id,
        "title": step.title,
        "description": step.description,
        "stepOrder": step.step_order,
        "stepType": step.step_type,
        "targetCount": step.target_count,
        "rewardFragment": step.reward_fragment,
        "unlockCondition": step.unlock_condition,
        "targetPoi": serialize_poi(step.target_poi) if step.target_poi else None,
    }


def serialize_quest(quest: Quest):
    return {
        "id": quest.id,
        "slug": quest.slug,
        "title": quest.title,
        "summary": quest.summary,
        "type": quest.type,
        "chapter": quest.chapter,
        "coverImage": quest.cover_image,
        "rewardStamp": quest.reward_stamp,
        "unlockCondition": quest.unlock_condition,
        "status": quest.status,
        "route": serialize_route(quest.route) if quest.route else None,
        "rewardBadge": serialize_badge(quest.reward_badge) if quest.reward_badge else None,
        "steps": [serialize_quest_step(step) for step in sorted(quest.steps, key=lambda item: item.step_order)],
    }


def serialize_reflection(reflection: Reflection):
    return {
        "id": reflection.id,
        "title": reflection.title,
        "content": reflection.content,
        "imageUrl": reflection.image_url,
        "moodTag": reflection.mood_tag,
        "isPublic": reflection.is_public,
        "status": reflection.status,
        "featured": reflection.featured,
        "poiId": reflection.poi_id,
        "user": {
            "id": reflection.user.id,
            "nickname": reflection.user.nickname,
            "avatarUrl": reflection.user.avatar_url,
            "role": reflection.user.role,
        },
        "createdAt": reflection.created_at.isoformat(),
    }


def serialize_upload(upload: UserUpload):
    return {
        "id": upload.id,
        "poiId": upload.poi_id,
        "imageUrl": upload.image_url,
        "caption": upload.caption,
        "status": upload.status,
        "reviewNote": upload.review_note,
        "user": {
            "id": upload.user.id,
            "nickname": upload.user.nickname,
            "avatarUrl": upload.user.avatar_url,
            "role": upload.user.role,
        },
        "createdAt": upload.created_at.isoformat(),
    }


def serialize_topic(topic: TopicArticle):
    return {
        "id": topic.id,
        "slug": topic.slug,
        "title": topic.title,
        "subtitle": topic.subtitle,
        "coverImage": topic.cover_image,
        "contentBlocks": topic.content_blocks,
        "gallery": topic.gallery,
        "tags": topic.tags,
        "status": topic.status,
        "publishedAt": topic.published_at.isoformat(),
    }


def serialize_route_progress(progress: UserRouteProgress):
    return {
        "routeId": progress.route_id,
        "currentStopOrder": progress.current_stop_order,
        "completedStops": progress.completed_stops,
        "isCompleted": progress.is_completed,
    }


def serialize_quest_progress(progress: UserQuestProgress):
    return {
        "questId": progress.quest_id,
        "currentStepOrder": progress.current_step_order,
        "completedSteps": progress.completed_steps,
        "isCompleted": progress.is_completed,
    }


def serialize_quest_step_progress(progress: UserQuestStepProgress):
    return {
        "questStepId": progress.quest_step_id,
        "progressValue": progress.progress_value,
        "isCompleted": progress.is_completed,
    }


def serialize_collection(item: Collection):
    return {
        "id": item.id,
        "targetType": item.target_type,
        "targetId": item.target_id,
    }


def serialize_profile(user: Optional[User]):
    if not user:
        return None

    return {
        "id": user.id,
        "account": user.account,
        "nickname": user.nickname,
        "avatarUrl": user.avatar_url,
        "bio": user.bio,
        "level": user.level,
        "exp": user.exp,
        "role": user.role,
        "isActive": user.is_active,
        "badges": [serialize_user_badge(item) for item in user.user_badges],
        "uploads": [serialize_upload(item) for item in sorted(user.uploads, key=lambda row: row.created_at, reverse=True)],
        "reflections": [serialize_reflection(item) for item in sorted(user.reflections, key=lambda row: row.created_at, reverse=True)],
        "collections": [serialize_collection(item) for item in user.collections],
        "routeProgress": [serialize_route_progress(item) for item in user.route_progresses],
        "questProgress": [serialize_quest_progress(item) for item in user.quest_progresses],
        "questStepProgress": [serialize_quest_step_progress(item) for item in user.quest_step_progresses],
        "poiVisits": [
            {
                "poiId": item.poi_id,
                "routeId": item.route_id,
                "visitedAt": item.visited_at.isoformat(),
            }
            for item in sorted(user.poi_visits, key=lambda row: row.visited_at, reverse=True)
        ],
    }
