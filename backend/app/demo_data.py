from __future__ import annotations

import json
from copy import deepcopy
from functools import lru_cache
from pathlib import Path


DATA_PATH = Path(__file__).resolve().parents[2] / "docs" / "forbidden-city-draft-data.json"
from typing import List, Optional

MAP_WIDTH = 1180
MAP_HEIGHT = 2027

CATEGORY_META = {
    "建筑": {"key": "building", "icon": "Landmark", "color": "#d3b271", "sort_order": 1},
    "展览": {"key": "exhibition", "icon": "ScrollText", "color": "#8caeca", "sort_order": 2},
    "讲解点": {"key": "guide", "icon": "Volume2", "color": "#c78654", "sort_order": 3},
    "文创点": {"key": "shop", "icon": "ShoppingBag", "color": "#c85f46", "sort_order": 4},
    "服务点": {"key": "service", "icon": "MapPinned", "color": "#7e9e8d", "sort_order": 5},
    "隐藏点": {"key": "secret", "icon": "Sparkles", "color": "#9d86c9", "sort_order": 6},
}

POI_REGION = {
    "wumen": "南区入口",
    "audience-service-center": "南区入口",
    "audio-guide-center": "南区入口",
    "jinshui-bridge": "中轴",
    "taihe-men": "中轴",
    "taihe-dian": "中轴",
    "zhonghe-dian": "中轴",
    "baohe-dian": "中轴",
    "qianqing-men": "中轴",
    "qianqing-gong": "中轴",
    "jiaotai-dian": "中轴",
    "jiaotai-creative-hall": "中轴东侧",
    "kunning-gong": "中轴",
    "jinghemen-kids-store": "中轴东侧",
    "imperial-garden": "中轴",
    "shenwumen": "北区出口",
    "donghuamen": "东区出口",
    "wenhua-dian": "东路",
    "wenyuan-ge": "东路",
    "fengxian-dian": "东路",
    "clock-gallery": "东路",
    "huangji-men": "东路",
    "jianting-square-store": "东路",
    "jiulongbi": "东路",
    "ningshou-men": "东路",
    "huangji-dian": "东路",
    "treasure-gallery": "东路",
    "ning-shou-gong": "东路",
    "changyin-ge": "东路",
    "zhenfei-well": "东路",
    "wuying-dian": "西路",
    "longzongmen": "西路",
    "yangxin-dian": "西路",
    "yongshou-gong": "西六宫",
    "yikun-gong": "西六宫",
    "chu-xiu-gong": "西六宫",
    "cining-gong": "西路",
    "cining-palace-garden": "西路",
    "shoukang-gong": "西路",
}

