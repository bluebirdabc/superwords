// src/composables/useEnhancedInputs.js
import { onMounted, ref, nextTick } from 'vue'

/** 每次按键播放的小音效 */
const keypressAudio = new Audio(
  'https://static.bluebirdabc.com/lesson/material/aif8j9q38t4q78y4/855/2d0492b05a34262d51165791cff5692301906b9c.mp3'
)
keypressAudio.preload = 'auto'

/**
 * 让若干单字符 <input> 的体验更丝滑
 * @param {Ref<string[]>} userAnswer  —— 响应式数组，用来存用户的输入
 * @param {Ref<boolean>}  isComposing —— 拼音输入法正在组合？
 */
export function useEnhancedInputs (userAnswer, isComposing) {
  const inputsWrapperRef = ref(null)

  /* ------- 自动聚焦第一个输入框（移动端唤起键盘） ------- */
  onMounted(() => {
    nextTick(() => {
      const first = inputsWrapperRef.value?.children[0]
      if (first) {
        first.focus()
        first.click()            // iOS 需要一次“真实点击”才会弹出软键盘
      }
    })
  })

  /* ------- 工具函数 ------- */
  const playKeySound = () => {
    keypressAudio.currentTime = 0
    keypressAudio.play().catch(() => {})
  }

  /** 输入一个字符后：1) 只保留首字符；2) 跳到下一个框 */
  function handleInput (idx, total, e) {
    isComposing.value = false
    playKeySound()

    const val = e.target.value.charAt(0) || ''
    e.target.value         = val
    userAnswer.value[idx]  = val

    // 清掉后面框里的旧字符
    if (idx < total - 1) {
      const nextInput = inputsWrapperRef.value.children[idx + 1]
      nextInput.value           = ''
      userAnswer.value[idx + 1] = ''
    }

    // 跳到下一个输入框
    if (val && idx < total - 1) {
      inputsWrapperRef.value.children[idx + 1].focus()
    }
  }

  /** 退格：当前为空时，跳回上一个框 */
  function handleBackspace (idx, e) {
    if (e.target.value === '' && idx > 0) {
      inputsWrapperRef.value.children[idx - 1].focus()
    }
  }

  return {
    inputsWrapperRef,
    handleInput,
    handleBackspace
  }
}
