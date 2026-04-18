import { create } from 'zustand'

import { api, getAuthToken, setAuthToken } from '../lib/api'
import type { BootstrapPayload, Poi, Profile, Quest, RouteItem } from '../lib/types'

type Toast = {
  id: string
  title: string
  description?: string
}

type LoginPayload = {
  account: string
  password: string
  role: 'VISITOR' | 'ADMIN'
}

type RegisterPayload = {
  account: string
  password: string
  nickname: string
}

type State = {
  loading: boolean
  error: string | null
  bootstrapped: boolean
  authToken: string | null
  data: BootstrapPayload | null
  activeCategory: string
  selectedPoiSlug: string | null
  activeRouteSlug: string | null
  routeView: 'map' | 'flow'
  mapHotspotsVisible: boolean
  roleMode: 'map' | 'wander'
  routeDrawerOpen: boolean
  toasts: Toast[]
  fetchBootstrap: () => Promise<void>
  setActiveCategory: (category: string) => void
  selectPoi: (slug: string | null) => void
  toggleRouteDrawer: (open?: boolean) => void
  setRoleMode: (mode: 'map' | 'wander') => void
  setRouteView: (view: 'map' | 'flow') => void
  toggleHotspots: () => void
  setActiveRoute: (slug: string | null) => void
  addToast: (title: string, description?: string) => void
  dismissToast: (id: string) => void
  login: (payload: LoginPayload) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  resetAuthState: () => Promise<void>
  toggleCollection: (targetType: string, targetId: number) => Promise<void>
  advanceRoute: (routeId: number, action?: 'next' | 'skip' | 'complete') => Promise<void>
  completeQuestStep: (questId: number, stepId: number) => Promise<void>
  createReflection: (payload: {
    poiId: number
    title: string
    content: string
    imageUrl?: string
    moodTag: string
    isPublic: boolean
  }) => Promise<void>
  uploadImage: (payload: {
    poiId: number
    caption: string
    file: File
  }) => Promise<string | null>
  refreshProfile: () => Promise<void>
}

const findBySlug = <T extends { slug: string }>(items: T[], slug?: string | null) => items.find((item) => item.slug === slug) ?? null
const createToastId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

const requireProfile = (profile: Profile | null) => {
  if (!profile) {
    throw new Error('当前尚未加载用户资料。')
  }
  return profile
}