POI_DETAILS = {
    "wumen": {
        "subtitle": "南向主入口",
        "era": "明清宫城礼制",
        "content": "午门是故宫当前官方参观入口，也是数字导览体验的起点。这里适合承接入场、路线分流、服务咨询与任务开启，让游览从礼序与尺度感知中展开。",
        "tags": ["入口", "中轴线", "礼序"],
    },
    "audience-service-center": {
        "subtitle": "入场服务咨询",
        "era": "当代观众服务",
        "content": "观众服务处适合设置路线推荐、预约提醒、活动提示与游览帮助，是将真实场馆服务信息转化为数字导览能力的重要节点。",
        "tags": ["咨询", "服务", "入场"],
    },
    "audio-guide-center": {
        "subtitle": "导览设备领取",
        "era": "当代观众服务",
        "content": "语音导览服务点可以承接设备租借、路线推荐与多语言导览说明，在 Web 产品中也适合映射为讲解音频、专题包与个性化推荐入口。",
        "tags": ["讲解", "设备", "服务"],
    },
    "jinshui-bridge": {
        "subtitle": "外朝过渡节点",
        "era": "礼制空间序列",
        "content": "内金水桥承担了从入口广场进入外朝核心区域的节奏转换。它既是视线收拢的节点，也是路线镜头推进最自然的讲解位置。",
        "tags": ["桥", "中轴线", "讲解"],
    },
    "taihe-men": {
        "subtitle": "进入三大殿区",
        "era": "明清宫城礼制",
        "content": "太和门是前三殿空间序列的重要宫门，适合讲述中轴秩序、院落尺度与进深关系，也是路线推进中的第一处强仪式节点。",
        "tags": ["宫门", "中轴线", "礼制"],
    },
    "taihe-dian": {
        "subtitle": "三大殿核心",
        "era": "明清皇家建筑",
        "content": "太和殿是故宫中轴线最具代表性的建筑之一，适合作为主线路线的高光节点，也适合承接建筑结构、装饰与礼仪制度的深度讲解。",
        "tags": ["三大殿", "中轴线", "核心建筑"],
    },
    "zhonghe-dian": {
        "subtitle": "中段缓冲空间",
        "era": "明清皇家建筑",
        "content": "中和殿在体量上更为凝练，但在游览节奏上承担了极重要的过渡作用。它让路线在高潮与收束之间保留了呼吸感。",
        "tags": ["三大殿", "节奏", "建筑"],
    },
    "baohe-dian": {
        "subtitle": "前三殿收束节点",
        "era": "明清皇家建筑",
        "content": "保和殿适合作为前三殿阶段的收束点，也适合在数字导览中转入东路、西路或后三宫等不同分支路径。",
        "tags": ["三大殿", "转场", "建筑"],
    },
    "qianqing-men": {
        "subtitle": "外朝转入内廷",
        "era": "宫城空间转换",
        "content": "乾清门是从外朝进入内廷的重要节点，适合在产品中承接叙事语气的变化，让庄重礼制逐渐转向宫廷生活与日常秩序。",
        "tags": ["转换", "中轴线", "内廷"],
    },
    "qianqing-gong": {
        "subtitle": "后三宫核心",
        "era": "明清宫廷生活",
        "content": "乾清宫是后三宫中的核心建筑之一，既可用于讲解宫廷日常，也适合在任务体系中安排阅读、打卡与章节推进。",
        "tags": ["后三宫", "中轴线", "宫廷"],
    },
    "jiaotai-dian": {
        "subtitle": "中轴内廷节点",
        "era": "明清宫廷生活",
        "content": "交泰殿位于乾清宫与坤宁宫之间，体量适中但位置关键，适合作为短暂停留的讲解点与路线编号站点。",
        "tags": ["后三宫", "讲解", "中轴线"],
    },
    "jiaotai-creative-hall": {
        "subtitle": "东侧文创体验",
        "era": "当代文创空间",
        "content": "根据故宫公开资料，交泰殿东侧设有文创融合馆。它可作为历史空间与当代内容转译的交汇点，适合承接收藏、加入清单与轻购物动线。",
        "tags": ["文创", "体验", "东侧"],
    },
    "kunning-gong": {
        "subtitle": "后三宫收束空间",
        "era": "明清宫廷生活",
        "content": "坤宁宫在中轴线路中提供了内廷段的重要空间落点，可与宫廷生活、居住秩序与典章叙事结合。",
        "tags": ["后三宫", "中轴线", "建筑"],
    },
    "jinghemen-kids-store": {
        "subtitle": "亲子文创体验",
        "era": "当代文创空间",
        "content": "官方公开资料中提到景和门故宫文创儿童体验店。它适合在产品中作为亲子路线的文创停留点，也适合关联盖章和亲子任务。",
        "tags": ["文创", "亲子", "体验店"],
    },
    "imperial-garden": {
        "subtitle": "中轴线游园收束",
        "era": "宫苑园林空间",
        "content": "御花园是中轴线游览后段的重要游园节点，适合从礼制序列过渡到园林感受，也是反思、记录与拍照的高频空间。",
        "tags": ["园林", "中轴线", "游园"],
    },
    "shenwumen": {
        "subtitle": "北侧出口",
        "era": "观众离场流线",
        "content": "神武门是官方主要出口之一，适合承接路线完成、成就总结与离场服务。它也可以作为路线统计和徽章解锁的收束点。",
        "tags": ["出口", "离场", "服务"],
    },
    "donghuamen": {
        "subtitle": "东路离场出口",
        "era": "观众离场流线",
        "content": "东华门在官方导览规则中也是可用出口之一，更适合东路、钟表馆与珍宝馆区域的路线收束。",
        "tags": ["出口", "东路", "服务"],
    },
    "wenhua-dian": {
        "subtitle": "东路展陈节点",
        "era": "官方开放宫区",
        "content": "文华殿是东路的重要开放区域，可与书画、典籍与专题内容联动，也适合拓展专题详情页。",
        "tags": ["东路", "展览", "书画"],
    },
    "wenyuan-ge": {
        "subtitle": "典籍主题延伸",
        "era": "官方开放宫区",
        "content": "文渊阁可作为知识型内容与深度导览的延伸站点，适合承接长图文阅读与专题解说。",
        "tags": ["典籍", "建筑", "专题"],
    },
    "fengxian-dian": {
        "subtitle": "东路转场节点",
        "era": "官方开放宫区",
        "content": "奉先殿位于东路游线中，可作为钟表馆与宁寿宫区之间的转场点，适合补充路线的空间连续性。",
        "tags": ["东路", "转场", "展览"],
    },
    "clock-gallery": {
        "subtitle": "常设专题展区",
        "era": "故宫常设馆",
        "content": "钟表馆是东路最具辨识度的专题展区之一，适合在数字导览中做时序叙事、展品亮点与停留提醒。",
        "tags": ["钟表馆", "展览", "东路"],
    },
    "huangji-men": {
        "subtitle": "宁寿宫区入口门点",
        "era": "宁寿宫区建筑",
        "content": "皇极门是东路转入宁寿宫区的重要门点。将它纳入路线 stop 链条后，可以让地图路径更贴近真实转折关系。",
        "tags": ["宁寿宫区", "门点", "讲解"],
    },
    "jianting-square-store": {
        "subtitle": "宁寿宫区文创停留点",
        "era": "当代文创空间",
        "content": "箭亭广场主题文创店来自官方公开资料，适合接入宁寿宫区域路线，也适合做主题活动与限时选物的承载点。",
        "tags": ["文创", "宁寿宫区", "选物"],
    },
    "jiulongbi": {
        "subtitle": "东路高关注讲解点",
        "era": "宫廷装饰空间",
        "content": "九龙壁是公开导览中辨识度极高的讲解点，适合停留讲述装饰、工艺与空间关系，也适合作为东路动线中的高光节点。",
        "tags": ["东路", "讲解", "高光"],
    },
    "ningshou-men": {
        "subtitle": "进入宁寿宫区",
        "era": "宁寿宫区建筑",
        "content": "宁寿门作为宁寿宫区入口节点，让路线在地图上从东路宫区更顺畅地过渡到珍宝馆区域。",
        "tags": ["门点", "宁寿宫区", "路线"],
    },
    "huangji-dian": {
        "subtitle": "东路主叙事节点",
        "era": "宁寿宫区建筑",
        "content": "皇极殿在宁寿宫区域中具备很强的叙事价值，适合承接东路主线与深度游章节内容。",
        "tags": ["宁寿宫区", "建筑", "东路"],
    },
    "treasure-gallery": {
        "subtitle": "常设专题展区",
        "era": "故宫常设馆",
        "content": "珍宝馆是东路深度游的重要目的地，在产品中既适合长停留，也适合承接收藏、上传与感悟等互动动作。",
        "tags": ["珍宝馆", "展览", "东路"],
    },
    "ning-shou-gong": {
        "subtitle": "宁寿宫区延伸站点",
        "era": "宁寿宫区建筑",
        "content": "宁寿宫可作为珍宝馆与宁寿宫区的进一步延伸点，让深度游路线的空间层次更完整。",
        "tags": ["宁寿宫区", "建筑", "深度游"],
    },
    "changyin-ge": {
        "subtitle": "戏曲空间节点",
        "era": "宁寿宫区建筑",
        "content": "畅音阁具备强烈的专题辨识度，适合在东路路线中作为戏曲、表演与空间装置感的讲解点。",
        "tags": ["戏曲", "宁寿宫区", "专题"],
    },
    "zhenfei-well": {
        "subtitle": "高关注隐藏点",
        "era": "宁寿宫区故事点",
        "content": "珍妃井在公众认知中具有较高辨识度，既可作为历史讲解点，也适合作为产品中的隐藏探索点位。",
        "tags": ["故事点", "东路", "探索"],
    },
    "wuying-dian": {
        "subtitle": "西路展陈节点",
        "era": "官方开放宫区",
        "content": "武英殿是西路的重要展陈点，可与慈宁宫区域共同构成完整的西路游览逻辑。",
        "tags": ["西路", "展览", "宫区"],
    },
    "longzongmen": {
        "subtitle": "西路转折门点",
        "era": "西路宫区建筑",
        "content": "隆宗门是中轴线转入西路的重要转折点。将它纳入 stop 链条后，西路路线的连贯性会明显提升。",
        "tags": ["西路", "门点", "转折"],
    },
    "yangxin-dian": {
        "subtitle": "西路重点建筑",
        "era": "官方开放宫区",
        "content": "养心殿是西路开放区域的重要站点，适合作为深度讲解与任务推进的落点。",
        "tags": ["西路", "建筑", "深度游"],
    },
    "yongshou-gong": {
        "subtitle": "西六宫节点",
        "era": "宫廷居住空间",
        "content": "永寿宫适合纳入西六宫路线，用于补足西路后段的空间层次与宫廷生活叙事。",
        "tags": ["西六宫", "建筑", "西路"],
    },
    "yikun-gong": {
        "subtitle": "西六宫节点",
        "era": "宫廷居住空间",
        "content": "翊坤宫可与永寿宫、储秀宫共同构成西六宫段落，在地图上形成稳定的点对点游线。",
        "tags": ["西六宫", "建筑", "路线"],
    },
    "chu-xiu-gong": {
        "subtitle": "西六宫收束点",
        "era": "宫廷居住空间",
        "content": "储秀宫适合承担西六宫段落的收束或高潮节点，也适合与后宫生活主题的专题内容联动。",
        "tags": ["西六宫", "建筑", "专题"],
    },
    "cining-gong": {
        "subtitle": "慈宁宫区主节点",
        "era": "西路宫区建筑",
        "content": "慈宁宫是西路的重要核心建筑，适合与武英殿、慈宁宫花园共同构成西路深度游的主叙事。",
        "tags": ["慈宁宫区", "西路", "建筑"],
    },
    "cining-palace-garden": {
        "subtitle": "西路游园空间",
        "era": "宫苑园林空间",
        "content": "慈宁宫花园可以为西路路线提供节奏放缓的园林段落，也适合作为感悟记录与照片上传的推荐点。",
        "tags": ["园林", "西路", "感悟"],
    },
    "shoukang-gong": {
        "subtitle": "西路延伸节点",
        "era": "西路宫区建筑",
        "content": "寿康宫适合为慈宁宫区域路线提供更完整的落点，让西路产品体验形成闭环。",
        "tags": ["西路", "建筑", "延伸"],
    },
}

