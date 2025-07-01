// src/api/exam.js

import { parseQuestionPacket } from './parser'

const API_BASE = '/api' // 根据部署环境适配：开发环境可为 /api，线上环境可能是完整域名

/**
 * 获取题包：首次登录拉定级题，非首次拉常规学习题
 * @param {Object} params
 * @param {string} params.userId - 用户 ID
 * @param {boolean} params.isFirstLogin - 是否首次登录（level 为 0）
 * @param {string} [params.level] - 当前等级（非首次登录需提供）
 * @returns {Promise<object>} - 返回标准化题包对象（packetId, questions, userInfo等）
 */
export async function fetchQuestionPacket({ userId, isFirstLogin, level }) {
  try {
    let url = ''
    const payload = { userId }

    if (isFirstLogin) {
      // 拉定级测试
      url = `${API_BASE}/placement-pack`
    } else {
      // 拉普通题包（带等级）
      url = `${API_BASE}/question-pack`
      if (level) payload.level = level
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const json = await res.json()
    if (json.code !== 0) throw new Error(json.msg || '拉取题包失败')

    return parseQuestionPacket(json.data)
  } catch (err) {
    console.error('拉题包失败:', err)
    throw err
  }
}

/**
 * 提交题包作答结果（用户答案、音频、文本等）
 * @param {Object} payload - 如：{ userId, packetId, answers: [...], audio: '', duration: 32, ... }
 * @returns {Promise<object>} - 返回后台分析结果、能力评价等
 */
export async function submitQuestionResult(payload) {
  try {
    const res = await fetch(`${API_BASE}/submit-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    const json = await res.json()
    if (json.code !== 0) throw new Error(json.msg || '提交失败')

    return json.data // 包含分析结果、错误项、雷达图数据等
  } catch (err) {
    console.error('提交题包失败:', err)
    throw err
  }
}

/**
 * 获取用户等级报告（进入结果页时展示）
 * @param {string} userId
 * @returns {Promise<object>} - 如：{ level: 'A2', accuracy: 92, score: { listening: 23, reading: 18, ... } }
 */
export async function fetchUserLevelReport(userId) {
  try {
    const res = await fetch(`${API_BASE}/user-level?userId=${encodeURIComponent(userId)}`)
    const json = await res.json()
    if (json.code !== 0) throw new Error(json.msg || '获取等级失败')

    return json.data
  } catch (err) {
    console.error('获取等级失败:', err)
    throw err
  }
}
