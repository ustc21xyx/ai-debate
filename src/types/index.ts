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

// 辩论配置
export interface DebateConfig {
  topic: string
  rounds: number
  left: DebaterConfig
  right: DebaterConfig
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
export type DebateStatus = 'idle' | 'configuring' | 'debating' | 'paused' | 'finished'

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
