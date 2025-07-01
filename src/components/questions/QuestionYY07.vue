<!-- src/components/questions/QuestionYY07.vue -->
<template>
  <div class="question-yy07">
    <h3>{{ question.data.title || '理解并口述' }}</h3>

    <!-- 题干：原句 + 提问句，保留换行 -->
    <p class="stem" v-html="formattedText"></p>

    <!-- 选项 -->
    <div class="options-list">
      <div
        v-for="(optionText, key) in question.data.options"
        :key="key"
        class="option-item"
      >
        <span class="option-key">{{ key }}</span>
        <span class="option-text">{{ optionText }}</span>
      </div>
    </div>

    <!-- 统一录音组件 -->
    <UnifiedRecorder @record-complete="onRecordComplete" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import UnifiedRecorder from '@/components/common/UnifiedRecorder.vue'

/* ---------- props / emits ---------- */
const props = defineProps({ question: { type: Object, required: true } })
const emit  = defineEmits(['submit-answer', 'update-submit-status'])

/* ---------- 题干处理：把 \n 换成 <br> ---------- */
const formattedText = computed(() =>
  (props.question.data.text || '').replace(/\n/g, '<br>')
)

/* ---------- 录音提交 ---------- */
const recordedBlob = ref(null)
function onRecordComplete (blob) { recordedBlob.value = blob }

const isSubmitDisabled = computed(() => recordedBlob.value === null)
function submit () {
  emit('submit-answer', { type: 'YY07', answer: { recording: recordedBlob.value } })
}
watch(isSubmitDisabled, disabled => {
  emit('update-submit-status', { disabled, action: submit })
}, { immediate: true })
</script>

<style scoped>
.question-yy07 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

/* -------- 题干 -------- */
.stem {
  font-size: 1.6rem;
  line-height: 1.7;
  text-align: left;
  word-break: normal;     /* 不拆单词 */
  overflow-wrap: break-word;
  white-space: pre-wrap;  /* 保留换行 */
}

/* -------- 选项 -------- */
.options-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.option-item {
  display: flex;
  align-items: center;
  font-size: 1.1rem;
}

.option-key {
  font-weight: bold;
  margin-right: 6px;
  color: #888;
}
</style>
