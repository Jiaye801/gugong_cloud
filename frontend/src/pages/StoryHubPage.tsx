import { BookMarked, Clock3, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { resolveMediaUrl } from '../lib/api'
import { canSpeak, speakText, stopSpeech } from '../lib/speech'
import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore } from '../store/useAppStore'

export function StoryHubPage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const addToast = useAppStore((state) => state.addToast)
  const [speakingId, setSpeakingId] = useState<number | null>(null)

  useEffect(() => () => stopSpeech(), [])

  const poiMap = useMemo(() => new Map(data?.pois.map((poi) => [poi.id, poi]) ?? []), [data])
  const reflections = data?.reflections ?? []

  const groups = useMemo(
    () =>
      Object.entries(
        reflections.reduce<Record<string, typeof reflections>>((acc, reflection) => {
          const region = poiMap.get(reflection.poiId)?.region ?? '未分区'
          acc[region] = acc[region] || []
          acc[region].push(reflection)
          return acc
        }, {}),
      ),
    [poiMap, reflections],
  )

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-200">{error ?? '正在加载故事汇...'}</div>
  }

  const handleSpeak = (storyId: number, text: string) => {
    if (!canSpeak()) {
      addToast('当前浏览器暂不支持语音朗读')
      return
    }

    if (speakingId === storyId) {
      stopSpeech()
      setSpeakingId(null)
      return
    }

    speakText({
      text,
      onStart: () => setSpeakingId(storyId),
      onEnd: () => setSpeakingId(null),
      onError: () => {
        setSpeakingId(null)
        addToast('语音朗读未能启动')
      },
    })
  }

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-[36px] p-8 md:p-10">
        <div className="text-xs uppercase tracking-[0.32em] text-amber-100/70">故事汇</div>
        <h1 className="mt-3 font-serif text-4xl text-stone-50 md:text-5xl">和场馆一起被记住的真实故事</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-stone-200/88">
          这里收录的是基于公开史料整理的点位故事卡，尽量让每一条内容都与故宫建筑、展馆或真实历史事件发生对应。你可以按区域阅读，也可以直接点开语音朗读，让地图、空间与故事合在一起被感知。
        </p>
      </section>

      {groups.map(([region, stories]) => (
        <section key={region} className="glass-panel rounded-[32px] p-6">
          <div className="flex items-center gap-2 text-stone-50">
            <BookMarked className="h-5 w-5 text-amber-200" />
            {region}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {stories.map((story) => {
              const poi = poiMap.get(story.poiId)
              const speechText = `${poi?.title ?? '点位故事'}。${story.title}。${story.content}`

              return (
                <article key={story.id} className="rounded-[28px] border border-white/8 bg-white/[0.03] p-4">
                  {story.imageUrl && <img src={resolveMediaUrl(story.imageUrl)} alt={story.title} className="h-44 w-full rounded-[22px] object-cover" />}
                  <div className="mt-4 text-lg font-medium text-stone-50">{story.title}</div>
                  <div className="mt-2 text-sm text-amber-100/75">{poi?.title ?? '场馆故事卡'}</div>
                  <div className="mt-3 text-sm leading-7 text-stone-200/88">{story.content}</div>
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-stone-300/75">
                    <span>公开史料整理 · {story.moodTag}</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock3 className="h-3.5 w-3.5" />
                      {new Date(story.createdAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <button onClick={() => handleSpeak(story.id, speechText)} className="mt-4 w-full rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-100">
                    {speakingId === story.id ? <VolumeX className="mr-2 inline h-4 w-4" /> : <Volume2 className="mr-2 inline h-4 w-4" />}
                    {speakingId === story.id ? '停止朗读' : '语音朗读'}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
