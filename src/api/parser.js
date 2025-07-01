// src/api/parser.js

/**
 * 将后端原始 Quiz 对象映射为前端组件可识别的标准化 Question 对象
 * @param {object} quiz - 后端返回的单个 quiz 对象
 * @returns {object} - 标准化的 question 对象
 */
function mapQuizToQuestion(quiz) {
  const typeId = `YY${String(quiz.quiz_type_id).padStart(2, '0')}`;

  const question = {
    questionId: quiz.quiz_id,
    typeId: typeId,
    data: {
      title: quiz.quiz_type_name || '',
    },
  };

  // --- 通用字段映射 ---
  if (quiz.quiz_body) question.data.text = quiz.quiz_body;
  if (quiz.quiz_audio) question.data.audioUrl = quiz.quiz_audio;
  if (quiz.quiz_trans) question.data.chinese_translation = quiz.quiz_trans;
  if (quiz.word) question.data.word = quiz.word;
  if (quiz.word_trans) question.data.word_translation = quiz.word_trans;

  // --- 选项映射 ---
  if (Array.isArray(quiz.quiz_option) && quiz.quiz_option.length > 0) {
    question.data.options = {};
    const optionKeys = ['A', 'B', 'C', 'D', 'E', 'F'];
    quiz.quiz_option.forEach((opt, index) => {
      const key = optionKeys[index] || `X${index + 1}`;
      question.data.options[key] = opt;
    });
  }

  // --- 答案映射 ---
  if (Array.isArray(quiz.answer)) {
    if (typeId === 'YY14' || quiz.answer.length > 1) {
      question.data.answers = quiz.answer;
    } else {
      question.data.answer = quiz.answer[0];
    }
  }

  // --- 特定题型格式处理 ---
  if (typeId === 'YY10' && typeof quiz.quiz_body === 'string') {
    const parts = quiz.quiz_body.split('\n');
    question.data.promptWord = parts[0]?.trim();
    question.data.text = parts[1]?.trim();
  }

  return question;
}

/**
 * 解析后端返回的完整题包数据
 * @param {object} responseData - 后端接口返回的 data 对象
 * @returns {object} - 标准化的题包对象，含题目数组、用户信息等
 */
export function parseQuestionPacket(responseData) {
  if (!responseData) {
    throw new Error("无效的后端数据结构：responseData 为空");
  }

  let quizzes = [];

  // 新结构：优先取 scene.stages[0].quizzes
  if (responseData.scene?.stages?.[0]?.quizzes) {
    quizzes = responseData.scene.stages[0].quizzes;
  }
  // 兼容结构：备用 quizzes 字段
  else if (Array.isArray(responseData.quizzes)) {
    quizzes = responseData.quizzes;
  } else {
    throw new Error("无效的后端数据结构：找不到 quizzes 数组");
  }

  const questions = quizzes.map(mapQuizToQuestion);

  return {
    packetId: `SCENE_${responseData.index ?? 'N/A'}`,
    packetTitle:
      responseData.scene?.stages?.[0]?.title ||
      responseData.title ||
      '综合测试',
    questions: questions,
    userInfo: {
      userId: responseData.user_id || '',
      level: responseData.level || '',
      accuracy: responseData.accuracy || 0,
    },
    lastResults: responseData.results || [],
    score: responseData.score || {},
    raw: responseData, // 可选：保留完整原始响应用于回溯调试
  };
}
