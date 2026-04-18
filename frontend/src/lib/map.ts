import type { RouteStop } from './types'

export const MAP_WIDTH = 1180
export const MAP_HEIGHT = 2027

const pointForStop = (stop: RouteStop) => ({
  x: stop.poi.xRatio * MAP_WIDTH,
  y: stop.poi.yRatio * MAP_HEIGHT,
})

export const buildRoutePath = (stops: RouteStop[]) => {
  if (!stops.length) return ''
  if (stops.length === 1) {
    const { x, y } = pointForStop(stops[0])
    return `M ${x} ${y}`
  }

  const points = stops.map(pointForStop)
  let path = `M ${points[0].x} ${points[0].y}`

  for (let index = 1; index < points.length; index += 1) {
    const prev = points[index - 1]
    const current = points[index]
    const cx1 = prev.x + (current.x - prev.x) * 0.45
    const cy1 = prev.y
    const cx2 = prev.x + (current.x - prev.x) * 0.55
    const cy2 = current.y
    path += ` C ${cx1} ${cy1} ${cx2} ${cy2} ${current.x} ${current.y}`
  }

  return path
}
