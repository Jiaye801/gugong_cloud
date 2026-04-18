import { AnimatePresence, motion } from 'framer-motion'
import { Compass, Crosshair, Eye, EyeOff, Layers3, LocateFixed, MapPinned } from 'lucide-react'
import type { ReactNode } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'

import { resolveMediaUrl } from '../lib/api'
import { buildRoutePath, MAP_HEIGHT, MAP_WIDTH } from '../lib/map'
import type { Category, MapConfig, Poi, RouteItem } from '../lib/types'

type Props = {
  map: MapConfig
  pois: Poi[]
  categories: Category[]
  activeCategory: string
  activeRoute: RouteItem | null
  hotspotsVisible: boolean
  roleMode: 'map' | 'wander'
  onSetCategory: (key: string) => void
  onSelectPoi: (slug: string) => void
  onToggleHotspots: () => void
  onSwitchRoleMode: () => void
}

export function MapScene({
  map,
  pois,
  categories,
  activeCategory,
  activeRoute,
  hotspotsVisible,
  roleMode,
  onSetCategory,
  onSelectPoi,
  onToggleHotspots,
  onSwitchRoleMode,
}: Props) {
  const filtered = activeCategory === 'all' ? pois : pois.filter((poi) => poi.categoryKey === activeCategory)
  const routeStops = activeRoute?.stops ?? []
  const routePath = activeRoute?.svgPath || (activeRoute ? buildRoutePath(routeStops) : '')

  return (
    <TransformWrapper
      minScale={0.9}
      initialScale={0.96}
      maxScale={4}
      limitToBounds={false}
      doubleClick={{ mode: 'zoomIn', step: 0.45 }}
      wheel={{ step: 0.18 }}
      pinch={{ step: 5 }}
      centerOnInit
    >
      {({ centerView, resetTransform, zoomIn, zoomOut }) => (
        <div className="relative overflow-hidden rounded-[34px] border border-amber-200/12 bg-[#08111b] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
          <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_46%,rgba(3,8,14,0.7)_100%)]" />

          <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 md:p-5">
            <div className="glass-panel flex max-w-[76%] items-center gap-2 overflow-x-auto rounded-full px-2 py-2">
              <button onClick={() => onSetCategory('all')} className={`chip ${activeCategory === 'all' ? 'chip-active' : ''}`}>
                全部
              </button>
              {categories.map((category) => (
                <button key={category.id} onClick={() => onSetCategory(category.key)} className={`chip ${activeCategory === category.key ? 'chip-active' : ''}`}>
                  {category.name}
                </button>
              ))}
            </div>
            <div className="glass-panel hidden items-center gap-2 rounded-full px-3 py-2 text-xs text-stone-200 md:flex">
              <MapPinned className="h-4 w-4 text-amber-200" />
              {map.sourceName}
            </div>
          </div>

          <div className="absolute bottom-[5.25rem] left-4 z-20 flex flex-col gap-3 md:bottom-6 md:left-6">
            <div className="glass-panel rounded-3xl px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.32em] text-amber-100/70">游览进度</div>
              <div className="mt-2 text-xl font-semibold text-stone-50">67%</div>
              <div className="mt-2 h-2 w-28 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-amber-200 to-amber-500" />
              </div>
            </div>
            <div className="glass-panel rounded-3xl px-4 py-3">
              <div className="text-[11px] uppercase tracking-[0.32em] text-amber-100/70">已解锁成就</div>
              <div className="mt-2 flex items-center gap-2 text-sm text-stone-100">
                <span className="rounded-full bg-amber-200/15 px-3 py-1">6 枚徽章</span>
                <span className="rounded-full bg-sky-200/10 px-3 py-1">3 枚印章</span>
              </div>
            </div>
          </div>

          <div className="absolute right-4 top-20 z-20 flex flex-col gap-3 md:right-6 md:top-24">
            <ActionButton icon={<Layers3 className="h-4 w-4" />} label="聚焦路线" onClick={() => centerView(1.1, 260, 'easeOut')} />
            <ActionButton icon={<Crosshair className="h-4 w-4" />} label="回正复位" onClick={() => resetTransform()} />
            <ActionButton icon={hotspotsVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />} label={hotspotsVisible ? '隐藏热点' : '显示热点'} onClick={onToggleHotspots} />
            <ActionButton icon={roleMode === 'map' ? <Compass className="h-4 w-4" /> : <LocateFixed className="h-4 w-4" />} label={roleMode === 'map' ? '漫游模式' : '地图模式'} onClick={onSwitchRoleMode} />
            <ActionButton icon={<span className="text-lg leading-none">+</span>} label="放大" onClick={() => zoomIn()} />
            <ActionButton icon={<span className="text-lg leading-none">-</span>} label="缩小" onClick={() => zoomOut()} />
          </div>

          <TransformComponent wrapperClass="!w-full !h-[calc(100svh-12.75rem)] !min-h-[680px] md:!h-[82svh]" contentClass="!w-auto !h-auto">
            <div className="relative h-[2027px] w-[1180px] overflow-hidden bg-[#08111b]">
              <img
                src={resolveMediaUrl(map.imageUrl || 'generated://map/imperial-map')}
                alt={map.sourceName}
                className="h-full w-full scale-[1.03] object-contain saturate-[0.98] contrast-[1.07] brightness-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,12,18,0.05),rgba(8,12,18,0.18))]" />

              <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} className="pointer-events-none absolute inset-0 h-full w-full">
                <defs>
                  <linearGradient id="routeGlow" x1="0%" x2="100%" y1="0%" y2="0%">
                    <stop offset="0%" stopColor="#f4d7a4" />
                    <stop offset="45%" stopColor="#d6a85c" />
                    <stop offset="100%" stopColor="#90bfe0" />
                  </linearGradient>
                </defs>

                {routePath && (
                  <>
                    <path d={routePath} fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="18" strokeLinecap="round" strokeLinejoin="round" />
                    <path d={routePath} fill="none" stroke="url(#routeGlow)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" opacity="0.96" />
                  </>
                )}

                {routeStops.map((stop) => (
                  <g key={stop.id}>
                    <circle cx={stop.poi.xRatio * MAP_WIDTH} cy={stop.poi.yRatio * MAP_HEIGHT} r="18" fill="#f0d8a8" opacity="0.96" />
                    <text x={stop.poi.xRatio * MAP_WIDTH} y={stop.poi.yRatio * MAP_HEIGHT + 5} textAnchor="middle" fontSize="11" fontWeight="700" fill="#08111b">
                      {stop.stopOrder}
                    </text>
                  </g>
                ))}
              </svg>

              <AnimatePresence>
                {hotspotsVisible &&
                  filtered.map((poi) => (
                    <motion.button
                      key={poi.id}
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      whileHover={{ scale: 1.06, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => onSelectPoi(poi.slug)}
                      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${poi.xRatio * 100}%`, top: `${poi.yRatio * 100}%` }}
                    >
                      <div className="marker-ring" />
                      <div className="marker-core">
                        <span className="marker-dot" />
                        <span className="marker-label">{poi.title}</span>
                      </div>
                    </motion.button>
                  ))}
              </AnimatePresence>
            </div>
          </TransformComponent>
        </div>
      )}
    </TransformWrapper>
  )
}

function ActionButton({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="glass-panel flex items-center gap-3 rounded-full px-4 py-3 text-sm text-stone-100 transition hover:border-amber-200/30 hover:bg-white/10">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-200/12 text-amber-100">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </button>
  )
}
