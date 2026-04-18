export type Category = {
  id: number
  key: string
  name: string
  icon: string
  color: string
}

export type MapConfig = {
  sourceName: string
  sourcePage: string
  imageUrl: string
  entryGate: string
  exitGates: string[]
  tourRule: string
  coordinateNote: string
}

export type Poi = {
  id: number
  slug: string
  title: string
  subtitle: string
  era: string
  type: string
  region: string
  categoryId: number
  categoryKey: string
  xRatio: number
  yRatio: number
  coverImage: string
  gallery: string[]
  summary: string
  content: string
  tags: string[]
  stayMinutes: number
  isOpen: boolean
  status: string
  routeHint: string
}

export type RouteStop = {
  id: number
  routeId: number
  poiId: number
  stopOrder: number
  label: string
  dwellMinutes: number
  checkpointNote: string
  poi: Poi
}

export type RouteItem = {
  id: number
  slug: string
  title: string
  summary: string
  type: string
  coverImage: string
  durationMinutes: number
  distanceMeters: number
  audience: string
  isLocked: boolean
  unlockCondition: string
  svgPath: string
  status: string
  stops: RouteStop[]
}

export type Badge = {
  id: number
  name: string
  icon: string
  description: string
  rarity: string
  category: string
}

export type QuestStep = {
  id: number
  questId: number
  title: string
  description: string
  stepOrder: number
  stepType: string
  targetCount: number
  rewardFragment: string
  unlockCondition: string
  targetPoi: Poi | null
}

export type Quest = {
  id: number
  slug: string
  title: string
  summary: string
  type: string
  chapter: string
  coverImage: string
  rewardStamp: string
  unlockCondition: string
  status: string
  route: RouteItem | null
  rewardBadge: Badge | null
  steps: QuestStep[]
}

export type Reflection = {
  id: number
  title: string
  content: string
  imageUrl: string
  moodTag: string
  isPublic: boolean
  status: string
  featured: boolean
  poiId: number
  user: {
    id: number
    nickname: string
    avatarUrl: string
    role: string
  }
  createdAt: string
}

export type Upload = {
  id: number
  poiId: number
  imageUrl: string
  caption: string
  status: string
  reviewNote: string
  user: {
    id: number
    nickname: string
    avatarUrl: string
    role: string
  }
  createdAt: string
}

export type TopicArticle = {
  id: number
  slug: string
  title: string
  subtitle: string
  coverImage: string
  contentBlocks: { type: string; content: string }[]
  gallery: string[]
  tags: string[]
  status: string
  publishedAt: string
}

export type Profile = {
  id: number
  account: string
  nickname: string
  avatarUrl: string
  bio: string
  level: number
  exp: number
  role: string
  isActive: boolean
  badges: {
    id: number
    unlockedAt: string
    badge: Badge
  }[]
  uploads: Upload[]
  reflections: Reflection[]
  collections: {
    id: number
    targetType: string
    targetId: number
  }[]
  routeProgress: {
    routeId: number
    currentStopOrder: number
    completedStops: number
    isCompleted: boolean
  }[]
  questProgress: {
    questId: number
    currentStepOrder: number
    completedSteps: number
    isCompleted: boolean
  }[]
  questStepProgress: {
    questStepId: number
    progressValue: number
    isCompleted: boolean
  }[]
  poiVisits: {
    poiId: number
    routeId: number | null
    visitedAt: string
  }[]
}

export type AuthSession = {
  authenticated: boolean
  token: string | null
  user: Profile | null
}

export type BootstrapPayload = {
  map: MapConfig
  categories: Category[]
  pois: Poi[]
  routes: RouteItem[]
  quests: Quest[]
  topics: TopicArticle[]
  reflections: Reflection[]
  uploads: Upload[]
  profile: Profile | null
}
