// src/store/ui.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  // 登录弹窗
  const authDialogVisible = ref(false)
  const authDialogMode = ref('login') // 'login' or 'register'

  // 登录状态
  const isLoggedIn = ref(false)
  const userInfo = ref(null)

  // 设置登录信息
  function setLoginInfo(data) {
    isLoggedIn.value = true
    userInfo.value = data
  }

  // 语言
  const lang = ref('zh-CN')

  // 打开弹窗
  function showAuthDialog(mode = 'login') {
    authDialogMode.value = mode
    authDialogVisible.value = true
  }

  // 关闭弹窗
  function closeAuthDialog() {
    authDialogVisible.value = false
  }

  // 切换语言
  function setLang(newLang) {
    lang.value = newLang
    // 可以在这里做 i18n 切换逻辑
  }

  return {
    authDialogVisible,
    authDialogMode,
    isLoggedIn,
    userInfo,
    lang,
    showAuthDialog,
    closeAuthDialog,
    setLang,
    setLoginInfo
  }
})