ROUTE_META = {
    "central-axis": {
        "type": "MAIN_FAST",
        "summary": "沿官方单向参观主轴，串联从午门到神武门的核心建筑序列。",
        "duration_minutes": 110,
        "distance_meters": 1450,
        "audience": "首次到访观众",
        "is_locked": False,
        "unlock_condition": "",
    },
    "central-axis-west-six": {
        "type": "MAIN_DEEP",
        "summary": "在中轴线基础上转入西六宫区域，适合偏好建筑与宫廷生活叙事的深度游。",
        "duration_minutes": 150,
        "distance_meters": 1820,
        "audience": "建筑与历史爱好者",
        "is_locked": False,
        "unlock_condition": "",
    },
    "three-halls-treasures": {
        "type": "TREASURE",
        "summary": "以三大殿为前段，再转入宁寿宫区和珍宝馆，适合重点参观东路高热度内容。",
        "duration_minutes": 130,
        "distance_meters": 1680,
        "audience": "东路深度游客",
        "is_locked": False,
        "unlock_condition": "",
    },
    "three-halls-cining": {
        "type": "CINING",
        "summary": "从前三殿转入西路慈宁宫区域，以建筑与园林空间体验为主。",
        "duration_minutes": 125,
        "distance_meters": 1560,
        "audience": "偏好西路与园林的观众",
        "is_locked": False,
        "unlock_condition": "",
    },
    "central-axis-treasures": {
        "type": "MAIN_PLUS_TREASURE",
        "summary": "在完整中轴体验之后进入宁寿宫区和珍宝馆，适合时间充裕的经典深度游。",
        "duration_minutes": 165,
        "distance_meters": 1940,
        "audience": "经典深度游观众",
        "is_locked": False,
        "unlock_condition": "",
    },
    "central-axis-clocks-treasures": {
        "type": "MAIN_PLUS_CLOCKS_TREASURE",
        "summary": "在中轴线后继续探索钟表馆与珍宝馆，适合专题展览导向的完整游线。",
        "duration_minutes": 180,
        "distance_meters": 2080,
        "audience": "专题展爱好者",
        "is_locked": False,
        "unlock_condition": "",
    },
}

