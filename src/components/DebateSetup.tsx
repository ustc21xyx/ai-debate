'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import type { DebateConfig } from '@/types'

const SAMPLE_TOPICS = [
  '人工智能是否应该拥有权利',
  '远程办公是否比办公室办公更有效率',
  '社交媒体对社会的影响是利大于弊还是弊大于利',
  '人类应该追求长生不老吗',
  '自动驾驶汽车应该优先保护乘客还是行人',
]

export function DebateSetup() {
  const { endpoints, models, setDebateConfig, setDebateStatus, clearMessages, setCurrentRound, setCurrentSide, setVerdict } = useStore()

  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(3)
  const [leftEndpoint, setLeftEndpoint] = useState('')
  const [leftModel, setLeftModel] = useState('')
  const [leftPosition, setLeftPosition] = useState('正方')
  const [rightEndpoint, setRightEndpoint] = useState('')
  const [rightModel, setRightModel] = useState('')
  const [rightPosition, setRightPosition] = useState('反方')
  // 3个裁判
  const [judgeEndpoints, setJudgeEndpoints] = useState(['', '', ''])
  const [judgeModels, setJudgeModels] = useState(['', '', ''])

  const leftModels = leftEndpoint ? models[leftEndpoint] || [] : []
  const rightModels = rightEndpoint ? models[rightEndpoint] || [] : []
  const getJudgeModels = (index: number) => judgeEndpoints[index] ? models[judgeEndpoints[index]] || [] : []

  const allJudgesConfigured = judgeEndpoints.every((e, i) => e && judgeModels[i])
  const canStart = topic && leftEndpoint && leftModel && rightEndpoint && rightModel && allJudgesConfigured

  const updateJudgeEndpoint = (index: number, value: string) => {
    const newEndpoints = [...judgeEndpoints]
    newEndpoints[index] = value
    setJudgeEndpoints(newEndpoints)
    // 清空对应的模型选择
    const newModels = [...judgeModels]
    newModels[index] = ''
    setJudgeModels(newModels)
  }

  const updateJudgeModel = (index: number, value: string) => {
    const newModels = [...judgeModels]
    newModels[index] = value
    setJudgeModels(newModels)
  }

  const handleStart = () => {
    if (!canStart) return

    const config: DebateConfig = {
      topic,
      rounds,
      left: {
        endpointId: leftEndpoint,
        modelId: leftModel,
        position: leftPosition,
      },
      right: {
        endpointId: rightEndpoint,
        modelId: rightModel,
        position: rightPosition,
      },
      judges: judgeEndpoints.map((endpointId, i) => ({
        endpointId,
        modelId: judgeModels[i],
      })),
    }

    clearMessages()
    setVerdict(null)
    setCurrentRound(1)
    setCurrentSide('left')
    setDebateConfig(config)
    setDebateStatus('debating')
  }

  return (
    <div className="arena-card arena-card-glow p-6 relative overflow-hidden">
      {/* Corner decorations */}
      <div className="corner-decoration bottom-left" />
      <div className="corner-decoration bottom-right" />

      <div className="mb-6">
        <h2 className="font-display text-xl font-semibold text-[var(--accent-gold)] tracking-wide">
          DEBATE CONFIG
        </h2>
        <p className="text-[var(--text-secondary)] text-sm mt-1">设置辩论主题与参赛选手</p>
      </div>

      {endpoints.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-[var(--accent-gold)] mb-2">请先添加 API 端点</div>
          <div className="text-sm text-[var(--text-secondary)]">在上方配置至少一个 API 端点后即可开始辩论</div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Topic Section */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 tracking-wide uppercase">辩论主题</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入一个引人深思的辩题..."
              className="arena-input w-full text-lg"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {SAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="topic-chip"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Rounds */}
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-3 tracking-wide uppercase">辩论轮数</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setRounds(n)}
                  className={`w-12 h-12 rounded-lg font-display font-semibold transition-all ${
                    rounds === n
                      ? 'bg-[var(--accent-gold)] text-[var(--bg-primary)]'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[rgba(212,168,83,0.2)] hover:border-[var(--accent-gold)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Debaters */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
            {/* Left Debater */}
            <div className="debater-left rounded-xl p-5 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--left-primary)] to-transparent rounded-t-xl" />
              <h3 className="font-display text-lg font-semibold text-[var(--left-primary)] mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-[var(--left-primary)] rounded-full animate-pulse" />
                左方选手
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">立场</label>
                  <input
                    type="text"
                    value={leftPosition}
                    onChange={(e) => setLeftPosition(e.target.value)}
                    className="arena-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">API 端点</label>
                  <select
                    value={leftEndpoint}
                    onChange={(e) => {
                      setLeftEndpoint(e.target.value)
                      setLeftModel('')
                    }}
                    className="arena-select w-full"
                  >
                    <option value="">选择端点...</option>
                    {endpoints.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2">模型</label>
                  <select
                    value={leftModel}
                    onChange={(e) => setLeftModel(e.target.value)}
                    disabled={!leftEndpoint || leftModels.length === 0}
                    className="arena-select w-full disabled:opacity-50"
                  >
                    <option value="">
                      {!leftEndpoint
                        ? '先选择端点'
                        : leftModels.length === 0
                        ? '请先获取模型列表'
                        : '选择模型...'}
                    </option>
                    {leftModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Debater */}
            <div className="debater-right rounded-xl p-5 relative">
              <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-[var(--right-primary)] to-transparent rounded-t-xl" />
              <h3 className="font-display text-lg font-semibold text-[var(--right-primary)] mb-4 flex items-center justify-end gap-2">
                右方选手
                <span className="w-2 h-2 bg-[var(--right-primary)] rounded-full animate-pulse" />
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2 text-right">立场</label>
                  <input
                    type="text"
                    value={rightPosition}
                    onChange={(e) => setRightPosition(e.target.value)}
                    className="arena-input w-full text-right"
                  />
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2 text-right">API 端点</label>
                  <select
                    value={rightEndpoint}
                    onChange={(e) => {
                      setRightEndpoint(e.target.value)
                      setRightModel('')
                    }}
                    className="arena-select w-full"
                  >
                    <option value="">选择端点...</option>
                    {endpoints.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[var(--text-secondary)] mb-2 text-right">模型</label>
                  <select
                    value={rightModel}
                    onChange={(e) => setRightModel(e.target.value)}
                    disabled={!rightEndpoint || rightModels.length === 0}
                    className="arena-select w-full disabled:opacity-50"
                  >
                    <option value="">
                      {!rightEndpoint
                        ? '先选择端点'
                        : rightModels.length === 0
                        ? '请先获取模型列表'
                        : '选择模型...'}
                    </option>
                    {rightModels.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Judges Panel */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--left-primary)]/10 via-[var(--accent-gold)]/20 to-[var(--right-primary)]/10 rounded-xl" />
            <div className="relative rounded-xl p-5 border border-[var(--accent-gold)]/30">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent rounded-t-xl" />
              <h3 className="font-display text-lg font-semibold text-[var(--accent-gold)] mb-4 flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
                裁判团（3人）
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[0, 1, 2].map((index) => {
                  const judgeModelList = getJudgeModels(index)
                  return (
                    <div key={index} className="p-4 bg-[var(--bg-secondary)]/50 rounded-lg border border-[rgba(212,168,83,0.1)]">
                      <div className="text-center mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--accent-gold)]/20 text-[var(--accent-gold)] text-sm font-bold">
                          {index + 1}
                        </span>
                        <div className="text-xs text-[var(--text-secondary)] mt-1">裁判 {index + 1}</div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">端点</label>
                          <select
                            value={judgeEndpoints[index]}
                            onChange={(e) => updateJudgeEndpoint(index, e.target.value)}
                            className="arena-select w-full text-sm"
                          >
                            <option value="">选择...</option>
                            {endpoints.map((e) => (
                              <option key={e.id} value={e.id}>{e.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-[var(--text-secondary)] mb-1">模型</label>
                          <select
                            value={judgeModels[index]}
                            onChange={(e) => updateJudgeModel(index, e.target.value)}
                            disabled={!judgeEndpoints[index] || judgeModelList.length === 0}
                            className="arena-select w-full text-sm disabled:opacity-50"
                          >
                            <option value="">
                              {!judgeEndpoints[index]
                                ? '先选择端点'
                                : judgeModelList.length === 0
                                ? '获取模型'
                                : '选择...'}
                            </option>
                            {judgeModelList.map((m) => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
                三位裁判将独立评判，最终结果由多数票决定
              </p>
            </div>
          </div>

          {/* Start Button */}
          <div className="pt-4">
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="btn-arena btn-arena-gold w-full py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              开始辩论
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
