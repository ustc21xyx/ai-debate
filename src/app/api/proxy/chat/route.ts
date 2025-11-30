import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { baseUrl, apiKey, type, model, messages, stream = false } = await request.json()

    if (!baseUrl || !apiKey || !model || !messages) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    let url: string
    let body: Record<string, unknown>

    if (type === 'anthropic') {
      url = `${baseUrl}/v1/messages`
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'

      // 转换消息格式为 Anthropic 格式
      const systemMessage = messages.find((m: { role: string }) => m.role === 'system')
      const otherMessages = messages.filter((m: { role: string }) => m.role !== 'system')

      body = {
        model,
        max_tokens: 4096,
        messages: otherMessages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        ...(systemMessage && { system: systemMessage.content }),
      }
    } else {
      // OpenAI 兼容格式
      url = `${baseUrl}/v1/chat/completions`
      headers['Authorization'] = `Bearer ${apiKey}`

      body = {
        model,
        messages,
        max_tokens: 4096,
        stream,
      }
    }

    if (stream) {
      // 流式响应
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...body, stream: true }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: `API Error: ${response.status} - ${errorText}` },
          { status: response.status }
        )
      }

      // 返回流式响应
      return new NextResponse(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // 非流式响应
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text()
        return NextResponse.json(
          { error: `API Error: ${response.status} - ${errorText}` },
          { status: response.status }
        )
      }

      const data = await response.json()

      // 统一响应格式
      let content: string
      if (type === 'anthropic') {
        content = data.content?.[0]?.text || ''
      } else {
        content = data.choices?.[0]?.message?.content || ''
      }

      return NextResponse.json({ content })
    }
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
