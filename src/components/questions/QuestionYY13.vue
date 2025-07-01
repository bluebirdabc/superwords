<template>
  <div class="question-yy13">
    <h3>{{ question.data.title || '阅读选择' }}</h3>

    <div class="prompt-container">
      <p class="sentence">
        <span>{{ promptParts.before }}</span>
        <span class="placeholder">(<span class="inner-space"></span>)</span>
        <span>{{ promptParts.after }}</span>
      </p>
    </div>

    <div class="options-list">
      <div
        v-for="(optionText, key) in question.data.options"
        :key="key"
        class="option-item"
        :class="{ selected: selectedAnswer === key }"
        @click="selectAnswer(key)"
      >
        <span class="option-key">{{ key }}</span>
        <span class="option-text">{{ optionText }}</span>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  question: { type: Object, required: true },
});
const emit = defineEmits(['submit-answer', 'update-submit-status']);

const promptParts = computed(() => {
  const parts = props.question.data.text.split(/\(\s*\)/);
  return {
    before: parts[0] || '',
    after: parts[1] || ''
  };
});

const selectedAnswer = ref(null);

const selectAnswer = (key) => {
  selectedAnswer.value = key;
};

const isSubmitDisabled = computed(() => {
  return selectedAnswer.value === null;
});

const submit = () => {
  emit('submit-answer', {
    type: 'YY13',
    answer: selectedAnswer.value,
  });
};

watch(isSubmitDisabled, (newDisabledValue) => {
  emit('update-submit-status', {
    disabled: newDisabledValue,
    action: submit
  });
}, { immediate: true });

</script>

<style scoped>
.question-yy13 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}
.prompt-container {
  width: 100%;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 25px;
}
.sentence {
  font-size: 1.5rem;
  line-height: 1.8;
  text-align: left;
}
.placeholder {
  display: inline-block;
  color: #aaa;
  font-weight: bold;
  margin: 0 5px;
  padding: 0 5px;
}
.inner-space {
  display: inline-block;
  width: 80px;
  border-bottom: 2px solid #aaa;
  vertical-align: bottom;
  margin: 0 2px;
}
.options-list {
  width: 100%;
  max-width: 600px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.option-item {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 15px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: flex-start;
  text-align: left;
}
.option-item:hover {
  border-color: var(--primary-color);
  background-color: #f0f8ff;
}
.option-item.selected {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}
.option-key {
  font-weight: bold;
  margin-right: 15px;
  border: 1px solid currentColor;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}
.option-text {
  line-height: 1.5;
}
</style>