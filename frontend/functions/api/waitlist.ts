interface D1Statement {
  bind: (...values: Array<string | null>) => {
    run: () => Promise<unknown>
  }
  first: <T>() => Promise<T | null>
}

interface Env {
  DB: {
    prepare: (query: string) => D1Statement
  }
  IP_SALT: string
}

type PagesContext = {
  request: Request
  env: Env
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  })
}

function getVisitorIp(request: Request) {
  const header = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for')

  if (!header) {
    return null
  }

  return header.split(',')[0]?.trim() || null
}

function normalizeSource(value: unknown) {
  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 2048) : null
}

async function hashIp(ip: string, salt: string) {
  const input = new TextEncoder().encode(`${salt}:${ip}`)
  const digest = await crypto.subtle.digest('SHA-256', input)

  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, '0'))
    .join('')
}

export const onRequestPost = async ({ request, env }: PagesContext) => {
  let payload: { email?: unknown; source?: unknown }

  try {
    payload = await request.json()
  } catch {
    return json({ error: 'Invalid request body' }, { status: 400 })
  }

  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''

  if (!EMAIL_PATTERN.test(email)) {
    return json({ error: 'Invalid email' }, { status: 400 })
  }

  const source = normalizeSource(payload.source)
  const userAgent = request.headers.get('user-agent')
  const visitorIp = getVisitorIp(request)
  const ipHash = visitorIp ? await hashIp(visitorIp, env.IP_SALT) : null

  try {
    await env.DB.prepare(
      'INSERT INTO waitlist (email, source, ip_hash, user_agent) VALUES (?, ?, ?, ?)',
    )
      .bind(email, source, ipHash, userAgent)
      .run()
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)

    if (message.toLowerCase().includes('unique')) {
      return json({ error: 'Already on the list', duplicate: true }, { status: 409 })
    }

    return json({ error: 'Failed to join waitlist' }, { status: 500 })
  }

  const result = await env.DB.prepare('SELECT COUNT(*) AS count FROM waitlist').first<{
    count: number | string
  }>()

  return json({
    success: true,
    position: Number(result?.count ?? 0),
  })
}
