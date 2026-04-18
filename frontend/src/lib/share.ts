type ShareResult = 'native' | 'copied' | 'manual'

const copyText = async (value: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', 'true')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  document.execCommand('copy')
  document.body.removeChild(textarea)
}

export async function sharePage(options: { title: string; text: string; url?: string }): Promise<ShareResult> {
  const shareUrl = options.url || window.location.href

  if (navigator.share) {
    try {
      await navigator.share({
        title: options.title,
        text: options.text,
        url: shareUrl,
      })
      return 'native'
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw error
      }
    }
  }

  try {
    await copyText(shareUrl)
    return 'copied'
  } catch {
    window.prompt('请手动复制以下链接进行分享：', shareUrl)
    return 'manual'
  }
}
