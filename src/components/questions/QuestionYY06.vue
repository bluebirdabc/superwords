<!-- src/components/questions/QuestionYY06.vue -->
<template>
  <div class="question-yy06">

    <div v-if="isLoading" class="loading-overlay">
      <p>正在加载题目…</p>
    </div>

    <div v-else-if="errorMessage" class="error-overlay">
      <p style="color:#e74c3c">{{ errorMessage }}</p>
    </div>

    <div v-else class="content-container">
      <h3 class="question-title">{{ questionData.title }}</h3>

      <p v-if="sentenceParts" class="sentence">
        {{ sentenceParts.before }}
        <span class="placeholder"></span>
        {{ sentenceParts.after }}
      </p>
      <p v-else class="sentence-empty">题干内容缺失，请检查题目配置</p>

      <div v-if="optionEntries.length" class="options-list-display">
        <div
          v-for="(entry, idx) in optionEntries"
          :key="entry[0]"
          class="option-item-display"
        >
          <span class="option-key">{{ entry[0] }}</span>
          <span class="option-text">{{ entry[1] }}</span>
        </div>
      </div>
      <p v-else class="options-empty">选项数据缺失，请检查题目配置</p>

      <UnifiedRecorder
        v-if="showRecorder"
        @record-complete="onRecordComplete"
        :disabled="!showRecorder"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import UnifiedRecorder from '@components/common/UnifiedRecorder.vue'

const props = defineProps({ question: { type: Object, required: true } })
const emit  = defineEmits(['submit-answer', 'update-submit-status'])

/* state */
const isLoading      = ref(true)
const errorMessage   = ref('')
const questionData   = ref({ title:'', text:'', options:{} })
const sentenceParts  = ref(null)
const options        = ref({})
const recordedBlob   = ref(null)
const showRecorder   = ref(false)

/* init */
try {
  if (!props.question?.data) throw new Error('题目缺少 data 字段')

  const qd = props.question.data
  questionData.value = {
    title  : qd.title   || '选择并复述',
    text   : qd.text    || '',
    options: qd.options || {}
  }
  const [before='', after=''] = questionData.value.text.split('()')
  sentenceParts.value = { before, after }
  options.value       = questionData.value.options
  showRecorder.value  = true
} catch (e) {
  errorMessage.value = e.message
} finally {
  isLoading.value = false
}

/* computed */
const optionEntries    = computed(() => Object.entries(options.value))
const isSubmitDisabled = computed(() => !recordedBlob.value)

/* handlers */
function onRecordComplete (blob) { recordedBlob.value = blob }
function submit () {
  if (!recordedBlob.value) return
  emit('submit-answer', { type:'YY06', answer:{ recording: recordedBlob.value } })
}

/* sync status */
watch(isSubmitDisabled, d => {
  emit('update-submit-status', { disabled:d, action:submit })
},{ immediate:true })
</script>

<style scoped>
.question-yy06{display:flex;flex-direction:column;gap:20px}
.loading-overlay,.error-overlay{position:fixed;inset:0;display:flex;justify-content:center;align-items:center;background:#fff9;z-index:1000}
.content-container{display:flex;flex-direction:column;gap:20px}
.question-title{font-size:1.6rem;margin:0;color:#333}
.sentence{font-size:1.4rem;line-height:1.7;margin:0}
.placeholder{display:inline-block;width:120px;border-bottom:2px solid #333;margin:0 6px}
.options-list-display{display:flex;flex-wrap:wrap;gap:14px 24px;padding:16px;background:#f8f9fa;border-radius:8px}
.option-item-display{display:flex;align-items:center;font-size:1.2rem}
.option-key{font-weight:600;margin-right:8px;color:#666}
.option-text{color:#333}
.sentence-empty,.options-empty{color:#ff4444;font-size:1.2rem;margin:0}
</style>
