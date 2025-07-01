/* ----------------------------------------------------------
 * util: 以“独立 <audio> 元素”播放一段音频
 *
 * • blob   —— 录音 Blob / 远程 fetch 得到的 Blob
 * • dataURL——远程 mp3/ogg 的 data-URL 字符串
 *
 * ⚠  在 iOS-WeChat、部分低版本 Safari 上，
 *    blob:URL 有时会触发 “GET <audio> error (blob: …)”
 *    因此这里统一转成 dataURL，再赋给 <audio>.src，
 *    彻底绕过 blob:URL & CORS 兼容性问题。
 * ---------------------------------------------------------- */
export async function playWithNewElement(blobOrUrl) {
  /* ---------- 把任何输入都转换成 dataURL ---------- */
  const dataURL = typeof blobOrUrl === 'string'
    ? blobOrUrl                       // 已经是 http(s)/dataURL
    : await new Promise(res => {
        const fr = new FileReader()
        fr.onload = () => res(fr.result)
        fr.readAsDataURL(blobOrUrl)    // Blob → base64 dataURL
      })

  /* ---------- 创建一次性 <audio> 元素 ---------- */
  const el = document.createElement('audio')
  el.src    = dataURL
  el.volume = 1
  el.play().catch(() => { /* 首次用户交互 Promise 拒绝可忽略 */ })

  /* 播放完自动移除，释放 DOM */
  el.onended = () => el.remove()

  /* 若调用方需要，可手动 pause / stop / volume ... */
  return el
}
