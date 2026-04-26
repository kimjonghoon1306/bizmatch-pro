import { NextRequest, NextResponse } from 'next/server'

function removeNonKorean(text: string): string {
  const markers = ['[FAQ시작]','[FAQ끝]','[참고자료시작]','[참고자료끝]','[관련글시작]','[관련글끝]','[팁]','[주의]','[중요]']
  const placeholders: [string, string][] = markers.map((m, i) => [`XSECMARK${i}X`, m])
  placeholders.forEach(([key, val]) => { text = text.split(val).join(key) })
  const h2Lines: string[] = []
  text = text.replace(/^## .+$/gm, (match) => {
    const idx = h2Lines.length; h2Lines.push(match)
    return 'XH2LINE' + idx + 'X'
  })
  text = text
    .replace(/[一-鿿㐀-䶿]/g, '')
    .replace(/[\u3040-\u30FF]/g, '')
    .replace(/\*{2,}/g, '')
    .replace(/^#{3,}\s+/gm, '')
    .replace(/^[-*]\s+/gm, '')
    .replace(/^\d+\.\s+/gm, '')
    .replace(/_{2,}/g, '')
    .replace(/ {2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
  h2Lines.forEach((line, idx) => { text = text.split('XH2LINE' + idx + 'X').join(line) })
  placeholders.forEach(([key, val]) => { text = text.split(key).join(val) })
  return text
}

const GEMINI_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.0-flash-exp',
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
]

export async function POST(req: NextRequest) {
  const { provider, apiKey, keyword, title, language = 'ko', minChars = 1500, stylePrompt = '', adPlatform = '' } = await req.json()

  if (!provider || !apiKey || !keyword) {
    return NextResponse.json({ error: '필수 파라미터 누락' }, { status: 400 })
  }

  const langMap: Record<string, string> = { ko: '한국어', en: 'English', ja: '日本語', zh: '中文' }
  const langLabel = langMap[language] || '한국어'
  const targetChars = parseInt(String(minChars)) || 1500
  const maxTokens = 8000

  const titleInstruction = title
    ? `글 제목은 반드시 "${title}" 으로 시작해줘.`
    : `글 제목은 키워드 "${keyword}"를 포함한 클릭률 높은 제목으로 만들어줘.`

  const adGuide = adPlatform === 'adsense'
    ? '구글 애드센스 CPC 최적화: 클릭 유도 문구, 정보성 키워드 밀도 높게'
    : adPlatform === 'adpost'
    ? '네이버 애드포스트 CPM 최적화: 체류 시간 늘리는 스토리 구성, 감성적 공감 유도'
    : '애드센스/애드포스트 통합 최적화'

  const styleGuide = stylePrompt ? `\n[글쓰기 스타일]\n${stylePrompt}` : ''

  const prompt = `당신은 대한민국 최고의 블로그 작가입니다.

키워드: "${keyword}"
${titleInstruction}
언어: ${langLabel}
목표 글자수: ${targetChars}자 이상
수익 최적화: ${adGuide}

[필수 원칙]
① AI 티 절대 금지: 자연스러운 표현 사용
② 구체적 정보: 실제 가격, 수치, 날짜 포함
③ 소제목: 반드시 ## 소제목 형식 4~6개
④ SEO: 키워드 7회 이상 자연스럽게
⑤ 중요 문장에 [팁] [주의] [중요] 마커 3~5회

[형식 규칙]
- ** 별표 강조 금지
- - 대시 목록 금지
- 한자/일본어/중국어 절대 금지${styleGuide}

본문 완성 후 아래 섹션 반드시 추가:

[FAQ시작]
Q1: (질문)
A1: (답변)
Q2: (질문)
A2: (답변)
Q3: (질문)
A3: (답변)
[FAQ끝]

[참고자료시작]
LINK1: (사이트명)|(설명)|(https://공식URL)
LINK2: (사이트명)|(설명)|(https://공식URL)
LINK3: (사이트명)|(설명)|(https://공식URL)
[참고자료끝]

[관련글시작]
POST1: (연관 주제 제목)|(이유)
POST2: (연관 주제 제목)|(이유)
POST3: (연관 주제 제목)|(이유)
[관련글끝]`

  try {
    // ── Gemini ──
    if (provider === 'gemini') {
      let lastError = ''
      for (const model of GEMINI_MODELS) {
        try {
          const resp = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: Math.min(maxTokens, 8192) },
              }),
            }
          )
          if (!resp.ok) {
            const err = await resp.json().catch(() => ({}))
            const msg = (err.error?.message || '').toLowerCase()
            if (msg.includes('api key') || msg.includes('api_key') || resp.status === 403) {
              return NextResponse.json({ error: 'Gemini API 키가 잘못되었습니다.' }, { status: 400 })
            }
            lastError = `${model} 오류(${resp.status})`
            continue
          }
          const data = await resp.json()
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
          if (!text) { lastError = `${model} 빈 응답`; continue }
          return NextResponse.json({ content: removeNonKorean(text) })
        } catch (e: unknown) {
          lastError = e instanceof Error ? e.message : String(e)
          continue
        }
      }
      return NextResponse.json({ error: `Gemini 한도 초과 (${lastError}). Groq로 전환해주세요.` }, { status: 500 })
    }

    // ── Groq ──
    if (provider === 'groq') {
      const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: '당신은 한국어 블로그 전문 작가입니다.' },
            { role: 'user', content: prompt },
          ],
          max_tokens: Math.min(maxTokens, 8000),
          temperature: 0.7,
        }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        return NextResponse.json({ error: `Groq 오류: ${resp.status} ${err.error?.message || ''}` }, { status: 500 })
      }
      const data = await resp.json()
      return NextResponse.json({ content: removeNonKorean(data.choices?.[0]?.message?.content || '') })
    }

    // ── OpenAI ──
    if (provider === 'openai') {
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
        }),
      })
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}))
        return NextResponse.json({ error: `OpenAI 오류: ${resp.status} ${err.error?.message || ''}` }, { status: 500 })
      }
      const data = await resp.json()
      return NextResponse.json({ content: removeNonKorean(data.choices?.[0]?.message?.content || '') })
    }

    return NextResponse.json({ error: '지원하지 않는 AI입니다' }, { status: 400 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : '서버 오류' }, { status: 500 })
  }
}

