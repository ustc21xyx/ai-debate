'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store'
import type { DebateMessage, ChatCompletionMessage } from '@/types'

function TypingIndicator({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left'
  return (
    <div className={`flex items-center gap-1.5 px-4 py-3 ${isLeft ? 'text-[var(--left-primary)]' : 'text-[var(--right-primary)]'}`}>
      <div className="typing-dot w-2 h-2 rounded-full bg-current" />
      <div className="typing-dot w-2 h-2 rounded-full bg-current" />
      <div className="typing-dot w-2 h-2 rounded-full bg-current" />
    </div>
  )
}

function MessageBubble({ message, modelName, index }: { message: DebateMessage; modelName: string; index: number }) {
  const isLeft = message.side === 'left'

  return (
    <div
      className={`flex ${isLeft ? 'justify-start' : 'justify-end'} mb-6 ${isLeft ? 'animate-slide-left' : 'animate-slide-right'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={`max-w-[85%] ${isLeft ? 'message-left' : 'message-right'} p-5`}>
        <div className={`flex items-center gap-3 mb-3 ${isLeft ? '' : 'justify-end'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            isLeft ? 'bg-[var(--left-primary)]/20 text-[var(--left-primary)]' : 'bg-[var(--right-primary)]/20 text-[var(--right-primary)]'
          }`}>
            {isLeft ? 'L' : 'R'}
          </div>
          <div className={isLeft ? '' : 'text-right'}>
            <span className={`text-sm font-semibold ${isLeft ? 'text-[var(--left-primary)]' : 'text-[var(--right-primary)]'}`}>
              {modelName}
            </span>
            <span className="text-xs text-[var(--text-secondary)] ml-2">
              Round {message.round}
            </span>
          </div>
        </div>
        <div className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages])

  const getEndpointInfo = useCallback((endpointId: string) => {
    return endpoints.find((e) => e.id === endpointId)
  }, [endpoints])

  const getModelName = useCallback((endpointId: string, modelId: string) => {
    const endpointModels = models[endpointId] || []
    const model = endpointModels.find((m) => m.id === modelId)
    return model?.name || modelId
  }, [models])

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

    messages.forEach((msg) => {
      const role = msg.side === side ? 'assistant' : 'user'
      chatMessages.push({ role, content: msg.content })
    })

    if (messages.length === 0 && side === 'left') {
      chatMessages.push({
        role: 'user',
        content: `请就"${debateConfig.topic}"这个辩题，以${config.position}的立场发表你的开场陈述。`,
      })
    } else if (messages.length > 0) {
      chatMessages.push({
        role: 'user',
        content: '请针对对方的论点进行回应和反驳，同时继续阐述你的立场。',
      })
    }

    return chatMessages
  }, [debateConfig, messages])

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

  useEffect(() => {
    if (debateStatus === 'debating' && !isGenerating.current) {
      const timer = setTimeout(() => {
        generateResponse()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [debateStatus, currentSide, currentRound, generateResponse])

  const handlePause = () => setDebateStatus('paused')
  const handleResume = () => setDebateStatus('debating')
  const handleReset = () => setDebateStatus('idle')

  if (!debateConfig) return null

  const leftModelName = getModelName(debateConfig.left.endpointId, debateConfig.left.modelId)
  const rightModelName = getModelName(debateConfig.right.endpointId, debateConfig.right.modelId)

  return (
    <div className="arena-card overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[var(--bg-card)] to-transparent p-6 border-b border-[rgba(212,168,83,0.1)]">
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--left-primary)] via-[var(--accent-gold)] to-[var(--right-primary)]" />

        <div className="text-center">
          <div className="round-badge inline-block mb-4">
            <span className="text-[var(--accent-gold)] text-sm">
              ROUND {currentRound} / {debateConfig.rounds}
            </span>
          </div>

          <h2 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-6 tracking-wide">
            {debateConfig.topic}
          </h2>

          {/* Debaters info */}
          <div className="flex items-center justify-center gap-4 md:gap-8">
            <div className="text-right flex-1">
              <div className="text-[var(--left-primary)] font-semibold">{debateConfig.left.position}</div>
              <div className="text-sm text-[var(--text-secondary)] truncate">{leftModelName}</div>
            </div>

            <div className="vs-badge text-2xl md:text-3xl px-4 animate-pulse-glow">VS</div>

            <div className="text-left flex-1">
              <div className="text-[var(--right-primary)] font-semibold">{debateConfig.right.position}</div>
              <div className="text-sm text-[var(--text-secondary)] truncate">{rightModelName}</div>
            </div>
          </div>

          {/* Status */}
          <div className="mt-4 text-sm text-[var(--text-secondary)]">
            {debateStatus === 'debating' && (
              <span className="flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${currentSide === 'left' ? 'bg-[var(--left-primary)]' : 'bg-[var(--right-primary)]'}`} />
                {currentSide === 'left' ? debateConfig.left.position : debateConfig.right.position} 正在发言...
              </span>
            )}
            {debateStatus === 'finished' && <span className="text-[var(--accent-gold)]">辩论已结束</span>}
            {debateStatus === 'paused' && <span className="text-yellow-500">已暂停</span>}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={containerRef} className="h-[500px] overflow-y-auto p-6 bg-[var(--bg-secondary)]/30">
        {messages.length === 0 && debateStatus === 'debating' && (
          <div className="flex justify-center items-center h-full">
            <div className="text-center">
              <div className="text-[var(--text-secondary)] mb-2">辩论即将开始</div>
              <div className="flex justify-center">
                <TypingIndicator side="left" />
              </div>
            </div>
          </div>
        )}

        {messages.map((msg, index) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            modelName={msg.side === 'left' ? leftModelName : rightModelName}
            index={index}
          />
        ))}

        {debateStatus === 'debating' && messages.length > 0 && (
          <div className={`flex ${currentSide === 'left' ? 'justify-start' : 'justify-end'}`}>
            <div className={`${currentSide === 'left' ? 'message-left' : 'message-right'} rounded-2xl`}>
              <TypingIndicator side={currentSide} />
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 border-t border-[rgba(212,168,83,0.1)] bg-[var(--bg-card)] flex justify-center gap-4">
        {debateStatus === 'debating' && (
          <button onClick={handlePause} className="btn-arena btn-arena-outline">
            暂停
          </button>
        )}
        {debateStatus === 'paused' && (
          <button onClick={handleResume} className="btn-arena btn-arena-gold">
            继续
          </button>
        )}
        {(debateStatus === 'paused' || debateStatus === 'finished') && (
          <button onClick={handleReset} className="btn-arena btn-arena-outline">
            重新配置
          </button>
        )}
      </div>
    </div>
  )
}