QUESTS = [
    {
        "slug": "chapter-axis-awakening",
        "title": "主线一：中轴初识",
        "summary": "沿午门至神武门的主轴完成第一章导览，建立对空间秩序的整体感知。",
        "type": "MAIN",
        "chapter": "第一章",
        "route_slug": "central-axis",
        "cover_image": "generated://assets/quests/quest-01.svg",
        "reward_badge_name": "中轴启封",
        "reward_stamp": "午门印",
        "unlock_condition": "默认解锁",
    },
    {
        "slug": "chapter-treasure-memory",
        "title": "主线二：宁寿藏珍",
        "summary": "从中轴转入宁寿宫区，完成阅读、收藏与上传任务，解锁东路深度体验。",
        "type": "MAIN",
        "chapter": "第二章",
        "route_slug": "central-axis-treasures",
        "cover_image": "generated://assets/quests/quest-02.svg",
        "reward_badge_name": "宁寿藏珍",
        "reward_stamp": "宁寿印",
        "unlock_condition": "完成第一章",
    },
    {
        "slug": "chapter-west-garden",
        "title": "主线三：西路余韵",
        "summary": "进入慈宁宫区域，完成记录与感悟任务，让路线从建筑观看延伸到个人体验。",
        "type": "MAIN",
        "chapter": "第三章",
        "route_slug": "three-halls-cining",
        "cover_image": "generated://assets/quests/quest-03.svg",
        "reward_badge_name": "园居余韵",
        "reward_stamp": "慈宁印",
        "unlock_condition": "完成第二章并发布一条感悟",
    },
]

