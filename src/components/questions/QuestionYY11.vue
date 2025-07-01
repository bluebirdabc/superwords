<template>
  <div class="question-yy11">
    <h3>{{ question.data.title || '词根词缀词变化' }}</h3>

    <div class="prompt-container">
      <p class="sentence">
        <span>{{ promptParts.before }}</span>
        <span class="hint">({{ promptParts.hint }})</span>
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
  const text = props.question.data.text || '';
  const hintMatch = text.match(/\((.*?)\)/);
  const hint = hintMatch ? hintMatch[1] : '';
  const sentenceWithoutHint = text.replace(/\(.*?\)/, '______');
  const parts = sentenceWithoutHint.split('______');
  
  return {
    before: parts[0] || '',
    hint: hint,
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
    type: 'YY11',
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
.question-yy11 {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
}
.prompt-container {
  width: 100%;
  padding: 20px;
}
.sentence {
  font-size: 1.5rem;
  line-height: 1.8;
  text-align: flex-start; 
}
.hint {
  color: var(--secondary-color);
  font-style: italic;
  font-weight: bold;
  border-bottom: 2px solid #000;
  padding: 0 5px 2px 5px;
  margin: 0 5px;
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