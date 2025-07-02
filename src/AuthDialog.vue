<!-- src/components/common/AuthDialog.vue -->
<template>
  <div v-if="modelValue" class="auth-dialog-backdrop" @click.self="close">
    <div class="auth-dialog">
      <h2>{{ mode === 'login' ? '用户登录' : '注册新账号' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label>账号</label>
          <input
            v-model.trim="username"
            name="username"
            type="text"
            maxlength="32"
            autocomplete="username"
            required
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model.trim="password"
            name="password"
            type="password"
            maxlength="32"
            autocomplete="current-password"
            required
          />
        </div>
        <!-- 注册才需要昵称 -->
        <div class="form-group" v-if="mode === 'register'">
          <label>昵称</label>
          <input
            v-model.trim="nickname"
            name="nickname"
            type="text"
            maxlength="16"
            required
          />
        </div>
        <!-- 错误提示 -->
        <p class="form-error" v-if="errMsg">{{ errMsg }}</p>
        <!-- 提交按钮 -->
        <button type="submit" :disabled="submitting">
          {{ submitting ? '提交中…' : mode === 'login' ? '登录' : '注册' }}
        </button>
      </form>
      <!-- 页脚小链接 -->
      <div class="dialog-footer">
        <a v-if="mode==='login'" @click="setMode('register')">没有账号？去注册</a>
        <a v-else @click="setMode('login')">已有账号？直接登录</a>
      </div>
      <span class="dialog-close" @click="close">×</span>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/auth.js'

/* ---- props/emit ---- */
const props = defineProps({
  modelValue: Boolean,
  mode: { type: String, default: 'login' }
})
const emit  = defineEmits(['update:modelValue', 'login-success'])

/* ---- 本地状态 ---- */
const mode        = ref(props.mode)
const username    = ref('')
const password    = ref('')
const nickname    = ref('')
const submitting  = ref(false)
const errMsg      = ref('')

/* ---- Store ---- */
const auth = useAuthStore()

/* ---- 方法 ---- */
function close () {
  emit('update:modelValue', false)
  resetFields()
}
function resetFields () {
  mode.value      = props.mode || 'login'
  username.value  = ''
  password.value  = ''
  nickname.value  = ''
  errMsg.value    = ''
  submitting.value= false
}
function setMode(val) {
  mode.value = val
  errMsg.value = ''
  password.value = ''
}
async function handleSubmit () {
  if (!username.value || !password.value || (mode.value==='register' && !nickname.value)) {
    errMsg.value = '请填写所有必填项'
    return
  }
  submitting.value = true
  errMsg.value     = ''
  try {
    if (mode.value === 'login') {
      await auth.login({ username: username.value, password: password.value })
    } else {
      await auth.register({
        username: username.value,
        password: password.value,
        nickname: nickname.value
      })
    }
    emit('login-success')
    close()
  } catch (e) {
    errMsg.value = e.message || '操作失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

/* ---- ESC 关闭 ---- */
function onKeydown (e) {
  if (props.modelValue && e.key === 'Escape') close()
}
onMounted      (() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
watch(() => props.modelValue, val => { if (val) resetFields() })
watch(() => props.mode, (val) => { if (props.modelValue) setMode(val) })
</script>

<style scoped>
.auth-dialog-backdrop{
  position:fixed;inset:0;z-index:10000;
  background:rgba(0,0,0,.28);
  display:flex;align-items:center;justify-content:center;
}
.auth-dialog{
  background:#fff;border-radius:16px;min-width:340px;
  padding:36px 32px 24px;box-shadow:0 8px 36px #0002;
  position:relative;animation:fade .32s;
}
@keyframes fade{from{transform:scale(.9);opacity:0}}
h2{margin:0 0 20px;text-align:center;font-size:1.35rem;color:#333}
.form-group{margin-bottom:18px}
.form-group label{font-size:1rem;color:#555;margin-bottom:4px;display:block}
.form-group input{
  width:100%;font-size:1rem;padding:8px 10px;border:1px solid #ccc;
  border-radius:6px;box-sizing:border-box;margin-top:2px
}
.form-group input:focus{border-color:#69f;outline:none}
.form-error{color:#e74c3c;font-size:.95em;margin-bottom:10px;text-align:center}
button[type=submit]{
  width:100%;padding:11px 0;font-size:1.1rem;border:none;
  background:#3772ff;color:#fff;border-radius:7px;cursor:pointer;
  margin-top:8px;font-weight:bold;transition:background .18s
}
button[disabled]{background:#b2c9ee;cursor:not-allowed}
.dialog-footer{margin-top:14px;text-align:center}
.dialog-footer a{color:#3772ff;font-size:.98em;cursor:pointer;text-decoration:underline;margin:0 8px}
.dialog-close{
  position:absolute;right:18px;top:14px;font-size:1.5em;color:#aaa;
  cursor:pointer;user-select:none;transition:color .17s
}
.dialog-close:hover{color:#e74c3c}
</style>
