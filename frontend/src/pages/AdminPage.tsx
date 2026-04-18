import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { api } from '../lib/api'
import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore, useIsAdmin } from '../store/useAppStore'

type AdminTab = 'pois' | 'routes' | 'quests' | 'uploads' | 'topics'

const tabLabel: Record<AdminTab, string> = {
  pois: '点位管理',
  routes: '路线管理',
  quests: '任务管理',
  uploads: '投稿审核',
  topics: '专题管理',
}

const createTemplates: Record<Exclude<AdminTab, 'uploads'>, Record<string, any>> = {
  pois: {
    slug: 'new-poi',
    title: '新点位',
    subtitle: '请输入副标题',
    era: '所属年代',
    type: 'BUILDING',
    region: '中轴',
    category_id: 1,
    x_ratio: 0.5,
    y_ratio: 0.5,
    cover_image: 'generated://assets/poi/poi-01.svg',
    gallery: ['generated://assets/poi/poi-01.svg'],
    summary: '请输入摘要',
    content: '请输入详细内容',
    tags: ['新建'],
    stay_minutes: 10,
    is_open: true,
    status: 'PUBLISHED',
    route_hint: '',
  },
  routes: {
    slug: 'new-route',
    title: '新路线',
    summary: '请输入路线摘要',
    type: 'MAIN_FAST',
    cover_image: 'generated://assets/routes/route-01.svg',
    duration_minutes: 60,
    distance_meters: 800,
    audience: '所有游客',
    is_locked: false,
    unlock_condition: '',
    svg_path: '',
    status: 'PUBLISHED',
  },
  quests: {
    slug: 'new-quest',
    title: '新任务',
    summary: '请输入任务摘要',
    type: 'MAIN',
    chapter: '新章节',
    route_id: 1,
    cover_image: 'generated://assets/quests/quest-01.svg',
    reward_badge_id: 1,
    reward_stamp: '新印章',
    unlock_condition: '默认解锁',
    status: 'PUBLISHED',
  },
  topics: {
    slug: 'new-topic',
    title: '新专题',
    subtitle: '请输入副标题',
    cover_image: 'generated://assets/topics/topic-01.svg',
    content_blocks: [{ type: 'lead', content: '请输入内容' }],
    gallery: ['generated://assets/topics/topic-01.svg'],
    tags: ['专题'],
    status: 'PUBLISHED',
  },
}

const sanitizePayload = (tab: Exclude<AdminTab, 'uploads'>, raw: Record<string, any>) => {
  if (tab === 'pois') {
    return {
      slug: raw.slug,
      title: raw.title,
      subtitle: raw.subtitle,
      era: raw.era,
      type: raw.type,
      region: raw.region,
      category_id: Number(raw.category_id),
      x_ratio: Number(raw.x_ratio),
      y_ratio: Number(raw.y_ratio),
      cover_image: raw.cover_image,
      gallery: raw.gallery,
      summary: raw.summary,
      content: raw.content,
      tags: raw.tags,
      stay_minutes: Number(raw.stay_minutes),
      is_open: Boolean(raw.is_open),
      status: raw.status,
      route_hint: raw.route_hint,
    }
  }

  if (tab === 'routes') {
    return {
      slug: raw.slug,
      title: raw.title,
      summary: raw.summary,
      type: raw.type,
      cover_image: raw.cover_image,
      duration_minutes: Number(raw.duration_minutes),
      distance_meters: Number(raw.distance_meters),
      audience: raw.audience,
      is_locked: Boolean(raw.is_locked),
      unlock_condition: raw.unlock_condition,
      svg_path: raw.svg_path ?? '',
      status: raw.status,
    }
  }

  if (tab === 'quests') {
    return {
      slug: raw.slug,
      title: raw.title,
      summary: raw.summary,
      type: raw.type,
      chapter: raw.chapter,
      route_id: raw.route_id ? Number(raw.route_id) : null,
      cover_image: raw.cover_image,
      reward_badge_id: raw.reward_badge_id ? Number(raw.reward_badge_id) : null,
      reward_stamp: raw.reward_stamp,
      unlock_condition: raw.unlock_condition,
      status: raw.status,
    }
  }

  return {
    slug: raw.slug,
    title: raw.title,
    subtitle: raw.subtitle,
    cover_image: raw.cover_image,
    content_blocks: raw.content_blocks,
    gallery: raw.gallery,
    tags: raw.tags,
    status: raw.status,
  }
}

