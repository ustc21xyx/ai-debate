import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ApiEndpoint, Model, DebateConfig, DebateMessage, DebateStatus, CombinedVerdict } from '@/types'

interface AppState {
  // Hydration 状态
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void

  // API 端点管理
  endpoints: ApiEndpoint[]
  addEndpoint: (endpoint: ApiEndpoint) => void
  removeEndpoint: (id: string) => void
  updateEndpoint: (id: string, endpoint: Partial<ApiEndpoint>) => void

  // 模型缓存
  models: Record<string, Model[]> // endpointId -> models
  setModels: (endpointId: string, models: Model[]) => void

  // 辩论配置
  debateConfig: DebateConfig | null
  setDebateConfig: (config: DebateConfig | null) => void

  // 辩论状态
  debateStatus: DebateStatus
  setDebateStatus: (status: DebateStatus) => void

  // 辩论消息
  messages: DebateMessage[]
  addMessage: (message: DebateMessage) => void
  clearMessages: () => void

  // 当前轮次
  currentRound: number
  setCurrentRound: (round: number) => void

  // 当前说话方
  currentSide: 'left' | 'right'
  setCurrentSide: (side: 'left' | 'right') => void

  // 裁判裁决
  verdict: CombinedVerdict | null
  setVerdict: (verdict: CombinedVerdict | null) => void
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Hydration
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // API 端点
      endpoints: [],
      addEndpoint: (endpoint) =>
        set((state) => ({ endpoints: [...state.endpoints, endpoint] })),
      removeEndpoint: (id) =>
        set((state) => ({ endpoints: state.endpoints.filter((e) => e.id !== id) })),
      updateEndpoint: (id, updates) =>
        set((state) => ({
          endpoints: state.endpoints.map((e) =>
            e.id === id ? { ...e, ...updates } : e
          ),
        })),

      // 模型
      models: {},
      setModels: (endpointId, models) =>
        set((state) => ({ models: { ...state.models, [endpointId]: models } })),

      // 辩论配置
      debateConfig: null,
      setDebateConfig: (config) => set({ debateConfig: config }),

      // 辩论状态
      debateStatus: 'idle',
      setDebateStatus: (status) => set({ debateStatus: status }),

      // 消息
      messages: [],
      addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
      clearMessages: () => set({ messages: [] }),

      // 轮次
      currentRound: 1,
      setCurrentRound: (round) => set({ currentRound: round }),

      // 说话方
      currentSide: 'left',
      setCurrentSide: (side) => set({ currentSide: side }),

      // 裁判裁决
      verdict: null,
      setVerdict: (verdict) => set({ verdict }),
    }),
    {
      name: 'ai-debate-storage',
      partialize: (state) => ({
        endpoints: state.endpoints,
        models: state.models,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
