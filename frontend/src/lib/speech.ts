type SpeakOptions = {
  text: string
  lang?: string
  rate?: number
  pitch?: number
  volume?: number
  onStart?: () => void
  onEnd?: () => void
  onError?: () => void
}

const pickVoice = (lang: string) => {
  const voices = window.speechSynthesis.getVoices()
  return voices.find((voice) => voice.lang.toLowerCase().startsWith(lang.toLowerCase())) ?? voices.find((voice) => voice.lang.toLowerCase().includes('zh')) ?? null
}

export const canSpeak = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window

export const stopSpeech = () => {
  if (!canSpeak()) return
  window.speechSynthesis.cancel()
}

export const speakText = ({
  text,
  lang = 'zh-CN',
  rate = 1,
  pitch = 1,
  volume = 1,
  onStart,
  onEnd,
  onError,
}: SpeakOptions) => {
  if (!canSpeak()) {
    onError?.()
    return false
  }

  stopSpeech()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  utterance.pitch = pitch
  utterance.volume = volume

  const voice = pickVoice(lang)
  if (voice) {
    utterance.voice = voice
  }

  utterance.onstart = () => onStart?.()
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onError?.()

  window.speechSynthesis.speak(utterance)
  return true
}
