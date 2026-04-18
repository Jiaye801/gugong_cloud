import { Bookmark, Share2, Sparkles } from 'lucide-react'
import { useParams } from 'react-router-dom'

import { resolveMediaUrl } from '../lib/api'
import { sharePage } from '../lib/share'
import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore } from '../store/useAppStore'

export function TopicDetailPage() {
  const { slug } = useParams()
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const toggleCollection = useAppStore((state) => state.toggleCollection)
  const addToast = useAppStore((state) => state.addToast)

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">{error ?? '专题详情加载中...'}</div>
  }

  const topic = data.topics.find((item) => item.slug === slug)
  if (!topic) return <div className="glass-panel rounded-[32px] p-8 text-stone-300">未找到该专题。</div>

  const handleShare = async () => {
    try {
      const result = await sharePage({
        title: topic.title,
        text: topic.subtitle,
      })
      addToast(
        result === 'native' ? '已打开系统分享' : result === 'manual' ? '请手动复制链接' : '链接已复制',
        result === 'native' ? '可以继续分享该专题。' : '专题链接已复制或弹出复制窗口。',
      )
    } catch {
      addToast('已取消分享', '你可以稍后再试。')
    }
  }

  return (
    <div className="glass-panel overflow-hidden rounded-[40px] p-0">
      <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="relative min-h-[420px] overflow-hidden p-8 md:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(215,182,110,0.22),transparent_40%),linear-gradient(180deg,rgba(6,10,18,0.16),rgba(6,10,18,0.88))]" />
          <img src={resolveMediaUrl(topic.coverImage)} alt={topic.title} className="absolute inset-0 h-full w-full object-cover opacity-80" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-stone-950/35 px-4 py-2 text-xs uppercase tracking-[0.28em] text-amber-100/70">
                <Sparkles className="h-4 w-4" />
                专题长卷
              </div>
              <h1 className="mt-6 max-w-xl font-serif text-4xl leading-tight text-stone-50 md:text-5xl">{topic.title}</h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-stone-200/85">{topic.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => void toggleCollection('TOPIC', topic.id)} className="rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-5 py-3 text-sm font-medium text-stone-950">
                <Bookmark className="mr-2 inline h-4 w-4" />
                收藏专题
              </button>
              <button onClick={() => void handleShare()} className="rounded-2xl border border-white/12 px-5 py-3 text-sm text-stone-100">
                <Share2 className="mr-2 inline h-4 w-4" />
                分享
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 p-8 md:p-10">
          <div className="grid gap-3 md:grid-cols-2">
            {topic.gallery.map((item) => (
              <img key={item} src={resolveMediaUrl(item)} alt="" className="h-40 w-full rounded-[24px] object-cover" />
            ))}
          </div>
          <div className="space-y-4">
            {topic.contentBlocks.map((block, index) => (
              <div
                key={`${block.type}-${index}`}
                className={`rounded-[28px] p-5 ${
                  block.type === 'quote'
                    ? 'border border-amber-200/20 bg-amber-200/8 text-amber-50'
                    : 'border border-white/8 bg-white/[0.03] text-stone-300'
                }`}
              >
                <div className="text-xs uppercase tracking-[0.28em] text-amber-100/60">{block.type}</div>
                <div className="mt-3 text-base leading-7">{block.content}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
