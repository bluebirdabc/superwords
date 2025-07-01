<template>
  <div class="question-yy09">
    <h3 class="title">{{ question.data.title || '看图说单词' }}</h3>

    <!-- 条件渲染题目图片 -->
    <div v-if="question.data.imageUrl" class="image-container">
      <img :src="question.data.imageUrl" alt="题目图片" />
    </div>

    <p class="sentence">
      {{ sentenceParts.before }}

      {{ sentenceParts.after }}
    </p>

    <div class="options-list-display">
      <div
        v-for="(optionText, key) in question.data.options"
        :key="key"
        class="option-item-display"
      >
        <span class="option-key">{{ key }}</span>
        <span class="option-text">{{ optionText }}</span>
      </div>
    </div>

    <UnifiedRecorder @record-complete="onRecordComplete" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import UnifiedRecorder from '@/components/common/UnifiedRecorder.vue';

const props = defineProps({
  question: { type: Object, required: true },
});
const emit = defineEmits(['submit-answer', 'update-submit-status']);

const sentenceParts = computed(() => {
  const parts = props.question.data.text.split('()');
  return {
    before: parts[0] || '',
    after: parts[1] || '',
  };
});

const recordedBlob = ref(null);

const onRecordComplete = (blob) => {
  recordedBlob.value = blob;
};

const isSubmitDisabled = computed(() => recordedBlob.value === null);

const submit = () => {
  emit('submit-answer', {
    type: 'YY09',
    answer: {
      recording: recordedBlob.value,
    },
  });
};

watch(
  isSubmitDisabled,
  (newVal) => {
    emit('update-submit-status', {
      disabled: newVal,
      action: submit,
    });
  },
  { immediate: true }
);
</script>

<style scoped>
.question-yy09 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  text-align: center;
}

.image-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
}

.image-container img {
  width: 100%;
  height: auto;
  object-fit: contain;
}

.sentence {
  font-size: 1.8rem;
  text-align: flex-start; 
  line-height: 1.6;
  font-weight: bold;
}

.placeholder {
  display: inline-block;
  border-bottom: 2px solid #333;
  width: 100px;
  vertical-align: bottom;
  margin: 0 8px;
}

.options-list-display {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* ✅ 靠左对齐 */
  gap: 10px;
  padding: 10px 20px;
  background-color: #fafafa;
  border-radius: 8px;
}

.option-item-display {
  display: flex;
  align-items: flex-start;
  font-size: 1.1rem;
}

.option-key {
  font-weight: bold;
  margin-right: 8px;
  color: #888;
}
</style>
