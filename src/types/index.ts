// API 端点配置
export interface ApiEndpoint {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  type: 'openai' | 'anthropic' | 'gemini'
}

// 模型信息
export interface Model {
  id: string
  name: string
  endpointId: string
}

// 辩论方配置
export interface DebaterConfig {
  endpointId: string
  modelId: string
  position: string // 辩论立场
}

// 裁判配置
export interface JudgeConfig {
  endpointId: string
  modelId: string
}

// 辩论配置
export interface DebateConfig {
  topic: string
  rounds: number
  left: DebaterConfig
  right: DebaterConfig
  judges: JudgeConfig[] // 3个裁判
}

// 辩论消息
export interface DebateMessage {
  id: string
  side: 'left' | 'right'
  round: number
  content: string
  model: string
  timestamp: number
}

// 辩论状态
export type DebateStatus = 'idle' | 'configuring' | 'debating' | 'paused' | 'judging' | 'finished'

// 单个裁判裁决
export interface JudgeVerdict {
  judgeIndex: number     // 裁判编号 (0, 1, 2)
  modelId: string        // 裁判模型ID
  winner: 'left' | 'right' | 'draw'
  summary: string        // 辩论要点总结
  leftComment: string    // 对正方的点评
  rightComment: string   // 对反方的点评
  reason: string         // 裁决理由
}

// 综合裁决结果
export interface CombinedVerdict {
  verdicts: JudgeVerdict[]  // 3个裁判的裁决
  finalWinner: 'left' | 'right' | 'draw'  // 最终结果（多数决定）
  voteCount: { left: number; right: number; draw: number }  // 票数统计
}

// API 响应类型
export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenAIModelResponse {
  data: Array<{ id: string; object: string }>
}

export interface AnthropicModelResponse {
  data: Array<{ id: string; type: string; display_name?: string }>
}
