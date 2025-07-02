<!-- src/components/GlobalHeader.vue -->
<template>
  <div class="global-header">
    <!-- 头像按钮 -->
    <div class="header-avatar" @click="toggleMenu">
      <img :src="avatarIcon" alt="user" />
    </div>
    <!-- 弹窗菜单 -->
    <transition name="fade">
      <div v-if="menuOpen" class="header-menu" @click.self="closeMenu">
        <div class="menu-content">
          <template v-if="!isLoggedIn">
            <button class="menu-btn" @click="showLogin">登录</button>
            <button class="menu-btn" @click="showRegister">注册</button>
          </template>
          <template v-else>
            <div class="user-info">
              <div class="user-name">
                <span>{{ displayName }}</span>
              </div>
            </div>
            <button class="menu-btn" @click="logout">退出登录</button>
          </template>
          <div class="menu-divider"></div>
          <button class="menu-btn" @click="switchLang">
            <span class="lang-icon"></span>{{ langLabel }}
          </button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useUiStore }   from '@/store/ui'
import { useAuthStore } from '@/services/auth'

const ui = useUiStore()
const auth = useAuthStore()
const menuOpen = ref(false)

const avatarIcon = 'https://static.bluebirdabc.com/ai-agent/img/tasks/fd9a61b7fd669ef8586e8d7ae2915dd5fb8c89b4.png'

const isLoggedIn = computed(() => !!auth.token)
const displayName = computed(() =>
  auth.nickname ||
  auth.userId ||
  '未登录'
)

const langLabel = computed(() => ui.lang === 'en' ? 'English' : '中文')

function toggleMenu() { menuOpen.value = !menuOpen.value }
function closeMenu()  { menuOpen.value = false }
function showLogin()    { ui.showAuthDialog('login');    closeMenu() }
function showRegister() { ui.showAuthDialog('register'); closeMenu() }
function switchLang()   { ui.setLang(ui.lang === 'en' ? 'zh-CN' : 'en'); closeMenu() }
function logout() {
  auth.logout?.()
  window.location.href = '/'
  closeMenu()
}
function handleClickOutside(e) {
  const menu   = document.querySelector('.header-menu')
  const avatar = document.querySelector('.header-avatar')
  if (menuOpen.value && !menu?.contains(e.target) && !avatar?.contains(e.target)) {
    closeMenu()
  }
}
onMounted(() => window.addEventListener('mousedown', handleClickOutside))
onBeforeUnmount(() => window.removeEventListener('mousedown', handleClickOutside))
</script>

<style scoped>
.global-header {
  position: absolute;
  top: 18px; right: 26px;
  z-index: 100;
  user-select: none;
}
.header-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  background: #f4f8fb;
  box-shadow: 0 2px 10px #0001;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  overflow: hidden;
  border: 1.5px solid #eee;
  transition: box-shadow .2s;
}
.header-avatar img {
  width: 60%; height: 60%;
  object-fit: contain;
  pointer-events: none;
}
.header-avatar:hover { box-shadow: 0 4px 20px #0002; }

.header-menu {
  position: absolute;
  right: 0;
  top: 54px;
  min-width: 148px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px #0003;
  padding: 10px 0 6px 0;
  z-index: 1000;
}
.menu-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  padding: 6px 18px 6px 18px;
}
.menu-btn {
  appearance: none;
  background: #f5f7fa;
  border: none;
  outline: none;
  border-radius: 9px;
  margin: 0 0 2px 0;
  padding: 9px 0;
  font-size: 1.08rem;
  font-family: inherit;
  color: #222;
  cursor: pointer;
  transition: background .18s;
}
.menu-btn:hover { background: #e6f0ff; }
.menu-divider {
  height: 1px;
  background: #eef0f5;
  margin: 7px 0;
  border-radius: 2px;
}
.user-info {
  text-align: center;
  padding: 4px 0 2px 0;
}
.user-name {
  font-size: 1.04em;
  color: #2a2a2a;
  margin-bottom: 3px;
  font-weight: bold;
  word-break: break-all;
}
.lang-icon {
  display: inline-block;
  vertical-align: -3px;
  margin-right: 7px;
  width: 20px; height: 20px;
  background: url('https://static.bluebirdabc.com/ai-agent/img/tasks/a3028eb8b4a6021cb80e0d55e2cf273056df8f69.png') no-repeat center/contain;
}
.fade-enter-active, .fade-leave-active { transition: opacity .19s; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
