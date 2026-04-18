import { BookOpenText, Compass, LayoutDashboard, LogOut, Map, Palette, ScrollText, Sparkles, User } from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore, useCurrentProfile, useIsAdmin, useIsAuthenticated } from '../store/useAppStore'

export function AppShell() {
  useBootstrap()
  const navigate = useNavigate()
  const logout = useAppStore((state) => state.logout)
  const profile = useCurrentProfile()
  const isAdmin = useIsAdmin()
  const isAuthenticated = useIsAuthenticated()

  const links = [
    { to: '/', label: '导览', icon: Map },
    { to: '/routes', label: '路线', icon: Compass },
    { to: '/quests', label: '任务', icon: Sparkles },
    { to: '/creative-plaza', label: '文创', icon: Palette },
    { to: '/story-hub', label: '故事汇', icon: BookOpenText },
    { to: '/topics', label: '专题', icon: ScrollText },
    { to: '/profile', label: '我的', icon: User },
  ]

  if (isAdmin) {
    links.push({ to: '/admin', label: '后台', icon: LayoutDashboard })
  }

  return (
    <div className="min-h-screen bg-[#07111d] text-stone-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(213,181,116,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(95,133,168,0.18),transparent_26%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1600px] flex-col px-3 pb-[calc(10.25rem+env(safe-area-inset-bottom))] pt-3 md:px-6 md:pb-12">
        <header className="glass-panel mb-4 flex items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.38em] text-amber-200/70">沉浸式数字导览平台</p>
            <h1 className="font-serif text-2xl tracking-[0.12em] text-stone-50 md:text-3xl">云游故宫</h1>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-amber-200/15 bg-stone-950/40 px-3 py-2 text-sm text-stone-300 md:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_14px_rgba(52,211,153,0.9)]" />
              本地数据源已连接
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-stone-200">
              {profile ? `${profile.nickname} · ${profile.role === 'ADMIN' ? '管理员' : '游客'}` : '未登录'}
            </div>
            {isAuthenticated ? (
              <button onClick={() => void logout()} className="rounded-full border border-white/10 px-4 py-2 text-sm text-stone-100">
                <LogOut className="mr-2 inline h-4 w-4" />
                退出
              </button>
            ) : (
              <button onClick={() => navigate('/auth')} className="rounded-full bg-amber-200/12 px-4 py-2 text-sm text-amber-100">
                登录 / 注册
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 pb-8 md:pb-0">
          <Outlet />
        </main>

        <nav className="glass-panel fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-1/2 z-50 flex w-[min(calc(100%-16px),960px)] -translate-x-1/2 items-center justify-between gap-1 overflow-x-auto rounded-[28px] px-2 py-2.5 md:bottom-5 md:gap-2 md:px-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex min-w-[68px] shrink-0 flex-col items-center gap-1 rounded-2xl px-3 py-2.5 text-[12px] leading-none transition ${
                  isActive
                    ? 'bg-amber-200/15 text-amber-100 shadow-[0_0_30px_rgba(216,179,103,0.22)]'
                    : 'text-stone-300 hover:text-stone-50'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px]" />
              <span className="whitespace-nowrap">{label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  )
}
