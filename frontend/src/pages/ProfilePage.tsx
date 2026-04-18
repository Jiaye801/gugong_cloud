import { Bookmark, Camera, Medal, Route, ScrollText } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { resolveMediaUrl } from '../lib/api'
import { useBootstrap } from '../lib/useBootstrap'
import { useCurrentProfile, useIsAuthenticated } from '../store/useAppStore'

export function ProfilePage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const profile = useCurrentProfile()
  const isAuthenticated = useIsAuthenticated()

  if (loading || !bootstrapped) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">{error ?? '个人档案加载中...'}</div>
  }

  if (!profile) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">当前暂无可用的用户资料。</div>
  }

  return (
    <div className="space-y-4">
      {!isAuthenticated && (
        <div className="glass-panel rounded-[28px] p-5 text-sm leading-7 text-stone-300">
          当前正在以默认游客视角浏览。若要保存收藏、上传图片和同步感悟，建议先
          <Link to="/auth" className="mx-2 text-amber-100 underline-offset-4 hover:underline">
            登录或注册
          </Link>
          你的个人账号。
        </div>
      )}

      <section className="glass-panel rounded-[36px] p-6">
        <div className="flex flex-wrap items-center gap-5">
          <img src={resolveMediaUrl(profile.avatarUrl)} alt={profile.nickname} className="h-24 w-24 rounded-[28px] object-cover" />
          <div className="flex-1">
            <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">个人中心</div>
            <h1 className="mt-2 font-serif text-4xl text-stone-50">{profile.nickname}</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-400">{profile.bio}</p>
            <div className="mt-3 text-xs text-amber-100/70">{profile.role === 'ADMIN' ? '管理员' : '游客'} · {profile.account}</div>
          </div>
          <div className="rounded-[28px] border border-white/8 bg-white/[0.04] px-5 py-4 text-center">
            <div className="text-xs text-stone-500">等级</div>
            <div className="mt-2 text-3xl text-amber-100">Lv.{profile.level}</div>
            <div className="mt-1 text-sm text-stone-400">{profile.exp} EXP</div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <StatCard icon={<Route className="h-5 w-5" />} label="已完成路线" value={String(profile.routeProgress.filter((item) => item.isCompleted).length)} />
        <StatCard icon={<Medal className="h-5 w-5" />} label="已解锁徽章" value={String(profile.badges.length)} />
        <StatCard icon={<Bookmark className="h-5 w-5" />} label="收藏清单" value={String(profile.collections.length)} />
        <StatCard icon={<Camera className="h-5 w-5" />} label="上传内容" value={String(profile.uploads.length)} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr]">
        <ColumnCard title="成就墙" icon={<Medal className="h-5 w-5 text-amber-200" />}>
          {profile.badges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-3 rounded-[22px] border border-white/8 bg-white/[0.03] p-3">
              <img src={resolveMediaUrl(badge.badge.icon)} alt={badge.badge.name} className="h-12 w-12 rounded-2xl object-cover" />
              <div>
                <div className="text-sm text-stone-100">{badge.badge.name}</div>
                <div className="mt-1 text-xs text-stone-400">{badge.badge.description}</div>
              </div>
            </div>
          ))}
        </ColumnCard>

        <ColumnCard title="我的感悟" icon={<ScrollText className="h-5 w-5 text-amber-200" />}>
          {profile.reflections.map((reflection) => (
            <div key={reflection.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
              <div className="text-sm text-stone-100">{reflection.title}</div>
              <div className="mt-2 text-xs leading-5 text-stone-400">{reflection.content}</div>
              <div className="mt-3 text-xs text-amber-100/70">{reflection.status}</div>
            </div>
          ))}
        </ColumnCard>

        <ColumnCard title="我的上传" icon={<Camera className="h-5 w-5 text-amber-200" />}>
          <div className="grid grid-cols-2 gap-3">
            {profile.uploads.map((upload) => (
              <div key={upload.id} className="rounded-[22px] border border-white/8 bg-white/[0.03] p-3">
                <img src={resolveMediaUrl(upload.imageUrl)} alt={upload.caption} className="h-28 w-full rounded-[18px] object-cover" />
                <div className="mt-3 text-xs text-stone-300">{upload.caption || '游客上传图片'}</div>
              </div>
            ))}
          </div>
        </ColumnCard>
      </section>
    </div>
  )
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="glass-panel rounded-[28px] p-5">
      <div className="flex items-center gap-2 text-stone-400">
        {icon}
        {label}
      </div>
      <div className="mt-4 text-4xl font-semibold text-stone-50">{value}</div>
    </div>
  )
}

function ColumnCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="glass-panel rounded-[32px] p-5">
      <div className="flex items-center gap-2 text-stone-100">
        {icon}
        {title}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  )
}
