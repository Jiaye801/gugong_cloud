import { Compass, FastForward, Footprints, MapPinned, PartyPopper } from 'lucide-react'
import type { ReactNode } from 'react'

import { resolveMediaUrl } from '../lib/api'
import { buildRoutePath, MAP_HEIGHT, MAP_WIDTH } from '../lib/map'
import { useBootstrap } from '../lib/useBootstrap'
import { useActiveRoute, useAppStore } from '../store/useAppStore'

export function RoutesPage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const routeView = useAppStore((state) => state.routeView)
  const setRouteView = useAppStore((state) => state.setRouteView)
  const setActiveRoute = useAppStore((state) => state.setActiveRoute)
  const advanceRoute = useAppStore((state) => state.advanceRoute)
  const activeRoute = useActiveRoute()

  if (loading || !bootstrapped || !data || !activeRoute) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-200">{error ?? '正在加载路线数据...'}</div>
  }

  const routePath = activeRoute.svgPath || buildRoutePath(activeRoute.stops)

  return (
    <div className="grid gap-4 pb-24 xl:grid-cols-[360px_1fr] md:pb-8">
      <section className="glass-panel rounded-[32px] p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-amber-100/70">路线列表</p>
            <h2 className="mt-2 font-serif text-2xl text-stone-50">游览编排</h2>
          </div>
          <Compass className="h-5 w-5 text-amber-200" />
        </div>
        <div className="mt-4 space-y-3">
          {data.routes.map((route) => (
            <button
              key={route.id}
              onClick={() => setActiveRoute(route.slug)}
              className={`w-full rounded-[26px] border p-4 text-left transition ${
                route.slug === activeRoute.slug ? 'border-amber-200/30 bg-amber-200/10' : 'border-white/8 bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-lg text-stone-50">{route.title}</div>
                <span className="text-xs text-stone-300/72">{route.stops.length} 站</span>
              </div>
              <div className="mt-2 text-sm leading-6 text-stone-200/74">{route.summary}</div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-[32px] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-sky-100/60">当前路线</p>
            <h2 className="mt-2 font-serif text-3xl text-stone-50">{activeRoute.title}</h2>
          </div>
          <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
            <button onClick={() => setRouteView('map')} className={`rounded-full px-4 py-2 text-sm ${routeView === 'map' ? 'bg-amber-200/15 text-amber-100' : 'text-stone-300/70'}`}>
              地图视图
            </button>
            <button onClick={() => setRouteView('flow')} className={`rounded-full px-4 py-2 text-sm ${routeView === 'flow' ? 'bg-amber-200/15 text-amber-100' : 'text-stone-300/70'}`}>
              路线示意
            </button>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <RouteMetric icon={<MapPinned className="h-4 w-4" />} label="预计距离" value={`${activeRoute.distanceMeters}m`} />
          <RouteMetric icon={<Footprints className="h-4 w-4" />} label="站点数量" value={`${activeRoute.stops.length}`} />
          <RouteMetric icon={<Compass className="h-4 w-4" />} label="适合人群" value={activeRoute.audience} />
          <RouteMetric icon={<PartyPopper className="h-4 w-4" />} label="解锁状态" value={activeRoute.isLocked ? '未解锁' : '可开始'} />
        </div>

        {routeView === 'flow' ? (
          <div className="mt-6 space-y-5">
            {activeRoute.stops.map((stop, index) => (
              <div key={stop.id} className="flex gap-4">
                <div className="flex w-10 flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-[#b8893a] font-semibold text-stone-950">
                    {index + 1}
                  </div>
                  {index !== activeRoute.stops.length - 1 && <div className="mt-2 h-full w-px bg-gradient-to-b from-amber-200/50 to-transparent" />}
                </div>
                <div className="flex-1 rounded-[24px] border border-white/8 bg-white/[0.03] p-4">
                  <div className="text-lg text-stone-50">{stop.poi.title}</div>
                  <div className="mt-1 text-sm text-stone-300/76">{stop.poi.subtitle}</div>
                  <div className="mt-3 text-sm leading-6 text-stone-200/80">{stop.checkpointNote}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[28px] border border-white/8 bg-[#08131d]">
            <div className="border-b border-white/6 bg-white/[0.03] px-5 py-4 text-sm text-stone-200/82">
              <span className="text-amber-100">{data.map.sourceName}</span>
              <span className="mx-2 text-stone-400">•</span>
              <span>{data.map.tourRule}</span>
            </div>

            <div className="relative flex h-[calc(100svh-11.75rem)] min-h-[740px] w-full items-center justify-center overflow-hidden bg-[#08131d] px-2 py-3 md:px-4">
              <div className="relative h-full aspect-[1180/2027] overflow-hidden rounded-[22px] border border-white/8 shadow-[0_18px_44px_rgba(0,0,0,0.34)]">
                <img
                  src={resolveMediaUrl(data.map.imageUrl || 'generated://map/imperial-map')}
                  alt={data.map.sourceName}
                  className="absolute inset-0 h-full w-full scale-[1.03] object-contain saturate-[0.98] contrast-[1.06] brightness-[1.03]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,16,0.08),rgba(5,10,16,0.18))]" />

                <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="absolute inset-0 h-full w-full">
                  <defs>
                    <filter id="routeShadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor="#f1d8a8" floodOpacity="0.45" />
                    </filter>
                    <linearGradient id="routeTrail" x1="0%" x2="100%" y1="0%" y2="0%">
                      <stop offset="0%" stopColor="#f6dfb1" />
                      <stop offset="55%" stopColor="#d2a458" />
                      <stop offset="100%" stopColor="#8bb6d8" />
                    </linearGradient>
                  </defs>

                  <path d={routePath} fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                  <path d={routePath} fill="none" stroke="url(#routeTrail)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" filter="url(#routeShadow)" />

                  {activeRoute.stops.map((stop, index) => {
                    const isLast = index === activeRoute.stops.length - 1
                    const cx = stop.poi.xRatio * MAP_WIDTH
                    const cy = stop.poi.yRatio * MAP_HEIGHT

                    return (
                      <g key={stop.id}>
                        <circle cx={cx} cy={cy} r="24" fill="rgba(7,14,22,0.36)" />
                        <circle cx={cx} cy={cy} r="18" fill="#e0b66d" />
                        <circle cx={cx} cy={cy} r="10" fill={isLast ? '#8bb6d8' : '#0b1622'} opacity="0.88" />
                        <text x={cx} y={cy + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={isLast ? '#08111b' : '#f6dfb1'}>
                          {stop.stopOrder}
                        </text>
                      </g>
                    )
                  })}
                </svg>

                <div className="absolute bottom-4 left-4 rounded-2xl border border-amber-200/20 bg-[#08131d]/72 px-4 py-3 text-xs leading-6 text-stone-200/82 backdrop-blur-md">
                  <div>起点：{activeRoute.stops[0]?.poi.title}</div>
                  <div>终点：{activeRoute.stops[activeRoute.stops.length - 1]?.poi.title}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={() => advanceRoute(activeRoute.id, 'next')} className="rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-5 py-3 text-sm font-medium text-stone-950">下一站</button>
          <button onClick={() => advanceRoute(activeRoute.id, 'skip')} className="rounded-2xl border border-white/10 px-5 py-3 text-sm text-stone-100">跳过</button>
          <button onClick={() => advanceRoute(activeRoute.id, 'complete')} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm text-stone-100">
            <FastForward className="h-4 w-4" />
            完成打卡
          </button>
        </div>
      </section>
    </div>
  )
}

function RouteMetric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
      <div className="flex items-center gap-2 text-xs text-stone-300/70">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-base font-medium text-stone-50">{value}</div>
    </div>
  )
}
