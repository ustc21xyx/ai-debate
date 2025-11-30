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
    type: 'openai' as 'openai' | 'anthropic' | 'gemini',
  })

  const handleAdd = () => {
    if (!form.name || !form.baseUrl || !form.apiKey) return

    const endpoint: ApiEndpoint = {
      id: crypto.randomUUID(),
      name: form.name,
      baseUrl: form.baseUrl.replace(/\/$/, ''),
      apiKey: form.apiKey,
      type: form.type,
    }

    addEndpoint(endpoint)
    setForm({ name: '', baseUrl: '', apiKey: '', type: 'openai' })
    setIsAdding(false)
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'anthropic': return 'Anthropic'
      case 'gemini': return 'Gemini'
      default: return 'OpenAI'
    }
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
    <div className="arena-card arena-card-glow p-6 relative overflow-hidden">
      {/* Corner decorations */}
      <div className="corner-decoration top-left" />
      <div className="corner-decoration top-right" />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-display text-xl font-semibold text-[var(--accent-gold)] tracking-wide">
            API ENDPOINTS
          </h2>
          <p className="text-[var(--text-secondary)] text-sm mt-1">配置你的 AI 服务接口</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className={`btn-arena ${isAdding ? 'btn-arena-outline' : 'btn-arena-gold'} text-sm`}
        >
          {isAdding ? '取消' : '添加端点'}
        </button>
      </div>

      {isAdding && (
        <div className="mb-6 p-5 bg-[var(--bg-secondary)] rounded-xl border border-[rgba(212,168,83,0.1)] space-y-4 animate-fade-up">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2 tracking-wide">名称</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：OpenAI、Claude"
                className="arena-input w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2 tracking-wide">类型</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'openai' | 'anthropic' | 'gemini' })}
                className="arena-select w-full"
              >
                <option value="openai">OpenAI 兼容</option>
                <option value="anthropic">Anthropic</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 tracking-wide">Base URL</label>
            <input
              type="text"
              value={form.baseUrl}
              onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
              placeholder="https://api.openai.com"
              className="arena-input w-full"
            />
          </div>
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2 tracking-wide">API Key</label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="sk-..."
              className="arena-input w-full"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!form.name || !form.baseUrl || !form.apiKey}
            className="btn-arena btn-arena-gold w-full disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            保存配置
          </button>
        </div>
      )}

      <div className="space-y-3">
        {endpoints.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-[var(--text-secondary)] mb-2">暂无配置的端点</div>
            <div className="text-sm text-[var(--text-secondary)] opacity-60">点击上方按钮添加你的第一个 API 端点</div>
          </div>
        ) : (
          endpoints.map((endpoint, index) => (
            <div
              key={endpoint.id}
              className="p-4 bg-[var(--bg-secondary)] rounded-xl border border-[rgba(212,168,83,0.1)] flex justify-between items-center hover:border-[rgba(212,168,83,0.3)] transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-[var(--text-primary)]">{endpoint.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(212,168,83,0.15)] text-[var(--accent-gold)] border border-[rgba(212,168,83,0.2)]">
                    {getTypeBadge(endpoint.type)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono">{endpoint.baseUrl}</p>
                {models[endpoint.id] && (
                  <p className="text-xs text-green-400 mt-1">
                    ✓ 已加载 {models[endpoint.id].length} 个模型
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => fetchModels(endpoint)}
                  disabled={loading === endpoint.id}
                  className="btn-arena btn-arena-outline text-xs py-2 px-4 disabled:opacity-40"
                >
                  {loading === endpoint.id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 border-2 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin" />
                      加载中
                    </span>
                  ) : '获取模型'}
                </button>
                <button
                  onClick={() => removeEndpoint(endpoint.id)}
                  className="px-4 py-2 text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
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
