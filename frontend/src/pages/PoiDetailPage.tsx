import { Bookmark, Clock3, Headphones, ImagePlus, Share2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { resolveMediaUrl } from '../lib/api'
import { sharePage } from '../lib/share'
import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore, useIsAuthenticated } from '../store/useAppStore'

export function PoiDetailPage() {
  const navigate = useNavigate()
  const { slug } = useParams()
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const toggleCollection = useAppStore((state) => state.toggleCollection)
  const uploadImage = useAppStore((state) => state.uploadImage)
  const createReflection = useAppStore((state) => state.createReflection)
  const addToast = useAppStore((state) => state.addToast)
  const isAuthenticated = useIsAuthenticated()
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [mood, setMood] = useState('静观')

  const poi = useMemo(() => data?.pois.find((item) => item.slug === slug), [data, slug])

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">{error ?? '点位详情加载中...'}</div>
  }
  if (!poi) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">未找到该点位。</div>
  }

  const reflections = data.reflections.filter((item) => item.poiId === poi.id)

  const handleShare = async () => {
    try {
      const result = await sharePage({
        title: poi.title,
        text: `${poi.title} · ${poi.summary}`,
      })
      addToast(
        result === 'native' ? '已打开系统分享' : result === 'manual' ? '请手动复制链接' : '链接已复制',
        result === 'native' ? '可以继续分享到微信或其他应用。' : '当前点位链接已复制或弹出复制窗口。',
      )
    } catch {
      addToast('已取消分享', '你可以稍后再次尝试。')
    }
  }

  const submitReflection = async () => {
    if (!isAuthenticated) {
      addToast('请先登录', '登录后即可上传图片并发布游览感悟。')
      navigate('/auth')
      return
    }

    let imageUrl = ''
    if (file) {
      imageUrl = (await uploadImage({ poiId: poi.id, caption: title || poi.title, file })) ?? ''
    }
    await createReflection({
      poiId: poi.id,
      title: title || `${poi.title} 的游览感悟`,
      content,
      imageUrl,
      moodTag: mood,
      isPublic: true,
    })
    setTitle('')
    setContent('')
    setFile(null)
  }

  return (
    <div className="space-y-4">
      <section className="glass-panel overflow-hidden rounded-[36px] p-0">
        <div className="grid gap-0 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[420px] p-8">
            <img src={resolveMediaUrl(poi.coverImage)} alt={poi.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,14,22,0.2),rgba(10,14,22,0.92))]" />
            <div className="relative z-10 flex h-full flex-col justify-end">
              <div className="text-xs uppercase tracking-[0.32em] text-amber-100/70">{poi.era}</div>
              <h1 className="mt-4 font-serif text-5xl text-stone-50">{poi.title}</h1>
              <p className="mt-3 max-w-xl text-lg leading-7 text-stone-200/85">{poi.subtitle}</p>
            </div>
          </div>
          <div className="space-y-4 p-8">
            <p className="text-base leading-7 text-stone-300">{poi.content}</p>
            <div className="grid gap-3 md:grid-cols-2">
              <InfoCard icon={<Clock3 className="h-4 w-4" />} label="推荐停留" value={`${poi.stayMinutes} 分钟`} />
              <InfoCard icon={<Headphones className="h-4 w-4" />} label="讲解状态" value="音频讲解预留入口" />
            </div>
            <div className="flex flex-wrap gap-2">
              {poi.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                  {tag}
                </span>
              ))}
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <button onClick={() => void toggleCollection('POI', poi.id)} className="rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-4 py-3 text-sm font-medium text-stone-950"><Bookmark className="mr-2 inline h-4 w-4" /> 收藏</button>
              <button onClick={() => void handleShare()} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-100"><Share2 className="mr-2 inline h-4 w-4" /> 分享</button>
              <button className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-100">加入行程</button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_420px]">
        <div className="glass-panel rounded-[32px] p-5">
          <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">精选感悟</div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {reflections.map((reflection) => (
              <div key={reflection.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                <img src={resolveMediaUrl(reflection.imageUrl)} alt={reflection.title} className="h-44 w-full rounded-[22px] object-cover" />
                <div className="mt-4 text-lg text-stone-100">{reflection.title}</div>
                <div className="mt-2 text-sm leading-6 text-stone-400">{reflection.content}</div>
                <div className="mt-3 text-xs text-amber-100/70">{reflection.user.nickname} · {reflection.moodTag}</div>
              </div>
            ))}
          </div>
        </div>

        <aside className="glass-panel rounded-[32px] p-5">
          <div className="text-xs uppercase tracking-[0.32em] text-sky-100/60">发布感悟</div>
          <h2 className="mt-2 font-serif text-2xl text-stone-50">留下你的游览记录</h2>
          <div className="mt-4 space-y-3">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="感悟标题" className="field" />
            <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="写下你在此地的观察、记忆或感受..." className="field min-h-40 resize-none" />
            <select value={mood} onChange={(event) => setMood(event.target.value)} className="field">
              <option>静观</option>
              <option>惊喜</option>
              <option>震撼</option>
              <option>沉浸</option>
            </select>
            <label className="field flex cursor-pointer items-center justify-between">
              <span className="inline-flex items-center gap-2 text-stone-300"><ImagePlus className="h-4 w-4 text-amber-200" /> 上传图片</span>
              <input type="file" className="hidden" accept="image/*" onChange={(event) => setFile(event.target.files?.[0] ?? null)} />
              <span className="text-xs text-stone-500">{file?.name ?? '可选'}</span>
            </label>
            <button onClick={() => void submitReflection()} disabled={!content.trim()} className="w-full rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-5 py-3 text-sm font-medium text-stone-950 disabled:opacity-50">
              提交感悟
            </button>
          </div>
        </aside>
      </section>
    </div>
  )
}

function InfoCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs text-stone-500">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-base text-stone-100">{value}</div>
    </div>
  )
}
