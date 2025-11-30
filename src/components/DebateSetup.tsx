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
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-xl font-bold text-white mb-4">辩论配置</h2>

      {endpoints.length === 0 ? (
        <p className="text-yellow-400">请先添加并配置至少一个 API 端点</p>
      ) : (
        <div className="space-y-6">
          {/* 辩题 */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">辩论主题</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入辩论主题..."
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLE_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 轮数 */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">辩论轮数</label>
            <select
              value={rounds}
              onChange={(e) => setRounds(Number(e.target.value))}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} 轮</option>
              ))}
            </select>
          </div>

          {/* 双方配置 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 左方 (正方) */}
            <div className="p-4 bg-blue-900/30 rounded-lg border border-blue-700">
              <h3 className="text-lg font-semibold text-blue-400 mb-3">左方</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">立场</label>
                  <input
                    type="text"
                    value={leftPosition}
                    onChange={(e) => setLeftPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">API 端点</label>
                  <select
                    value={leftEndpoint}
                    onChange={(e) => {
                      setLeftEndpoint(e.target.value)
                      setLeftModel('')
                    }}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">选择端点...</option>
                    {endpoints.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">模型</label>
                  <select
                    value={leftModel}
                    onChange={(e) => setLeftModel(e.target.value)}
                    disabled={!leftEndpoint || leftModels.length === 0}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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

            {/* 右方 (反方) */}
            <div className="p-4 bg-red-900/30 rounded-lg border border-red-700">
              <h3 className="text-lg font-semibold text-red-400 mb-3">右方</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">立场</label>
                  <input
                    type="text"
                    value={rightPosition}
                    onChange={(e) => setRightPosition(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">API 端点</label>
                  <select
                    value={rightEndpoint}
                    onChange={(e) => {
                      setRightEndpoint(e.target.value)
                      setRightModel('')
                    }}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">选择端点...</option>
                    {endpoints.map((e) => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">模型</label>
                  <select
                    value={rightModel}
                    onChange={(e) => setRightModel(e.target.value)}
                    disabled={!rightEndpoint || rightModels.length === 0}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none disabled:opacity-50"
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

          {/* 开始按钮 */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
          >
            开始辩论
          </button>
        </div>
      )}
    </div>
  )
}
