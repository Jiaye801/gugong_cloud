import { Bookmark, ShoppingBag, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { resolveMediaUrl } from '../lib/api'
import { canSpeak, speakText, stopSpeech } from '../lib/speech'
import { useBootstrap } from '../lib/useBootstrap'
import { useAppStore } from '../store/useAppStore'

const cultureNotes: Record<string, string> = {
  'jiaotai-creative-hall': '交泰殿东侧文创空间适合延展“宫廷礼序如何进入当代生活”的主题，可以从纹样、器用色彩与节令节气三个角度理解故宫文创的再设计逻辑。',
  'jinghemen-kids-store': '景和门儿童体验店更适合亲子动线，重点不是简单售卖，而是把故宫色彩、瑞兽、器物故事转化成适合儿童理解的互动内容。',
  'jianting-square-store': '箭亭广场主题文创店与宁寿宫区的参观节奏贴合，适合承接珍宝馆与宫廷生活叙事，形成“看展之后再把文化记忆带走”的完整闭环。',
}

export function CreativePlazaPage() {
  const { bootstrapped, loading, error } = useBootstrap()
  const data = useAppStore((state) => state.data)
  const toggleCollection = useAppStore((state) => state.toggleCollection)
  const addToast = useAppStore((state) => state.addToast)
  const [speakingId, setSpeakingId] = useState<string | null>(null)

  useEffect(() => () => stopSpeech(), [])

  const creativePois = useMemo(() => data?.pois.filter((poi) => poi.categoryKey === 'shop') ?? [], [data])

  if (loading || !bootstrapped || !data) {
    return <div className="glass-panel rounded-[32px] p-8 text-stone-200">{error ?? '正在加载文创广场...'}</div>
  }

  const handleSpeak = (poiId: string, text: string) => {
    if (!canSpeak()) {
      addToast('当前浏览器暂不支持语音朗读')
      return
    }

    if (speakingId === poiId) {
      stopSpeech()
      setSpeakingId(null)
      return
    }

    speakText({
      text,
      onStart: () => setSpeakingId(poiId),
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.32em] text-amber-100/70">文创广场</div>
            <h1 className="mt-3 font-serif text-4xl text-stone-50 md:text-5xl">让故宫文化在日常里继续发生</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-stone-200/88">
              这里不只是购买点位，而是把观展之后的文化线索继续展开。每一个文创节点都尽量关联故宫建筑、礼序、纹样与器用传统，让“带走一件物”也对应“记住一种文化语境”。
            </p>
          </div>
          <div className="rounded-[28px] border border-amber-200/15 bg-amber-200/8 px-5 py-4 text-sm text-amber-50">
            当前文创点位 {creativePois.length} 个
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {creativePois.map((poi) => {
          const speechText = `${poi.title}。${poi.summary}。${cultureNotes[poi.slug] ?? '该点位可作为参观与文化消费之间的过渡节点，适合短暂停留和继续阅读。'}`
          return (
            <div key={poi.id} className="glass-panel overflow-hidden rounded-[32px] p-0">
              <img src={resolveMediaUrl(poi.coverImage)} alt={poi.title} className="h-56 w-full object-cover" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-medium text-stone-50">{poi.title}</div>
                    <div className="mt-1 text-sm text-stone-300/80">{poi.region}</div>
                  </div>
                  <ShoppingBag className="mt-1 h-5 w-5 shrink-0 text-amber-200" />
                </div>

                <p className="mt-4 text-sm leading-7 text-stone-200/86">{poi.summary}</p>
                <div className="mt-3 rounded-[22px] border border-amber-200/12 bg-amber-200/6 p-4 text-sm leading-7 text-amber-50/90">
                  {cultureNotes[poi.slug] ?? '这里更适合把观展情绪过渡到文化收藏，让游览从“看见”自然延伸到“带走与记住”。'}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {poi.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-stone-200/85">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button onClick={() => void toggleCollection('POI', poi.id)} className="rounded-2xl bg-gradient-to-r from-amber-300 to-[#b8893a] px-4 py-3 text-sm font-medium text-stone-950">
                    <Bookmark className="mr-2 inline h-4 w-4" />
                    加入清单
                  </button>
                  <button onClick={() => handleSpeak(poi.slug, speechText)} className="rounded-2xl border border-white/10 px-4 py-3 text-sm text-stone-100">
                    {speakingId === poi.slug ? <VolumeX className="mr-2 inline h-4 w-4" /> : <Volume2 className="mr-2 inline h-4 w-4" />}
                    {speakingId === poi.slug ? '停止朗读' : '语音朗读'}
                  </button>
                  <Link to={`/poi/${poi.slug}`} className="col-span-2 rounded-2xl border border-white/10 px-4 py-3 text-center text-sm text-stone-100">
                    查看详情
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <section className="glass-panel rounded-[32px] p-6 md:p-7">
        <div className="flex items-center gap-2 text-amber-100">
          <Sparkles className="h-5 w-5" />
          推荐专题延展
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {data.topics.map((topic) => (
            <Link key={topic.id} to={`/topics/${topic.slug}`} className="rounded-[24px] border border-white/8 bg-white/[0.03] p-4 transition hover:border-amber-200/20">
              <div className="text-lg font-medium text-stone-50">{topic.title}</div>
              <div className="mt-2 text-sm leading-6 text-stone-300/80">{topic.subtitle}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
