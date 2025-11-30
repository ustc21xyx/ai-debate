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

    // 构建请求 URL
    const url = type === 'anthropic'
      ? `${baseUrl}/v1/models`
      : `${baseUrl}/v1/models`

    // 构建请求头
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (type === 'anthropic') {
      headers['x-api-key'] = apiKey
      headers['anthropic-version'] = '2023-06-01'
    } else {
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
    return NextResponse.json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