export const useAppStore = create<State>((set, get) => ({
  loading: false,
  error: null,
  bootstrapped: false,
  authToken: getAuthToken(),
  data: null,
  activeCategory: 'all',
  selectedPoiSlug: null,
  activeRouteSlug: null,
  routeView: 'map',
  mapHotspotsVisible: true,
  roleMode: 'map',
  routeDrawerOpen: false,
  toasts: [],

  fetchBootstrap: async () => {
    set({ loading: true, error: null })
    try {
      const { data } = await api.get<BootstrapPayload>('/bootstrap')
      set({
        data,
        bootstrapped: true,
        loading: false,
        activeRouteSlug: data.routes[0]?.slug ?? null,
      })
    } catch {
      set({ error: '数据加载失败，请确认 Flask 服务已经启动。', loading: false })
    }
  },

  setActiveCategory: (category) => set({ activeCategory: category }),
  selectPoi: (slug) => set({ selectedPoiSlug: slug }),
  toggleRouteDrawer: (open) => set((state) => ({ routeDrawerOpen: open ?? !state.routeDrawerOpen })),
  setRoleMode: (mode) => set({ roleMode: mode }),
  setRouteView: (view) => set({ routeView: view }),
  toggleHotspots: () => set((state) => ({ mapHotspotsVisible: !state.mapHotspotsVisible })),
  setActiveRoute: (slug) => set({ activeRouteSlug: slug }),

  addToast: (title, description) =>
    set((state) => ({
      toasts: [...state.toasts, { id: createToastId(), title, description }],
    })),

  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),

  login: async (payload) => {
    const response = await api.post('/auth/login', payload)
    const token = response.data.token as string
    setAuthToken(token)
    set({ authToken: token })
    await get().fetchBootstrap()
    get().addToast('登录成功', payload.role === 'ADMIN' ? '已切换为管理员身份。' : '已切换为游客身份。')
  },

  register: async (payload) => {
    const response = await api.post('/auth/register', payload)
    const token = response.data.token as string
    setAuthToken(token)
    set({ authToken: token })
    await get().fetchBootstrap()
    get().addToast('注册成功', '新游客账号已创建并自动登录。')
  },

  logout: async () => {
    await api.post('/auth/logout')
    setAuthToken(null)
    set({ authToken: null })
    await get().fetchBootstrap()
    get().addToast('已退出登录', '当前已切回默认游客浏览状态。')
  },

  resetAuthState: async () => {
    setAuthToken(null)
    set({ authToken: null })
    await get().fetchBootstrap()
  },

  toggleCollection: async (targetType, targetId) => {
    const { data } = await api.post('/collections/toggle', { targetType, targetId })
    set((state) =>
      state.data
        ? {
            data: {
              ...state.data,
              profile: data.profile,
            },
          }
        : state,
    )
    get().addToast(data.active ? '已加入清单' : '已取消收藏', '你的个人清单已经更新。')
  },

  advanceRoute: async (routeId, action = 'next') => {
    const { data } = await api.post(`/routes/${routeId}/advance`, { action })
    await get().refreshProfile()
    get().addToast('路线进度已更新', data.progress.isCompleted ? '这条路线已经完成。' : '下一站已准备就绪。')
  },

  completeQuestStep: async (questId, stepId) => {
    const { data } = await api.post(`/quests/${questId}/steps/${stepId}/complete`)
    set((state) =>
      state.data
        ? {
            data: {
              ...state.data,
              profile: data.profile,
            },
          }
        : state,
    )
    get().addToast('任务步骤已完成', '奖励与进度已经同步。')
  },

  createReflection: async (payload) => {
    await api.post('/reflections', payload)
    await get().fetchBootstrap()
    get().addToast('感悟已提交', '内容已进入待审核状态。')
  },

  uploadImage: async ({ poiId, caption, file }) => {
    const formData = new FormData()
    formData.append('poiId', String(poiId))
    formData.append('caption', caption)
    formData.append('file', file)
    const { data } = await api.post('/uploads', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    await get().fetchBootstrap()
    get().addToast('图片上传成功', '图片已进入审核队列。')
    return data.upload.imageUrl as string
  },

  refreshProfile: async () => {
    const { data } = await api.get('/profile')
    set((state) =>
      state.data
        ? {
            data: {
              ...state.data,
              profile: data,
            },
          }
        : state,
    )
  },
}))

export const useSelectedPoi = (): Poi | null => {
  const data = useAppStore((state) => state.data)
  const selectedPoiSlug = useAppStore((state) => state.selectedPoiSlug)
  return data ? findBySlug(data.pois, selectedPoiSlug) : null
}

export const useActiveRoute = (): RouteItem | null => {
  const data = useAppStore((state) => state.data)
  const activeRouteSlug = useAppStore((state) => state.activeRouteSlug)
  return data ? findBySlug(data.routes, activeRouteSlug) : null
}

export const useQuestBySlug = (slug?: string): Quest | null => {
  const data = useAppStore((state) => state.data)
  return data ? findBySlug(data.quests, slug) : null
}

export const useCurrentProfile = (): Profile | null => {
  const data = useAppStore((state) => state.data)
  return data?.profile ?? null
}

export const useIsAdmin = () => {
  const profile = useCurrentProfile()
  const token = useAppStore((state) => state.authToken)
  return Boolean(token && profile?.role === 'ADMIN')
}

export const useIsAuthenticated = () => {
  const token = useAppStore((state) => state.authToken)
  const profile = useCurrentProfile()
  return Boolean(token && profile)
}

export const ensureProfile = requireProfile
