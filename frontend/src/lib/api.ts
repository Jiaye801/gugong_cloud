import axios from 'axios'

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://127.0.0.1:5000'
const AUTH_TOKEN_KEY = 'palace-auth-token'

const encodeSvg = (svg: string) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.replace(/\n+/g, '').trim())}`

const generatedSvg = (key: string) => {
  const last = key.split('/').pop() ?? key
  const numMatch = last.match(/(\d+)/)
  const num = Number(numMatch?.[1] ?? 1)
  const palette = ['#7b1e1e', '#5b3b1c', '#153147', '#254235', '#4a245b', '#3a2d18']
  const fill = palette[(num - 1) % palette.length]

  if (key.includes('map/imperial-map')) {
    return encodeSvg(`
      <svg width="1180" height="2027" viewBox="0 0 1180 2027" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#112132"/>
            <stop offset="100%" stop-color="#0a131e"/>
          </linearGradient>
        </defs>
        <rect width="1180" height="2027" fill="url(#bg)"/>
        <rect x="110" y="90" width="960" height="1840" rx="36" fill="#0f1926" stroke="#d7b878" stroke-width="2"/>
        <path d="M590 1900 L590 1660 L590 1560 L590 1378 L590 1277 L590 1176 L590 1014 L590 912 L590 831 L590 750 L590 568 L590 264" stroke="#d7b878" stroke-width="42" stroke-linecap="round" opacity="0.7"/>
      </svg>
    `)
  }

  if (key.includes('/avatars/')) {
    const accent = key.includes('admin') ? '#8db7d8' : '#d7b878'
    return encodeSvg(`
      <svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" rx="96" fill="#132030"/>
        <circle cx="256" cy="190" r="84" fill="#f0d9a5"/>
        <path d="M116 430 C146 344 224 308 256 308 C288 308 366 344 396 430" fill="${accent}"/>
      </svg>
    `)
  }

  if (key.includes('/badges/')) {
    return encodeSvg(`
      <svg width="320" height="320" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="320" rx="64" fill="#121b26"/>
        <circle cx="160" cy="160" r="90" fill="#d7b878" opacity="0.22"/>
        <path d="M160 52 L184 118 L252 118 L198 160 L218 228 L160 188 L102 228 L122 160 L68 118 L136 118 Z" fill="#f7e1b6"/>
      </svg>
    `)
  }

  return encodeSvg(`
    <svg width="1200" height="800" viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${fill}"/>
          <stop offset="100%" stop-color="#0b1420"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" rx="48" fill="url(#g)"/>
      <rect x="90" y="120" width="1020" height="560" rx="28" fill="rgba(255,255,255,0.04)" stroke="#d7b878" stroke-width="2"/>
      <path d="M160 580 C260 380 440 220 610 220 C780 220 960 360 1040 580" fill="none" stroke="#f1d8a8" stroke-width="18" opacity="0.9"/>
      <path d="M300 580 L300 420 L600 300 L900 420 L900 580" fill="rgba(255,255,255,0.08)" stroke="#f1d8a8" stroke-width="6"/>
    </svg>
  `)
}

export const getAuthToken = () => {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(AUTH_TOKEN_KEY)
}

export const setAuthToken = (token: string | null) => {
  if (typeof window === 'undefined') return
  if (token) {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token)
  } else {
    window.localStorage.removeItem(AUTH_TOKEN_KEY)
  }
}

export const api = axios.create({
  baseURL: `${apiBase}/api`,
})

api.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers['X-Auth-Token'] = token
  }
  return config
})

export const resolveMediaUrl = (url?: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('generated://')) return generatedSvg(url)
  if (url.startsWith('/uploads/')) return `${apiBase}${url}`
  return url
}
