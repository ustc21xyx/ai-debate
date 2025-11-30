'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import { EndpointManager, DebateSetup, DebateArena } from '@/components'

type Tab = 'config' | 'debate'

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('config')
  const { debateStatus } = useStore()

  // 当开始辩论时自动切换到辩论标签
  const showDebate = debateStatus !== 'idle'

  return (
    <main className="min-h-screen bg-gray-900">
      {/* 头部 */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white text-center">
            AI 辩论竞技场
          </h1>
          <p className="text-gray-400 text-center text-sm mt-1">
            让两个 AI 模型就某话题进行多轮辩论
          </p>
        </div>
      </header>

      {/* 标签栏 */}
      <div className="max-w-6xl mx-auto px-4 mt-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
              activeTab === 'config' && !showDebate
                ? 'bg-gray-800 text-white'
                : 'bg-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            配置
          </button>
          {showDebate && (
            <button
              onClick={() => setActiveTab('debate')}
              className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
                activeTab === 'debate' || showDebate
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-700 text-gray-400 hover:text-white'
              }`}
            >
              辩论
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 pb-8">
        {showDebate ? (
          <DebateArena />
        ) : (
          <div className="space-y-6">
            <EndpointManager />
            <DebateSetup />
          </div>
        )}
      </div>

      {/* 页脚 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 py-2">
        <p className="text-center text-gray-500 text-xs">
          AI 辩论竞技场 - 部署于 Vercel
        </p>
      </footer>
    </main>
  )
}
