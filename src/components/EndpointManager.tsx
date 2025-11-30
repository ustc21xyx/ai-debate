'use client'

import { useState } from 'react'
import { useStore } from '@/store'
import type { ApiEndpoint } from '@/types'

export function EndpointManager() {
  const { endpoints, addEndpoint, removeEndpoint, setModels, models } = useStore()
  const [isAdding, setIsAdding] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    baseUrl: '',
    apiKey: '',
    type: 'openai' as 'openai' | 'anthropic',
  })

  const handleAdd = () => {
    if (!form.name || !form.baseUrl || !form.apiKey) return

    const endpoint: ApiEndpoint = {
      id: crypto.randomUUID(),
      name: form.name,
      baseUrl: form.baseUrl.replace(/\/$/, ''), // 移除尾部斜杠
      apiKey: form.apiKey,
      type: form.type,
    }

    addEndpoint(endpoint)
    setForm({ name: '', baseUrl: '', apiKey: '', type: 'openai' })
    setIsAdding(false)
  }

  const fetchModels = async (endpoint: ApiEndpoint) => {
    setLoading(endpoint.id)
    try {
      const response = await fetch('/api/proxy/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: endpoint.baseUrl,
          apiKey: endpoint.apiKey,
          type: endpoint.type,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to fetch models')
      }

      const data = await response.json()
      const modelList = (data.data || []).map((m: { id: string; display_name?: string }) => ({
        id: m.id,
        name: m.display_name || m.id,
        endpointId: endpoint.id,
      }))

      setModels(endpoint.id, modelList)
    } catch (error) {
      console.error('Failed to fetch models:', error)
      alert(`获取模型列表失败: ${error instanceof Error ? error.message : '未知错误'}`)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">API 端点配置</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          {isAdding ? '取消' : '添加端点'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">名称</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="例如：OpenAI、Claude、DeepSeek"
              className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Base URL</label>
            <input
              type="text"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="https://api.openai.com"
              className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">API Key</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">类型</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'openai' | 'anthropic' })}
              className="w-full px-3 py-2 bg-gray-600 text-white rounded border border-gray-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="openai">OpenAI 兼容</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name || !form.baseUrl || !form.apiKey}
            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            保存
          </button>
        </div>
      )}

      <div className="space-y-3">
        {endpoints.length === 0 ? (
          <p className="text-gray-400 text-center py-4">暂无配置的端点，请添加一个</p>
        ) : (
          endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className="p-4 bg-gray-700 rounded-lg flex justify-between items-center"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{endpoint.name}</span>
                  <span className="text-xs px-2 py-0.5 bg-gray-600 text-gray-300 rounded">
                    {endpoint.type === 'anthropic' ? 'Anthropic' : 'OpenAI'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-1">{endpoint.baseUrl}</p>
                {models[endpoint.id] && (
                  <p className="text-xs text-green-400 mt-1">
                    已加载 {models[endpoint.id].length} 个模型
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchModels(endpoint)}
                  disabled={loading === endpoint.id}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white text-sm rounded transition-colors"
                >
                  {loading === endpoint.id ? '加载中...' : '获取模型'}
                </button>
                <button
                  onClick={() => removeEndpoint(endpoint.id)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