export function AdminPage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const fetchBootstrap = useAppStore((state) => state.fetchBootstrap)
  const isAdmin = useIsAdmin()
  const [tab, setTab] = useState<AdminTab>('pois')
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('edit')
  const [editorId, setEditorId] = useState<number | null>(null)
  const [editorValue, setEditorValue] = useState('')

  const records = useMemo(() => {
    if (!data) return []
    if (tab === 'pois') return data.pois
    if (tab === 'routes') return data.routes
    if (tab === 'quests') return data.quests
    if (tab === 'topics') return data.topics
    return [...data.uploads, ...data.reflections]
  }, [data, tab])

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">{error ?? '正在加载后台...'}</div>
  }

  if (!isAdmin) {
    return (
      <div className="glass-panel rounded-[32px] p-8">
        <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">后台管理</div>
        <h1 className="mt-3 font-serif text-3xl text-stone-50">当前账号没有管理权限</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
          请使用管理员身份登录后再访问后台。演示管理员账号为 `admin` / `admin123`。
        </p>
        <Link to="/auth" className="mt-6 inline-flex rounded-2xl bg-amber-200/12 px-4 py-3 text-sm text-amber-100">
          前往登录
        </Link>
      </div>
    )
  }

  const reviewItem = async (kind: 'upload' | 'reflection', id: number, status: string) => {
    await api.post(`/admin/review/${kind}/${id}`, kind === 'reflection' ? { status, featured: status === 'APPROVED' } : { status, reviewNote: '后台已审核' })
    await fetchBootstrap()
  }

  const openEditor = (mode: 'create' | 'edit', record?: any) => {
    if (tab === 'uploads') return
    setEditorMode(mode)
    setEditorId(record?.id ?? null)
    const source = mode === 'create' ? createTemplates[tab] : sanitizePayload(tab, record)
    setEditorValue(JSON.stringify(source, null, 2))
    setEditorOpen(true)
  }

  const saveEditor = async () => {
    if (tab === 'uploads') return
    const parsed = JSON.parse(editorValue)
    if (editorMode === 'create') {
      await api.post(`/admin/${tab}`, sanitizePayload(tab, parsed))
    } else if (editorId) {
      await api.put(`/admin/${tab}/${editorId}`, sanitizePayload(tab, parsed))
    }
    await fetchBootstrap()
    setEditorOpen(false)
  }

  const removeRecord = async (id: number) => {
    if (tab === 'uploads') return
    await api.delete(`/admin/${tab}/${id}`)
    await fetchBootstrap()
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[280px_1fr]">
      <aside className="glass-panel rounded-[32px] p-5">
        <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">后台管理</div>
        <h2 className="mt-2 font-serif text-2xl text-stone-50">内容中台</h2>
        <div className="mt-5 space-y-2">
          {(['pois', 'routes', 'quests', 'uploads', 'topics'] as AdminTab[]).map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`w-full rounded-2xl px-4 py-3 text-left text-sm ${tab === item ? 'bg-amber-200/12 text-amber-100' : 'bg-white/[0.03] text-stone-400'}`}
            >
              {tabLabel[item]}
            </button>
          ))}
        </div>
      </aside>

      <section className="glass-panel rounded-[32px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-sky-100/60">数据表格</div>
            <h2 className="mt-2 font-serif text-2xl text-stone-50">{tabLabel[tab]}</h2>
          </div>
          <div className="flex gap-3">
            {tab !== 'uploads' && (
              <button onClick={() => openEditor('create')} className="rounded-2xl bg-amber-200/12 px-4 py-3 text-sm text-amber-100">
                新建
              </button>
            )}
            <button onClick={() => void fetchBootstrap()} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-100">
              刷新
            </button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-[28px] border border-white/8">
          <table className="min-w-full divide-y divide-white/8 text-left text-sm">
            <thead className="bg-white/[0.03] text-stone-400">
              <tr>
                <th className="px-4 py-3">标题</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3">摘要</th>
                <th className="px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/6">
              {records.map((item: any) => (
                <tr key={`${tab}-${item.id}`}>
                  <td className="px-4 py-3 text-stone-100">{item.title ?? item.slug ?? item.caption}</td>
                  <td className="px-4 py-3 text-stone-400">{item.status ?? 'PUBLISHED'}</td>
                  <td className="max-w-md px-4 py-3 text-stone-400">{item.summary ?? item.subtitle ?? item.content?.slice(0, 60) ?? item.reviewNote ?? '内容记录'}</td>
                  <td className="px-4 py-3">
                    {tab === 'uploads' && item.imageUrl ? (
                      <div className="flex gap-2">
                        <button onClick={() => void reviewItem(item.content ? 'reflection' : 'upload', item.id, 'APPROVED')} className="rounded-xl bg-emerald-300/12 px-3 py-2 text-xs text-emerald-200">
                          通过
                        </button>
                        <button onClick={() => void reviewItem(item.content ? 'reflection' : 'upload', item.id, 'REJECTED')} className="rounded-xl bg-rose-300/12 px-3 py-2 text-xs text-rose-200">
                          拒绝
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => openEditor('edit', item)} className="rounded-xl bg-white/6 px-3 py-2 text-xs text-stone-200">
                          编辑
                        </button>
                        <button onClick={() => void removeRecord(item.id)} className="rounded-xl bg-rose-300/12 px-3 py-2 text-xs text-rose-200">
                          删除
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {editorOpen && tab !== 'uploads' && (
        <div className="glass-panel fixed inset-y-6 right-6 z-[90] w-[min(560px,calc(100%-24px))] rounded-[32px] p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">抽屉表单</div>
              <h3 className="mt-2 font-serif text-2xl text-stone-50">{editorMode === 'create' ? '新建记录' : '编辑记录'}</h3>
            </div>
            <button onClick={() => setEditorOpen(false)} className="rounded-2xl border border-white/10 px-3 py-2 text-sm text-stone-100">
              关闭
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-stone-400">这里可以直接替换真实业务数据、图片路径与路线信息。</p>
          <textarea value={editorValue} onChange={(event) => setEditorValue(event.target.value)} className="field mt-4 min-h-[60svh] resize-none font-mono text-sm" />
          <div className="mt-4 flex gap-3">
            <button onClick={() => void saveEditor()} className="rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-5 py-3 text-sm font-medium text-stone-950">
              保存
            </button>
            <button onClick={() => setEditorOpen(false)} className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-stone-100">
              取消
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
