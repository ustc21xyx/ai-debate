// API 端点配置
export interface ApiEndpoint {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  type: 'openai' | 'anthropic'
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
  judge: JudgeConfig
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

// 裁判裁决
export interface JudgeVerdict {
  winner: 'left' | 'right' | 'draw'
  summary: string        // 辩论要点总结
  leftComment: string    // 对正方的点评
  rightComment: string   // 对反方的点评
  reason: string         // 裁决理由
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