QUEST_STEPS = {
    "chapter-axis-awakening": [
        {
            "title": "抵达午门",
            "description": "在入口完成主线开启。",
            "step_order": 1,
            "step_type": "VISIT_POI",
            "target_slug": "wumen",
            "target_count": 1,
            "reward_fragment": "午",
        },
        {
            "title": "阅读太和门导览",
            "description": "在太和门停留并阅读讲解内容。",
            "step_order": 2,
            "step_type": "READ_CONTENT",
            "target_slug": "taihe-men",
            "target_count": 1,
            "reward_fragment": "和",
        },
        {
            "title": "收藏太和殿",
            "description": "将太和殿加入你的清单。",
            "step_order": 3,
            "step_type": "COLLECT_POI",
            "target_slug": "taihe-dian",
            "target_count": 1,
            "reward_fragment": "殿",
        },
        {
            "title": "完成御花园打卡",
            "description": "抵达御花园并完成本章收束。",
            "step_order": 4,
            "step_type": "VISIT_POI",
            "target_slug": "imperial-garden",
            "target_count": 1,
            "reward_fragment": "园",
        },
    ],
    "chapter-treasure-memory": [
        {
            "title": "进入皇极门",
            "description": "从东路门点进入宁寿宫区。",
            "step_order": 1,
            "step_type": "VISIT_POI",
            "target_slug": "huangji-men",
            "target_count": 1,
            "reward_fragment": "皇",
        },
        {
            "title": "慢读珍宝馆内容",
            "description": "完成一次珍宝馆内容阅读。",
            "step_order": 2,
            "step_type": "READ_CONTENT",
            "target_slug": "treasure-gallery",
            "target_count": 1,
            "reward_fragment": "珍",
        },
        {
            "title": "收藏箭亭广场文创店",
            "description": "把东路文创停留点加入个人清单。",
            "step_order": 3,
            "step_type": "COLLECT_POI",
            "target_slug": "jianting-square-store",
            "target_count": 1,
            "reward_fragment": "藏",
        },
        {
            "title": "上传东路照片",
            "description": "在珍宝馆区域上传一张现场照片。",
            "step_order": 4,
            "step_type": "UPLOAD_IMAGE",
            "target_slug": "treasure-gallery",
            "target_count": 1,
            "reward_fragment": "影",
        },
    ],
    "chapter-west-garden": [
        {
            "title": "走入隆宗门",
            "description": "从中轴转入西路段落。",
            "step_order": 1,
            "step_type": "VISIT_POI",
            "target_slug": "longzongmen",
            "target_count": 1,
            "reward_fragment": "西",
        },
        {
            "title": "阅读慈宁宫讲解",
            "description": "完成一次慈宁宫区内容阅读。",
            "step_order": 2,
            "step_type": "READ_CONTENT",
            "target_slug": "cining-gong",
            "target_count": 1,
            "reward_fragment": "慈",
        },
        {
            "title": "记录花园感悟",
            "description": "在慈宁宫花园发布一条公开感悟。",
            "step_order": 3,
            "step_type": "WRITE_REFLECTION",
            "target_slug": "cining-palace-garden",
            "target_count": 1,
            "reward_fragment": "园",
        },
        {
            "title": "完成寿康宫收束",
            "description": "抵达寿康宫并完成本章路线。",
            "step_order": 4,
            "step_type": "VISIT_POI",
            "target_slug": "shoukang-gong",
            "target_count": 1,
            "reward_fragment": "成",
        },
    ],
}

