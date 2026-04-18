import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

import { resolveMediaUrl } from '../lib/api'
import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore } from '../store/useAppStore'

export function TopicsPage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">{error ?? '专题内容加载中...'}</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {data.topics.map((topic) => (
        <Link key={topic.id} to={`/topics/${topic.slug}`} className="glass-panel group rounded-[32px] p-4 transition hover:-translate-y-1">
          <img src={resolveMediaUrl(topic.coverImage)} alt={topic.title} className="h-60 w-full rounded-[28px] object-cover" />
          <div className="mt-4 text-xs uppercase tracking-[0.32em] text-amber-100/60">专题策展</div>
          <div className="mt-2 font-serif text-2xl text-stone-50">{topic.title}</div>
          <div className="mt-2 text-sm leading-6 text-stone-400">{topic.subtitle}</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {topic.tags.map((tag) => (
              <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-300">
                {tag}
              </span>
            ))}
          </div>
          <div className="mt-5 inline-flex items-center gap-2 text-sm text-amber-100">
            进入详情 <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </div>
        </Link>
      ))}
    </div>
  )
}
