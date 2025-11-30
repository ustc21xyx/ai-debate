'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '@/store'
import type { DebateMessage, ChatCompletionMessage, JudgeVerdict } from '@/types'

function TypingIndicator({ side }: { side: 'left' | 'right' | 'judge' }) {
  const colorClass = side === 'left'
    ? 'text-[var(--left-primary)]'
    : side === 'right'
    ? 'text-[var(--right-primary)]'
    : 'text-[var(--accent-gold)]'
  return (
    <div className={`flex items-center gap-1.5 px-4 py-3 ${colorClass}`}>
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

function VerdictDisplay({ verdict, leftPosition, rightPosition }: {
  verdict: JudgeVerdict
  leftPosition: string
  rightPosition: string
}) {
  const winnerText = verdict.winner === 'left'
    ? leftPosition
    : verdict.winner === 'right'
    ? rightPosition
    : '平局'

  const winnerColor = verdict.winner === 'left'
    ? 'text-[var(--left-primary)]'
    : verdict.winner === 'right'
    ? 'text-[var(--right-primary)]'
    : 'text-[var(--accent-gold)]'

  return (
    <div className="animate-fade-up">
      {/* Winner announcement */}
      <div className="text-center mb-8 py-6 bg-gradient-to-r from-[var(--left-primary)]/10 via-[var(--accent-gold)]/20 to-[var(--right-primary)]/10 rounded-xl border border-[var(--accent-gold)]/30">
        <div className="text-[var(--text-secondary)] text-sm mb-2 tracking-wide uppercase">裁判裁决</div>
        <div className="font-display text-3xl font-bold mb-2">
          <span className={winnerColor}>{winnerText}</span>
          <span className="text-[var(--text-primary)]"> 获胜</span>
        </div>
        <div className="text-[var(--accent-gold)] text-sm">
          <svg className="w-5 h-5 inline-block mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
          </svg>
          OFFICIAL VERDICT
        </div>
      </div>

      {/* Summary */}
      <div className="mb-6 p-5 bg-[var(--bg-secondary)] rounded-xl border border-[rgba(212,168,83,0.15)]">
        <h4 className="font-display text-[var(--accent-gold)] mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-[var(--accent-gold)] rounded-full" />
          辩论要点总结
        </h4>
        <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{verdict.summary}</p>
      </div>

      {/* Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="p-5 rounded-xl debater-left">
          <h4 className="font-display text-[var(--left-primary)] mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-[var(--left-primary)] rounded-full" />
            {leftPosition}方点评
          </h4>
          <p className="text-[var(--text-primary)] leading-relaxed text-sm whitespace-pre-wrap">{verdict.leftComment}</p>
        </div>
        <div className="p-5 rounded-xl debater-right">
          <h4 className="font-display text-[var(--right-primary)] mb-3 flex items-center gap-2 justify-end">
            {rightPosition}方点评
            <span className="w-1.5 h-1.5 bg-[var(--right-primary)] rounded-full" />
          </h4>
          <p className="text-[var(--text-primary)] leading-relaxed text-sm whitespace-pre-wrap">{verdict.rightComment}</p>
        </div>
      </div>

      {/* Reason */}
      <div className="p-5 bg-gradient-to-b from-[var(--accent-gold)]/10 to-transparent rounded-xl border border-[var(--accent-gold)]/20">
        <h4 className="font-display text-[var(--accent-gold)] mb-3 flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          裁决理由
        </h4>
        <p className="text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">{verdict.reason}</p>
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
    verdict,
    setVerdict,
  } = useStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const isGenerating = useRef(false)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [messages, verdict])

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

  const generateJudgeVerdict = useCallback(async () => {
    if (!debateConfig || isGenerating.current) return

    isGenerating.current = true
    setDebateStatus('judging')

    const endpoint = getEndpointInfo(debateConfig.judge.endpointId)
    if (!endpoint) {
      console.error('Judge endpoint not found')
      isGenerating.current = false
      setDebateStatus('finished')
      return
    }

    // Build debate transcript
    const transcript = messages.map((msg) => {
      const position = msg.side === 'left' ? debateConfig.left.position : debateConfig.right.position
      return `【${position}·第${msg.round}轮】\n${msg.content}`
    }).join('\n\n')

    const systemPrompt = `你是一位专业、公正的辩论赛裁判。你需要对一场辩论进行评判。

辩题：${debateConfig.topic}
${debateConfig.left.position}方 vs ${debateConfig.right.position}方

请根据以下标准进行评判：
- 论点的逻辑性和说服力
- 论据的充分性和可靠性
- 反驳的有效性
- 整体表达的清晰度

你必须以严格的 JSON 格式返回评判结果，不要包含任何其他文字：
{
  "winner": "left" 或 "right" 或 "draw",
  "summary": "辩论要点总结（100-150字）",
  "leftComment": "对${debateConfig.left.position}方的点评（50-100字）",
  "rightComment": "对${debateConfig.right.position}方的点评（50-100字）",
  "reason": "裁决理由（100-150字）"
}

注意：winner 字段只能是 "left"、"right" 或 "draw" 三个值之一。`

    const chatMessages: ChatCompletionMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `以下是辩论全文记录：\n\n${transcript}\n\n请作出你的裁决。` },
    ]

    try {
      const response = await fetch('/api/proxy/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseUrl: endpoint.baseUrl,
          apiKey: endpoint.apiKey,
          type: endpoint.type,
          model: debateConfig.judge.modelId,
          messages: chatMessages,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to get judge verdict')
      }

      const data = await response.json()

      // Parse JSON from response
      let verdictData: JudgeVerdict
      try {
        // Try to extract JSON from the response
        const jsonMatch = data.content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          verdictData = JSON.parse(jsonMatch[0])
        } else {
          throw new Error('No JSON found in response')
        }
      } catch {
        // Fallback if JSON parsing fails
        verdictData = {
          winner: 'draw',
          summary: '无法解析裁判的评判结果',
          leftComment: data.content,
          rightComment: '',
          reason: '评判格式异常',
        }
      }

      setVerdict(verdictData)
      setDebateStatus('finished')
    } catch (error) {
      console.error('Judge error:', error)
      alert(`裁判评判失败: ${error instanceof Error ? error.message : '未知错误'}`)
      setDebateStatus('finished')
    } finally {
      isGenerating.current = false
    }
  }, [debateConfig, messages, getEndpointInfo, setDebateStatus, setVerdict])

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
          // Debate finished, now get judge verdict
          isGenerating.current = false
          generateJudgeVerdict()
          return
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
  }, [debateConfig, currentSide, currentRound, getEndpointInfo, buildMessages, addMessage, setCurrentSide, setCurrentRound, setDebateStatus, generateJudgeVerdict])

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
  const handleReset = () => {
    setDebateStatus('idle')
    setVerdict(null)
  }

  if (!debateConfig) return null

  const leftModelName = getModelName(debateConfig.left.endpointId, debateConfig.left.modelId)
  const rightModelName = getModelName(debateConfig.right.endpointId, debateConfig.right.modelId)
  const judgeModelName = getModelName(debateConfig.judge.endpointId, debateConfig.judge.modelId)

  return (
    <div className="arena-card overflow-hidden animate-fade-up">
      {/* Header */}
      <div className="relative bg-gradient-to-b from-[var(--bg-card)] to-transparent p-6 border-b border-[rgba(212,168,83,0.1)]">
        {/* Decorative lines */}
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-[var(--left-primary)] via-[var(--accent-gold)] to-[var(--right-primary)]" />

        <div className="text-center">
          <div className="round-badge inline-block mb-4">
            <span className="text-[var(--accent-gold)] text-sm">
              {debateStatus === 'judging' ? 'JUDGING' : debateStatus === 'finished' && verdict ? 'FINAL VERDICT' : `ROUND ${currentRound} / ${debateConfig.rounds}`}
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

          {/* Judge info */}
          <div className="mt-3 text-xs text-[var(--text-secondary)]">
            裁判：<span className="text-[var(--accent-gold)]">{judgeModelName}</span>
          </div>

          {/* Status */}
          <div className="mt-4 text-sm text-[var(--text-secondary)]">
            {debateStatus === 'debating' && (
              <span className="flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${currentSide === 'left' ? 'bg-[var(--left-primary)]' : 'bg-[var(--right-primary)]'}`} />
                {currentSide === 'left' ? debateConfig.left.position : debateConfig.right.position} 正在发言...
              </span>
            )}
            {debateStatus === 'judging' && (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full animate-pulse bg-[var(--accent-gold)]" />
                裁判正在评判...
              </span>
            )}
            {debateStatus === 'finished' && <span className="text-[var(--accent-gold)]">辩论已结束</span>}
            {debateStatus === 'paused' && <span className="text-yellow-500">已暂停</span>}
          </div>
        </div>
      </div>

      {/* Messages & Verdict */}
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

        {debateStatus === 'judging' && (
          <div className="flex justify-center mt-8">
            <div className="text-center p-6 rounded-xl border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/5">
              <div className="text-[var(--accent-gold)] mb-3">
                <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                </svg>
              </div>
              <div className="text-[var(--text-secondary)] mb-2">裁判正在审阅辩论记录</div>
              <TypingIndicator side="judge" />
            </div>
          </div>
        )}

        {verdict && debateStatus === 'finished' && (
          <div className="mt-8 pt-8 border-t border-[rgba(212,168,83,0.2)]">
            <VerdictDisplay
              verdict={verdict}
              leftPosition={debateConfig.left.position}
              rightPosition={debateConfig.right.position}
            />
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
