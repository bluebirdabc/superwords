// src/api/mock-packet.js

// 1. 导入我们刚刚创建的解析器
import { parseQuestionPacket } from './parser.js';

// 2. 这个文件模拟了从后端API获取到的原始JSON数据
const getMockBackendResponse = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        "code": 0,
        "msg": "OK",
        "data": {
          "type": 0, "index": 1, "user_id": 12345, "level": 5, "accuracy": 85.5,
          "score": {}, "results": [],
          "scene": {
            "stages": [
              {
                "type": 0, "title": "Final Integration Test", "subTitle": "",
                "quizzes": [
                  // 1. YY01
                  { "quiz_id": 101, "quiz_type_id": 1, "quiz_type_name": "单词填空", "quiz_body": "The workers will b___ a new school next month.", "answer": ["build"] },
                  // 2. YY02
                  { "quiz_id": 102, "quiz_type_id": 2, "quiz_type_name": "单词选择", "quiz_body": "The city plans to ( ) a playground near the park.", "quiz_option": ["build", "buy", "break", "borrow"], "answer": ["A"] },
                  // 3. YY03
                  { "quiz_id": 103, "quiz_type_id": 3, "quiz_type_name": "听力选择", "quiz_audio": "https://static.bluebirdabc.com/lesson/material/aif8j9q38t4q78y4/855/32cd12ff83be71bb2a93ddc2237691204c80ab3b.mp3", "quiz_body": "What are the trucks for?", "quiz_option": ["Building a library", "Buying books", "Breaking old buildings", "Borrowing tools"], "answer": ["A"] },
                  // 4. YY04
                  { "quiz_id": 104, "quiz_type_id": 4, "quiz_type_name": "听力填空", "quiz_audio": "https://static.bluebirdabc.com/lesson/fish_tts/17/1742124b903469f88b515dbfe182928ff7303325.wav", "quiz_body": "The government wants to ___ more hospitals.", "answer": ["build"] },
                  // 5. YY05
                  { "quiz_id": 105, "quiz_type_id": 5, "quiz_type_name": "听力理解", "quiz_audio": "https://static.bluebirdabc.com/lesson/material/aif8j9q38t4q78y4/855/5b79f3168be5800b28a0054add4f524e0910e3be.mp3", "quiz_body": "Why is the road closed?", "quiz_option": ["Because they’re building a subway", "Because they’re buying tickets", "Because they’re breaking records", "Because they’re borrowing tools"], "answer": ["A"] },
                  // 6. YY06
                  { "quiz_id": 106, "quiz_type_id": 6, "quiz_type_name": "选择并复述", "quiz_body": "The company will ( ) a factory in this area.", "quiz_option": ["build", "burn", "buy", "bake"], "answer": ["A"] },
                  // 7. YY07
                  { "quiz_id": 107, "quiz_type_id": 7, "quiz_type_name": "理解并口述", "quiz_body": "The new bridge took two years to build.\nWhy did it take so long?", "quiz_option": ["Because it was a complex project", "Because they bought cheap materials", "Because they broke the old bridge", "Because they baked bricks slowly"], "answer": ["A"] },
                  // 8. YY08
                  { "quiz_id": 108, "quiz_type_id": 8, "quiz_type_name": "填空并复述", "quiz_body": "They need to b___ a fence around the garden.", "answer": ["build"] },
                  // 9. YY09
                  { "quiz_id": 109, "quiz_type_id": 9, "quiz_type_name": "词义英文解释", "quiz_body": "What does \"build\" mean in this sentence? \"They will build a shopping center here？\"", "quiz_option": ["Construct something", "Destroy something", "Clean an area", "Paint a wall"], "answer": ["A"] },
                  // 10. YY10
                  { "quiz_id": 110, "quiz_type_id": 10, "quiz_type_name": "词形变化", "quiz_body": "build\nThe workers are ___ a new road this week.", "answer": ["building"] },
                  // 11. YY11
                  { "quiz_id": 111, "quiz_type_id": 11, "quiz_type_name": "词根词缀词变化", "quiz_body": "The project will ___ (create structures) jobs for locals.", "quiz_option": ["build", "builder", "built", "building"], "answer": ["A"] },
                  // 12. YY12
                  { "quiz_id": 112, "quiz_type_id": 12, "quiz_type_name": "关键词填空", "quiz_body": "The town needs to b___ a new bus station. The old one is too small and crowded.", "answer": ["build"] },
                  // 13. YY13
                  { "quiz_id": 113, "quiz_type_id": 13, "quiz_type_name": "阅读选择", "quiz_body": "The town needs to ( ) a new bus station. The old one is too small.", "quiz_option": ["build", "buy", "break", "borrow"], "answer": ["A"] },
                  // 14. YY14
                  { "quiz_id": 114, "quiz_type_id": 14, "quiz_type_name": "补全翻译", "quiz_body": "他们计划在河边建造一座新桥。\nThey plan to b___ a new bridge by the river.", "answer": ["build"] }
                ],
                "toolType": 0, "challengeType": 0, "gagaType": 0
              }
            ],
            "replace_quizzes": []
          }
        }
      });
    }, 500);
  });
};

// 3. 导出给 TestingView.vue 使用的最终函数
// 这个函数是整个模块的唯一出口
export const getQuestionPacket = async () => {
  console.log("正在请求后端模拟数据...");
  const response = await getMockBackendResponse();
  
  if (response.code !== 0 || !response.data) {
    throw new Error(response.msg || "后端返回数据错误");
  }
  
  console.log("后端数据已收到，正在使用解析器转换...");
  const packet = parseQuestionPacket(response.data);
  console.log("数据转换完成，前端可用题包:", packet);
  
  return packet;
};