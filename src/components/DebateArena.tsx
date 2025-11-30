'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store'
import type { DebateMessage, ChatCompletionMessage } from '@/types'

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-2">
      <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
      <div className="typing-dot w-2 h-2 bg-gray-400 rounded-full" />
    </div>
  )
}

function MessageBubble({ message, modelName }: { message: DebateMessage; modelName: string }) {
  const isLeft = message.side === 'left'

  return (
    <div className={`debate-message flex ${isLeft ? 'justify-start' : 'justify-end'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          isLeft
            ? 'bg-blue-900/50 border border-blue-700'
            : 'bg-red-900/50 border border-red-700'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-semibold ${isLeft ? 'text-blue-400' : 'text-red-400'}`}>
            {modelName}
          </span>
          <span className="text-xs text-gray-500">第 {message.round} 轮</span>
        </div>
        <div className="text-gray-200 whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  )
}

export function DebateArena() {
  const {
    debateConfig,
    debateStatus,
    setDebateStatus,
    messages,
    addMessage,
    currentRound,
    setCurrentRound,
    currentSide,
    setCurrentSide,
    endpoints,
    models,
  } = useStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const isGenerating = useRef(false)

  // 滚动到底部
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  // 获取端点和模型信息
  const getEndpointInfo = useCallback((endpointId: string) => {
    return endpoints.find((e) => e.id === endpointId)
  }, [endpoints])

  const getModelName = useCallback((endpointId: string, modelId: string) => {
    const endpointModels = models[endpointId] || []
    const model = endpointModels.find((m) => m.id === modelId)
    return model?.name || modelId
  }, [models])

  // 构建对话历史
  const buildMessages = useCallback((side: 'left' | 'right'): ChatCompletionMessage[] => {
    if (!debateConfig) return []

    const config = side === 'left' ? debateConfig.left : debateConfig.right
    const opponentConfig = side === 'left' ? debateConfig.right : debateConfig.left

    const systemPrompt = `你是一位专业的辩论选手，代表"${config.position}"立场参与辩论。
辩题是：${debateConfig.topic}

你的任务是：
1. 坚定地支持你的立场（${config.position}）
2. 提出有说服力的论点和论据
3. 针对对方（${opponentConfig.position}）的论点进行反驳
4. 使用逻辑清晰、有条理的方式表达
5. 回应要简洁有力，控制在 300 字以内

请用中文进行辩论。`

    const chatMessages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
    ]

    // 添加历史消息
    messages.forEach((msg) => {
      const role = msg.side === side ? 'assistant' : 'user'
      chatMessages.push({ role, content: msg.content })
    })

    // 如果是第一轮的第一个发言，添加开场提示
    if (messages.length === 0 && side === 'left') {
      chatMessages.push({
        role: 'user',
        content: `请就"${debateConfig.topic}"这个辩题，以${config.position}的立场发表你的开场陈述。`,
      })
    } else if (messages.length > 0) {
      // 提示回应对方
      chatMessages.push({
        role: 'user',
        content: '请针对对方的论点进行回应和反驳，同时继续阐述你的立场。',
      })
    }

    return chatMessages
  }, [debateConfig, messages])

  // 生成回复
  const generateResponse = useCallback(async () => {
    if (!debateConfig || isGenerating.current) return

    isGenerating.current = true

    const side = currentSide
    const config = side === 'left' ? debateConfig.left : debateConfig.right
    const endpoint = getEndpointInfo(config.endpointId)

    if (!endpoint) {
      console.error('Endpoint not found')
      isGenerating.current = false
      return
    }

    try {
      const chatMessages = buildMessages(side)

      const response = await fetch('/api/proxy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: endpoint.baseUrl,
          apiKey: endpoint.apiKey,
          type: endpoint.type,
          model: config.modelId,
          messages: chatMessages,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate response')
      }

      const data = await response.json()

      const message: DebateMessage = {
        id: crypto.randomUUID(),
        side,
        round: currentRound,
        content: data.content,
        model: config.modelId,
        timestamp: Date.now(),
      }

      addMessage(message)

      // 切换到下一方或下一轮
      if (side === 'left') {
        setCurrentSide('right')
      } else {
        if (currentRound >= debateConfig.rounds) {
          setDebateStatus('finished')
        } else {
          setCurrentRound(currentRound + 1)
          setCurrentSide('left')
        }
      }
    } catch (error) {
      console.error('Generation error:', error)
      alert(`生成失败: ${error instanceof Error ? error.message : '未知错误'}`)
      setDebateStatus('paused')
    } finally {
      isGenerating.current = false
    }
  }, [debateConfig, currentSide, currentRound, getEndpointInfo, buildMessages, addMessage, setCurrentSide, setCurrentRound, setDebateStatus])

  // 自动继续辩论
  useEffect(() => {
    if (debateStatus === 'debating' && !isGenerating.current) {
      const timer = setTimeout(() => {
        generateResponse()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [debateStatus, currentSide, currentRound, generateResponse])

  const handlePause = () => {
    setDebateStatus('paused')
  }

  const handleResume = () => {
    setDebateStatus('debating')
  }

  const handleReset = () => {
    setDebateStatus('idle')
  }

  if (!debateConfig) {
    return null
  }

  const leftModelName = getModelName(debateConfig.left.endpointId, debateConfig.left.modelId)
  const rightModelName = getModelName(debateConfig.right.endpointId, debateConfig.right.modelId)

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      {/* 头部 */}
      <div className="bg-gray-900 p-4 border-b border-gray-700">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">{debateConfig.topic}</h2>
          <div className="flex justify-center items-center gap-4 text-sm">
            <span className="text-blue-400">
              {debateConfig.left.position}: {leftModelName}
            </span>
            <span className="text-gray-500">VS</span>
            <span className="text-red-400">
              {debateConfig.right.position}: {rightModelName}
            </span>
          </div>
          <div className="mt-2 text-sm text-gray-400">
            第 {currentRound} / {debateConfig.rounds} 轮
            {debateStatus === 'debating' && ` - ${currentSide === 'left' ? debateConfig.left.position : debateConfig.right.position}发言中`}
            {debateStatus === 'finished' && ' - 辩论结束'}
            {debateStatus === 'paused' && ' - 已暂停'}
          </div>
        </div>
      </div>

      {/* 消息区域 */}
      <div ref={containerRef} className="h-[500px] overflow-y-auto p-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            modelName={msg.side === 'left' ? leftModelName : rightModelName}
          />
        ))}
        {debateStatus === 'debating' && (
          <div className={`flex ${currentSide === 'left' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`rounded-lg ${
                currentSide === 'left'
                  ? 'bg-blue-900/30 border border-blue-700'
                  : 'bg-red-900/30 border border-red-700'
              }`}
            >
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      <div className="p-4 border-t border-gray-700 flex justify-center gap-4">
        {debateStatus === 'debating' && (
          <button
            onClick={handlePause}
            className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
          >
            暂停
          </button>
        )}
        {debateStatus === 'paused' && (
          <button
            onClick={handleResume}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            继续
          </button>
        )}
        {(debateStatus === 'paused' || debateStatus === 'finished') && (
          <button
            onClick={handleReset}
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            重新配置
          </button>
        )}
      </div>
    </div>
  )
}
