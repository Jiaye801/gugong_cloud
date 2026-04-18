import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { useEffect } from 'react'

import { useAppStore } from '../store/useAppStore'

export function ToastViewport() {
  const toasts = useAppStore((state) => state.toasts)
  const dismissToast = useAppStore((state) => state.dismissToast)

  useEffect(() => {
    if (!toasts.length) return
    const timers = toasts.map((toast) =>
      window.setTimeout(() => dismissToast(toast.id), 2800),
    )
    return () => timers.forEach((timer) => window.clearTimeout(timer))
  }, [dismissToast, toasts])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[80] flex w-80 flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 20, y: -10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="glass-panel pointer-events-auto flex items-start gap-3 rounded-3xl px-4 py-3"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-200" />
            <div>
              <div className="text-sm font-medium text-stone-100">{toast.title}</div>
              {toast.description && (
                <div className="mt-1 text-xs leading-5 text-stone-400">
                  {toast.description}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
