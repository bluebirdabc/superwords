<!-- src/views/TestingView.vue -->
<template>
  <div class="question-content">
    <!-- ① 加载中 -->
    <div v-if="isLoading">
      <p>正在加载题包，请稍候...</p>
    </div>

    <!-- ② 发生错误 -->
    <div v-else-if="loadError" class="error-container">
      <p style="color:red">⚠️ 加载题目失败！</p>
      <p style="font-size:.9em;color:#666">错误信息：{{ loadError }}</p>
      <button @click="fetchPacketData" style="margin-top:20px">点击重试</button>
    </div>

    <!-- ③ 正常做题 -->
    <div v-else-if="currentQuestion" class="question-container">
      <div class="progress-bar">
        题目 {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}
      </div>

      <!-- 动态渲染题型组件 -->
      <component
        :is="currentQuestionComponent"
        :key="currentQuestion.questionId"
        :question="currentQuestion"
        @submit-answer="handleAnswerSubmit"
        @update-submit-status="payload => emit('update-submit-status', payload)"
      />
    </div>

    <!-- ④ 全部完成 -->
    <div v-else>
      <p>您已完成所有题目！正在为您生成报告...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { useRouter }       from 'vue-router'
import { getQuestionPacket } from '@/api/mock-packet.js'

const emit   = defineEmits(['update-submit-status'])
const router = useRouter()

/* --------------------------------------------------
 * ① 动态导入题型组件
 * -------------------------------------------------- */
/** 根据题型 ID（如 'YY06'）返回对应异步组件 */
function resolveQuestionComponent(typeId) {
  try {
    return defineAsyncComponent(() => 
      import(`../components/questions/Question${typeId}.vue`)
    )
  } catch (error) {
    console.warn(`题型 ${typeId} 组件加载失败:`, error)
    return { template: `<p style="color:red">题型 ${typeId} 尚未支持</p>` }
  }
}

/* --------------------------------------------------
 * ② 题包 / 流程状态
 * -------------------------------------------------- */
const isLoading            = ref(true)
const loadError            = ref(null)
const questionPacket       = ref(null)
const currentQuestionIndex = ref(0)
const userAnswers          = ref([])

const totalQuestions = computed(
  () => questionPacket.value?.questions.length || 0
)

const currentQuestion = computed(() => {
  if (!questionPacket.value) return null
  return questionPacket.value.questions[currentQuestionIndex.value] || null
})

const currentQuestionComponent = computed(() => {
  if (!currentQuestion.value) return null
  return resolveQuestionComponent(
    currentQuestion.value.typeId.toUpperCase()   // e.g. 'YY06'
  )
})

/* ---- 拉题包 ---- */
async function fetchPacketData() {
  isLoading.value = true
  loadError.value = null
  try {
    const packet = await getQuestionPacket()
    if (!packet?.questions?.length) {
      throw new Error('题包数据为空或格式不正确')
    }
    questionPacket.value = packet
  } catch (err) {
    loadError.value = err.message
  } finally {
    isLoading.value = false
  }
}

/* ---- 提交答案 / 下一题 ---- */
function handleAnswerSubmit(answerData) {
  userAnswers.value.push({
    questionId: currentQuestion.value.questionId,
    ...answerData
  })
  if (currentQuestionIndex.value < totalQuestions.value - 1) {
    currentQuestionIndex.value++
  } else {
    endTest()
  }
}

/* ---- 结束 ---- */
function endTest() {
  console.log('测试结束，答案：', userAnswers.value)
  router.push('/result')
}

/* ---- 离开页面提示 ---- */
function handleBeforeUnload(e) {
  e.returnValue = '您确定要离开吗？测试进度将会丢失。'
  return e.returnValue
}

/* ---- 生命周期 ---- */
onMounted(() => {
  fetchPacketData()
  window.addEventListener('beforeunload', handleBeforeUnload)
})
onUnmounted(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<style scoped>
.question-container,
.error-container {
  width: 100%;
}
.progress-bar {
  width: 100%;
  text-align: right;
  color: #888;
  font-size: 0.9rem;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
}
</style>