TOPICS = [
    {
        "slug": "axis-ritual-order",
        "title": "中轴礼序",
        "subtitle": "从午门到御花园，空间如何层层展开",
        "cover_image": "generated://assets/topics/topic-01.svg",
        "gallery": ["generated://assets/topics/topic-01.svg", "generated://assets/topics/topic-02.svg"],
        "tags": ["中轴线", "建筑", "礼序"],
        "content_blocks": [
            {"type": "lead", "content": "故宫的中轴线并不是简单的直线通行，它通过门、殿、台基与庭院层层组织观看节奏。"},
            {"type": "paragraph", "content": "在数字导览中，中轴线最适合承担首次到访的主线，因为它能够最快建立空间方位、礼序等级与建筑尺度感。"},
            {"type": "quote", "content": "当视线持续向北推进，空间本身就成为了最稳定的叙事引擎。"},
        ],
    },
    {
        "slug": "treasure-route-notes",
        "title": "宁寿藏珍",
        "subtitle": "从皇极门到珍宝馆，东路专题体验如何被组织",
        "cover_image": "generated://assets/topics/topic-03.svg",
        "gallery": ["generated://assets/topics/topic-03.svg", "generated://assets/topics/topic-04.svg"],
        "tags": ["宁寿宫区", "珍宝馆", "东路"],
        "content_blocks": [
            {"type": "lead", "content": "东路路线的重点不是简单的馆舍串联，而是如何让门点、广场、建筑与展览在体验上保持连贯。"},
            {"type": "paragraph", "content": "将皇极门、宁寿门、皇极殿与珍宝馆连续纳入 stop 链条后，地图上的路径推进会更符合真实参观节奏。"},
            {"type": "slider", "content": "对比东路不同停留点的叙事重心：建筑、展览、讲解与文创。"},
        ],
    },
    {
        "slug": "west-garden-breathing",
        "title": "西路余韵",
        "subtitle": "慈宁宫区域为何适合慢下来观看",
        "cover_image": "generated://assets/topics/topic-05.svg",
        "gallery": ["generated://assets/topics/topic-05.svg", "generated://assets/topics/topic-06.svg"],
        "tags": ["西路", "慈宁宫", "园林"],
        "content_blocks": [
            {"type": "lead", "content": "相较于中轴线的强秩序感，西路更适合通过建筑与园林交错来组织停留。"},
            {"type": "paragraph", "content": "慈宁宫、慈宁宫花园与寿康宫形成了一个更松弛的空间段落，也特别适合承载感悟记录和用户上传内容。"},
            {"type": "paragraph", "content": "这类路线在产品设计上，应减少强任务压迫感，更多强调节奏变化与个人体验。"},
        ],
    },
]

