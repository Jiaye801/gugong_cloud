import { CheckCircle2, LockKeyhole, ScrollText, UploadCloud } from 'lucide-react'

import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore } from '../store/useAppStore'

export function QuestsPage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const completeQuestStep = useAppStore((state) => state.completeQuestStep)

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-300">{error ?? '正在装载任务卷轴...'}</div>
  }

  const profile = data.profile

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
      <section className="space-y-4">
        {data.quests.map((quest) => {
          const progress = profile?.questProgress.find((item) => item.questId === quest.id)
          return (
            <div key={quest.id} className="glass-panel rounded-[32px] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">{quest.chapter}</div>
                  <h2 className="mt-2 font-serif text-3xl text-stone-50">{quest.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-400">{quest.summary}</p>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-white/[0.04] px-4 py-3 text-sm text-stone-200">奖励：{quest.rewardStamp}</div>
              </div>

              <div className="mt-5 grid gap-3">
                {quest.steps.map((step) => {
                  const done = profile?.questStepProgress.some((item) => item.questStepId === step.id && item.isCompleted) ?? false
                  return (
                    <div key={step.id} className={`rounded-[28px] border p-4 ${done ? 'border-emerald-300/25 bg-emerald-300/6' : 'border-white/8 bg-white/[0.03]'}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-sm text-stone-300">
                            {step.stepType.includes('UPLOAD') ? <UploadCloud className="h-4 w-4 text-amber-200" /> : <ScrollText className="h-4 w-4 text-amber-200" />}
                            步骤 {step.stepOrder}
                          </div>
                          <div className="mt-2 text-lg text-stone-100">{step.title}</div>
                          <div className="mt-2 text-sm text-stone-400">{step.description}</div>
                        </div>
                        <button
                          onClick={() => void completeQuestStep(quest.id, step.id)}
                          className={`rounded-2xl px-4 py-3 text-sm ${done ? 'bg-emerald-300/15 text-emerald-200' : 'bg-amber-200/12 text-amber-100'}`}
                        >
                          {done ? '已完成' : '完成步骤'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-200 to-[#b8893a]" style={{ width: `${((progress?.completedSteps ?? 0) / quest.steps.length) * 100}%` }} />
              </div>
            </div>
          )
        })}
      </section>

      <aside className="glass-panel rounded-[32px] p-5">
        <div className="text-xs uppercase tracking-[0.32em] text-amber-100/60">成就档案</div>
        <h2 className="mt-2 font-serif text-2xl text-stone-50">解锁条件与奖励</h2>
        <div className="mt-5 space-y-3">
          {data.quests.map((quest) => (
            <div key={quest.id} className="rounded-[24px] border border-white/8 bg-white/[0.04] p-4">
              <div className="flex items-center gap-2 text-amber-100">
                <CheckCircle2 className="h-4 w-4" />
                {quest.rewardStamp}
              </div>
              <div className="mt-2 text-sm text-stone-100">{quest.rewardBadge?.name}</div>
              <div className="mt-2 text-xs leading-5 text-stone-400">
                <LockKeyhole className="mr-2 inline h-3.5 w-3.5" />
                {quest.unlockCondition}
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}
