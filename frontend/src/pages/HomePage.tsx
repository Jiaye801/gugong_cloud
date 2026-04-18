import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, Map, Route, Sparkles, Timer, X } from 'lucide-react'
import { Link } from 'react-router-dom'

import { MapScene } from '../components/MapScene'
import { resolveMediaUrl } from '../lib/api'
import { useBootstrap } from '../lib/useBootstrap'
import type { RouteItem } from '../lib/types'
import { useActiveRoute, useAppStore, useSelectedPoi } from '../store/useAppStore'

export function HomePage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const activeCategory = useAppStore((state) => state.activeCategory)
  const setActiveCategory = useAppStore((state) => state.setActiveCategory)
  const toggleRouteDrawer = useAppStore((state) => state.toggleRouteDrawer)
  const routeDrawerOpen = useAppStore((state) => state.routeDrawerOpen)
  const mapHotspotsVisible = useAppStore((state) => state.mapHotspotsVisible)
  const toggleHotspots = useAppStore((state) => state.toggleHotspots)
  const roleMode = useAppStore((state) => state.roleMode)
  const setRoleMode = useAppStore((state) => state.setRoleMode)
  const selectPoi = useAppStore((state) => state.selectPoi)
  const activeRoute = useActiveRoute()
  const selectedPoi = useSelectedPoi()

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel h-[78svh] rounded-[32px] p-8 text-stone-200">{error ?? '正在织入总图、路线、任务与用户内容数据...'}</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_380px]">
        <div className="relative">
          <MapScene
            map={data.map}
            pois={data.pois}
            categories={data.categories}
            activeCategory={activeCategory}
            activeRoute={activeRoute}
            hotspotsVisible={mapHotspotsVisible}
            roleMode={roleMode}
            onSetCategory={setActiveCategory}
            onSelectPoi={selectPoi}
            onToggleHotspots={toggleHotspots}
            onSwitchRoleMode={() => setRoleMode(roleMode === 'map' ? 'wander' : 'map')}
          />

          <button
            onClick={() => toggleRouteDrawer(true)}
            className="absolute bottom-[8.5rem] left-1/2 z-[60] flex -translate-x-1/2 items-center gap-3 rounded-full border border-amber-200/20 bg-[#b8893a]/95 px-6 py-4 text-sm font-medium text-stone-950 shadow-[0_20px_45px_rgba(182,137,56,0.38)] md:bottom-6"
          >
            <Route className="h-4 w-4" />
            游览路线
          </button>
        </div>

        <aside className="space-y-4">
          <section className="glass-panel rounded-[32px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-100/70">导览规则</p>
                <h2 className="mt-2 font-serif text-2xl text-stone-50">{data.map.tourRule}</h2>
              </div>
              <Map className="h-6 w-6 text-amber-200" />
            </div>
            <div className="mt-4 grid gap-3 text-sm text-stone-200/86">
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-stone-300/70">入口</div>
                <div className="mt-1 text-base text-stone-50">{data.map.entryGate}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                <div className="text-stone-300/70">出口</div>
                <div className="mt-1 text-base text-stone-50">{data.map.exitGates.join(' / ')}</div>
              </div>
              <div className="rounded-3xl border border-white/8 bg-white/[0.03] p-4 leading-6 text-stone-200/74">{data.map.coordinateNote}</div>
            </div>
          </section>

          <section className="glass-panel rounded-[32px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-100/70">主线任务</p>
                <h2 className="mt-2 font-serif text-2xl text-stone-50">当前章节</h2>
              </div>
              <Sparkles className="h-6 w-6 text-amber-200" />
            </div>
            {data.quests.slice(0, 3).map((quest) => (
              <div key={quest.id} className="mt-4 rounded-3xl border border-white/8 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm text-stone-200/86">{quest.chapter}</div>
                    <div className="mt-1 text-lg text-stone-50">{quest.title}</div>
                  </div>
                  <span className="rounded-full bg-amber-200/10 px-3 py-1 text-xs text-amber-100">{quest.rewardStamp}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-stone-200/74">{quest.summary}</p>
                <Link to="/quests" className="mt-4 inline-flex items-center gap-2 text-sm text-amber-100">
                  查看任务中心 <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </section>

          <section className="glass-panel rounded-[32px] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-sky-100/60">路线状态</p>
                <h2 className="mt-2 font-serif text-2xl text-stone-50">{activeRoute?.title}</h2>
              </div>
              <Map className="h-6 w-6 text-sky-200" />
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-200/74">{activeRoute?.summary}</p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <Metric label="站点数" value={String(activeRoute?.stops.length ?? 0)} />
              <Metric label="时长" value={`${activeRoute?.durationMinutes ?? 0}m`} />
              <Metric label="距离" value={`${activeRoute?.distanceMeters ?? 0}m`} />
            </div>
          </section>
        </aside>
      </div>

      <AnimatePresence>
        {selectedPoi && (
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="glass-panel fixed inset-x-3 bottom-[8.75rem] z-[70] rounded-[32px] p-4 md:inset-x-auto md:bottom-8 md:right-6 md:w-[430px]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">{selectedPoi.era}</div>
                <h3 className="mt-2 font-serif text-2xl text-stone-50">{selectedPoi.title}</h3>
                <p className="mt-1 text-sm text-stone-200/74">{selectedPoi.subtitle}</p>
              </div>
              <button onClick={() => selectPoi(null)} className="rounded-full border border-white/10 p-2 text-stone-400 hover:text-stone-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <img src={resolveMediaUrl(selectedPoi.coverImage)} alt={selectedPoi.title} className="mt-4 h-44 w-full rounded-[24px] object-cover" />
            <p className="mt-4 text-sm leading-6 text-stone-200/84">{selectedPoi.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {selectedPoi.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-amber-200/15 bg-amber-200/8 px-3 py-1 text-xs text-amber-100">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-stone-200/84">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/6 px-3 py-2">
                <Timer className="h-4 w-4 text-amber-200" />
                推荐停留 {selectedPoi.stayMinutes} 分钟
              </span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-stone-100">收藏</button>
              <button onClick={() => toggleRouteDrawer(true)} className="rounded-2xl border border-amber-200/20 bg-amber-200/12 px-4 py-3 text-sm text-amber-100">加入路线</button>
              <Link to={`/poi/${selectedPoi.slug}`} className="col-span-2 rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-4 py-3 text-center text-sm font-medium text-stone-950">
                展开详情
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {routeDrawerOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="glass-panel fixed inset-x-3 bottom-[8.75rem] z-[65] max-h-[54svh] overflow-auto rounded-[32px] p-5 md:inset-x-auto md:bottom-8 md:left-6 md:max-h-[70svh] md:w-[520px]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-amber-100/70">游览路线</p>
                <h3 className="mt-2 font-serif text-2xl text-stone-50">路线选择与切换</h3>
              </div>
              <button onClick={() => toggleRouteDrawer(false)} className="rounded-full border border-white/10 p-2 text-stone-400 hover:text-stone-100">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {data.routes.map((route) => (
                <RouteCard key={route.id} route={route} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-3">
      <div className="text-xs text-stone-300/70">{label}</div>
      <div className="mt-2 text-base font-medium text-stone-50">{value}</div>
    </div>
  )
}

function RouteCard({ route }: { route: RouteItem }) {
  const setActiveRoute = useAppStore((state) => state.setActiveRoute)
  const toggleRouteDrawer = useAppStore((state) => state.toggleRouteDrawer)

  return (
    <div className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg text-stone-50">{route.title}</div>
          <div className="mt-2 text-sm leading-6 text-stone-200/74">{route.summary}</div>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs ${route.isLocked ? 'bg-white/10 text-stone-300/70' : 'bg-emerald-300/12 text-emerald-200'}`}>
          {route.isLocked ? '待解锁' : '可开始'}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-200/84">
        <span className="rounded-full bg-white/6 px-3 py-1">{route.stops.length} 个点位</span>
        <span className="rounded-full bg-white/6 px-3 py-1">{route.durationMinutes} 分钟</span>
        <span className="rounded-full bg-white/6 px-3 py-1">{route.distanceMeters} 米</span>
        <span className="rounded-full bg-white/6 px-3 py-1">{route.audience}</span>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          onClick={() => {
            setActiveRoute(route.slug)
            toggleRouteDrawer(false)
          }}
          className="flex-1 rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-4 py-3 text-sm font-medium text-stone-950"
        >
          开始游览
        </button>
        <Link to="/routes" className="flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-100">
          查看详情 <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      {route.isLocked && <div className="mt-3 text-xs text-amber-100/70">解锁条件：{route.unlockCondition}</div>}
    </div>
  )
}