REFLECTIONS = [
    {
        "poi_slug": "taihe-dian",
        "title": "太和殿曾是国家大典的核心舞台",
        "content": "公开史料显示，明清两代的重要典礼常在太和殿及其广场一带举行，如即位、元旦朝贺、冬至庆典等。站在三层台基前，会更容易理解这条中轴为何先通过层层院落抬升情绪，再把仪式的重心落在这里。",
        "image_url": "generated://assets/ugc/ugc-01.svg",
        "mood_tag": "礼制",
        "is_public": True,
        "status": "APPROVED",
        "featured": True,
    },
    {
        "poi_slug": "qianqing-gong",
        "title": "乾清宫见证了内廷秩序的转变",
        "content": "乾清宫在明代长期被用作皇帝寝宫，清初仍沿用这一功能。到雍正以后，皇帝日常起居和理政重心逐渐转向养心殿，乾清宫的象征意义被保留下来，也让这里成为观察宫廷秩序变化的关键节点。",
        "image_url": "generated://assets/ugc/ugc-02.svg",
        "mood_tag": "宫廷生活",
        "is_public": True,
        "status": "APPROVED",
        "featured": True,
    },
    {
        "poi_slug": "imperial-garden",
        "title": "御花园是中轴末端的一处节奏转换",
        "content": "故宫中轴一路强调礼制秩序，到了御花园，空间气质会明显松开。堆秀山、御景亭与院中树石让参观从“大典空间”过渡到“园林空间”，也让这条路线在终段出现了更适合停留和回味的节奏。",
        "image_url": "generated://assets/ugc/ugc-03.svg",
        "mood_tag": "园林",
        "is_public": True,
        "status": "APPROVED",
        "featured": True,
    },
    {
        "poi_slug": "treasure-gallery",
        "title": "珍宝馆所在区域原与乾隆的归政设想有关",
        "content": "今天大家熟悉的珍宝馆位于宁寿宫区，而宁寿宫区本身与乾隆晚年的归政构想关系紧密。理解这一层背景之后，再看馆藏器物与宫殿空间的组合，会更容易感受到这一区域并不只是“展柜集合”，而是一整套被规划过的晚年宫居想象。",
        "image_url": "generated://assets/ugc/ugc-04.svg",
        "mood_tag": "珍藏",
        "is_public": True,
        "status": "APPROVED",
        "featured": False,
    },
    {
        "poi_slug": "clock-gallery",
        "title": "钟表馆折射出清代宫廷对西洋机械的兴趣",
        "content": "清代宫廷长期收藏和使用西洋钟表，这些器物既是时间工具，也是工艺与交流的见证。进入钟表馆后，观看方式会从建筑尺度转向机械细节，像是把目光从宫城的秩序收束到一件件会“运行”的器物之中。",
        "image_url": "generated://assets/ugc/ugc-05.svg",
        "mood_tag": "工艺",
        "is_public": True,
        "status": "APPROVED",
        "featured": False,
    },
    {
        "poi_slug": "jiulongbi",
        "title": "九龙壁是宁寿宫区最具辨识度的装饰地标之一",
        "content": "九龙壁位于宁寿宫区前部，是东路参观中非常容易形成记忆点的装饰节点。它的吸引力不只来自题材本身，也来自琉璃材质、色彩层次与院落空间之间形成的强烈视觉焦点。",
        "image_url": "generated://assets/ugc/ugc-06.svg",
        "mood_tag": "装饰",
        "is_public": True,
        "status": "APPROVED",
        "featured": False,
    },
    {
        "poi_slug": "cining-palace-garden",
        "title": "慈宁宫花园更像西路的一段余白",
        "content": "相比中轴与东路的高密度信息，慈宁宫花园的节奏更舒缓。它像是西路参观里的一个留白段落，适合停下来整理一路走来的建筑感受，也适合把个人游览记录留在更安静的空间氛围中。",
        "image_url": "generated://assets/ugc/ugc-07.svg",
        "mood_tag": "余韵",
        "is_public": True,
        "status": "APPROVED",
        "featured": True,
    },
    {
        "poi_slug": "zhenfei-well",
        "title": "珍妃井之所以被记住，是因为具体历史与空间重合了",
        "content": "珍妃井并不是宏大的建筑节点，但它因晚清宫廷人物命运而被长期记住。空间本身、人物遭际与后世叙事在这里叠合，使这个点位成为故宫里非常典型的“尺度不大、记忆极强”的历史场所。",
        "image_url": "generated://assets/ugc/ugc-08.svg",
        "mood_tag": "人物史",
        "is_public": True,
        "status": "APPROVED",
        "featured": False,
    },
]

