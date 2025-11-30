import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { baseUrl, apiKey, type } = await request.json()

    if (!baseUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Missing baseUrl or apiKey' },
        { status: 400 }
      )
    }

    let url: string
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (type === 'gemini') {
      // Gemini API format
      url = `${baseUrl}/v1beta/models?key=${apiKey}`
    } else if (type === 'anthropic') {
      url = `${baseUrl}/v1/models`
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
    } else {
      // OpenAI compatible
      url = `${baseUrl}/v1/models`
      headers['Authorization'] = `Bearer ${apiKey}`
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
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
    if (type === 'gemini') {
      // Gemini returns { models: [...] }
      const models = (data.models || []).map((m: { name: string; displayName?: string }) => ({
        id: m.name.replace('models/', ''),
        display_name: m.displayName || m.name.replace('models/', ''),
      }))
      return NextResponse.json({ data: models })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
