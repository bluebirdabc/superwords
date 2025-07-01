// src/services/recorder.js
import { useTestStore } from '@/store/test'

/* ------------------------------------------------------------------
 * ✨ 统一录音服务（低延迟 + iOS 兼容）
 * ------------------------------------------------------------------
 * 1. 只要 MediaStream 仍然 “live” 就复用 —— 避免二次 getUserMedia 的
 *    200–400 ms 延迟（尤其移动端）
 * 2. 每次 start 都重新 new MediaRecorder —— 杜绝状态残留
 * 3. mimeType 选择顺序：audio/mp4 › webm › ogg
 * 4. 可选：对 WebM 追加 ≈0.1 s 静音帧，解决旧 iOS 解码尾帧丢失
 * ----------------------------------------------------------------*/

const APPEND_SILENCE = true           // ← 如不想补静音可改 false

export const RecorderService = {
  /* 内部状态 ---------------------------------------------------- */
  _recorder  : null,   // 当前 MediaRecorder
  _chunks    : [],     // 录音数据块
  _stream    : null,   // 复用的麦克风流
  isRecording: false,  // 录音中？

  /* 确保拿到一条 “live” 的 MediaStream */
  async _ensureStream () {
    const store = useTestStore()

    /** 1) 首次 / 2) 被系统挂起 / 3) track 已 end → 重新 getUserMedia */
    if (
      !this._stream ||
      this._stream.active === false ||
      this._stream.getAudioTracks().some(t => t.readyState !== 'live')
    ) {
      await store.ensureMicAccess()
      this._stream = store.micStream
    }
    return this._stream
  },

  /* 创建新的 MediaRecorder（每次 start 都调用） */
  async _createRecorder () {
    const stream = await this._ensureStream()

    const mime =
      [
        'audio/mp4',
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus'
      ].find(t => MediaRecorder.isTypeSupported(t)) || undefined

    this._recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : {})
    this._chunks   = []
    this._recorder.ondataavailable = e => e.data.size && this._chunks.push(e.data)
  },

  /* ------------------------------------------------------------ */
  /* 公开 API                                                     */
  /* ------------------------------------------------------------ */

  /** 开始录音 */
  async start () {
    if (this.isRecording) {
      console.warn('[Recorder] already recording')
      return
    }
    await this._createRecorder()
    this._recorder.start()
    this.isRecording = true
  },

  /** 停止录音并返回 { blob, url, type } */
  stop () {
    return new Promise((resolve, reject) => {
      if (!this.isRecording || !this._recorder) return resolve(null)

      /* onstop / onerror 必须用箭头函数，保持 this 指向 RecorderService */
      this._recorder.onstop = () => {
        let blob = new Blob(this._chunks, { type: this._recorder.mimeType })

        /* —— 兼容：旧 iOS 对 WebM 尾帧解析严格 —— */
        if (APPEND_SILENCE && blob.type.startsWith('audio/webm')) {
          // 48 kHz * 0.1 s ≈ 4800 samples（单声道 8-bit 无符号）
          const silence = new Blob([new Uint8Array(4800).buffer], { type: blob.type })
          blob = new Blob([blob, silence], { type: blob.type })
        }

        /* 重置内部状态 */
        this.isRecording = false
        this._recorder   = null
        this._chunks     = []

        resolve({
          blob,
          url : URL.createObjectURL(blob),
          type: blob.type
        })
      }

      this._recorder.onerror = evt => {
        this._recorder.onerror = null
        reject(evt.error)
      }

      this._recorder.stop()
    })
  }
}