BADGES = [
    {
        "name": "中轴启封",
        "icon": "generated://assets/badges/badge-01.svg",
        "description": "完成中轴线主线章节。",
        "rarity": "common",
        "category": "stamp",
    },
    {
        "name": "西路寻踪",
        "icon": "generated://assets/badges/badge-02.svg",
        "description": "完成西路慈宁宫区域路线。",
        "rarity": "rare",
        "category": "badge",
    },
    {
        "name": "宁寿藏珍",
        "icon": "generated://assets/badges/badge-03.svg",
        "description": "完成宁寿宫区与珍宝馆主线章节。",
        "rarity": "rare",
        "category": "badge",
    },
    {
        "name": "文渊漫游",
        "icon": "generated://assets/badges/badge-04.svg",
        "description": "完成东路专题内容浏览。",
        "rarity": "common",
        "category": "stamp",
    },
    {
        "name": "园居余韵",
        "icon": "generated://assets/badges/badge-05.svg",
        "description": "完成西路感悟记录章节。",
        "rarity": "epic",
        "category": "badge",
    },
    {
        "name": "宫苑静观",
        "icon": "generated://assets/badges/badge-06.svg",
        "description": "发布一条精选游览感悟。",
        "rarity": "rare",
        "category": "stamp",
    },
]


@lru_cache(maxsize=1)
def load_public_draft():
    with DATA_PATH.open("r", encoding="utf-8") as file:
        return json.load(file)


def map_seed():
    return load_public_draft()["map"]


def category_seed():
    return [
        {
            "key": meta["key"],
            "name": name,
            "icon": meta["icon"],
            "color": meta["color"],
            "sort_order": meta["sort_order"],
        }
        for name, meta in CATEGORY_META.items()
    ]


def _route_hint_lookup():
    data = load_public_draft()
    lookup = {}
    for route in data["routes"]:
        for slug in route["stopSlugs"]:
            lookup.setdefault(slug, []).append(route["title"])
    return lookup


def _poi_cover(index: int):
    return f"generated://assets/poi/poi-{index:02d}.svg"


def _waypoints_to_svg_path(waypoints: Optional[List[List[float]]]):
    if not waypoints:
        return ""

    points = [(x * MAP_WIDTH, y * MAP_HEIGHT) for x, y in waypoints]
    start_x, start_y = points[0]
    commands = [f"M {start_x:.1f} {start_y:.1f}"]
    for x, y in points[1:]:
        commands.append(f"L {x:.1f} {y:.1f}")
    return " ".join(commands)


def poi_seed():
    data = load_public_draft()
    route_hint_lookup = _route_hint_lookup()
    result = []
    for index, item in enumerate(data["pois"], start=1):
        meta = CATEGORY_META[item["category"]]
        detail = POI_DETAILS.get(item["slug"], {})
        cover_image = _poi_cover(index)
        route_hint = " / ".join(route_hint_lookup.get(item["slug"], [])[:2])
        result.append(
            {
                "slug": item["slug"],
                "title": item["title"],
                "subtitle": detail.get("subtitle", f"{item['category']}节点"),
                "era": detail.get("era", "公开资料整理"),
                "type": item["type"],
                "region": POI_REGION.get(item["slug"], "中轴"),
                "category_key": meta["key"],
                "x_ratio": item["xRatio"],
                "y_ratio": item["yRatio"],
                "cover_image": cover_image,
                "gallery": [cover_image, _poi_cover(((index + 4) % len(data["pois"])) + 1)],
                "summary": item["summary"],
                "content": detail.get("content", item["summary"]),
                "tags": detail.get("tags", [item["category"]]),
                "stay_minutes": item["stayMinutes"],
                "is_open": item["isOpen"],
                "route_hint": route_hint,
            }
        )
    return result


def route_seed():
    data = load_public_draft()
    result = []
    for index, item in enumerate(data["routes"], start=1):
        meta = ROUTE_META[item["slug"]]
        result.append(
            {
                "slug": item["slug"],
                "title": item["title"],
                "summary": meta["summary"],
                "type": meta["type"],
                "cover_image": f"generated://assets/routes/route-{index:02d}.svg",
                "duration_minutes": meta["duration_minutes"],
                "distance_meters": meta["distance_meters"],
                "audience": meta["audience"],
                "is_locked": meta["is_locked"],
                "unlock_condition": meta["unlock_condition"],
                "svg_path": _waypoints_to_svg_path(item.get("waypoints")),
            }
        )
    return result


def route_stops_seed():
    data = load_public_draft()
    return {item["slug"]: item["stopSlugs"] for item in data["routes"]}


def badge_seed():
    return deepcopy(BADGES)


def quest_seed():
    return deepcopy(QUESTS)


def quest_steps_seed():
    return deepcopy(QUEST_STEPS)


def topic_seed():
    return deepcopy(TOPICS)


def reflection_seed():
    return deepcopy(REFLECTIONS)
