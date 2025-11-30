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

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    let url: string
    let body: Record<string, unknown>

    if (type === 'gemini') {
      // Gemini API format
      const endpoint = stream ? 'streamGenerateContent' : 'generateContent'
      url = `${baseUrl}/v1beta/models/${model}:${endpoint}?key=${apiKey}${stream ? '&alt=sse' : ''}`

      // Convert messages to Gemini format
      const systemMessage = messages.find((m: { role: string }) => m.role === 'system')
      const otherMessages = messages.filter((m: { role: string }) => m.role !== 'system')

      const contents = otherMessages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

      body = {
        contents,
        generationConfig: {
          maxOutputTokens: 4096,
        },
        ...(systemMessage && {
          systemInstruction: {
            parts: [{ text: systemMessage.content }],
          },
        }),
      }
    } else if (type === 'anthropic') {
      url = `${baseUrl}/v1/messages`
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'

      // Convert messages to Anthropic format
      const systemMessage = messages.find((m: { role: string }) => m.role === 'system')
      const otherMessages = messages.filter((m: { role: string }) => m.role !== 'system')

      body = {
        model,
        max_tokens: 4096,
        stream,
        messages: otherMessages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
        ...(systemMessage && { system: systemMessage.content }),
      }
    } else {
      // OpenAI compatible format
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

      // Create a TransformStream to process the SSE data
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          const text = decoder.decode(chunk)
          const lines = text.split('\n')

          for (const line of lines) {
            if (!line.trim() || line.startsWith(':')) continue

            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              if (data === '[DONE]') {
                controller.enqueue(encoder.encode('data: [DONE]\n\n'))
                continue
              }

              try {
                const json = JSON.parse(data)
                let content = ''

                if (type === 'gemini') {
                  // Gemini streaming format
                  content = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
                } else if (type === 'anthropic') {
                  // Anthropic streaming format
                  if (json.type === 'content_block_delta') {
                    content = json.delta?.text || ''
                  }
                } else {
                  // OpenAI streaming format
                  content = json.choices?.[0]?.delta?.content || ''
                }

                if (content) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content })}\n\n`))
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        },
      })

      const readable = response.body?.pipeThrough(transformStream)

      return new NextResponse(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      })
    } else {
      // Non-streaming response
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

      // Normalize response format
      let content: string
      if (type === 'gemini') {
        content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
      } else if (type === 'anthropic') {
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
