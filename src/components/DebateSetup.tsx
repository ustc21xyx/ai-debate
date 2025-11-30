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
  const { endpoints, models, setDebateConfig, setDebateStatus, clearMessages, setCurrentRound, setCurrentSide } = useStore()

  const [topic, setTopic] = useState('')
  const [rounds, setRounds] = useState(3)
  const [leftEndpoint, setLeftEndpoint] = useState('')
  const [leftModel, setLeftModel] = useState('')
  const [leftPosition, setLeftPosition] = useState('正方')
  const [rightEndpoint, setRightEndpoint] = useState('')
  const [rightModel, setRightModel] = useState('')
  const [rightPosition, setRightPosition] = useState('反方')

  const leftModels = leftEndpoint ? models[leftEndpoint] || [] : []
  const rightModels = rightEndpoint ? models[rightEndpoint] || [] : []

  const canStart = topic && leftEndpoint && leftModel && rightEndpoint && rightModel

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
    }

    clearMessages()
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            {/* VS Badge (center on desktop) */}
            <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="vs-badge text-3xl animate-float">VS</div>
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
