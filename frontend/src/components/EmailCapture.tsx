import { useState, type FormEvent } from 'react'
import { usePostHog } from '@posthog/react'

export type WaitlistSuccess = {
  position: number
}

type Status = {
  tone: 'success' | 'error'
  message: string
}

type EmailCaptureProps = {
  buttonLabel: string
  onSuccess?: (result: WaitlistSuccess) => void
  className?: string
  successLabel?: string
  analyticsSource: 'hero' | 'footer'
}

function buildSource() {
  const params = new URLSearchParams(window.location.search)
  const source = new URLSearchParams()

  const utmSource = params.get('utm_source')
  const utmCampaign = params.get('utm_campaign')

  if (utmSource) source.set('utm_source', utmSource)
  if (utmCampaign) source.set('utm_campaign', utmCampaign)
  if (document.referrer) source.set('referrer', document.referrer)
  if (![...source.keys()].length) source.set('source', 'direct')

  return source.toString()
}

export default function EmailCapture({
  buttonLabel,
  onSuccess,
  className,
  successLabel,
  analyticsSource,
}: EmailCaptureProps) {
  const posthog = usePostHog()
  const [email, setEmail] = useState('')
  const [pending, setPending] = useState(false)
  const [status, setStatus] = useState<Status | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.trim()) {
      setStatus({ tone: 'error', message: 'Enter an email first.' })
      return
    }

    setPending(true)
    setStatus(null)

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: buildSource() }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean
        position?: number
        error?: string
        duplicate?: boolean
      }

      if (!response.ok) {
        if (payload.duplicate) {
          posthog?.capture('waitlist_duplicate', { location: analyticsSource })
          setStatus({ tone: 'error', message: 'Already on the list.' })
          return
        }

        posthog?.capture('waitlist_failed', {
          location: analyticsSource,
          reason: payload.error ?? 'unknown',
        })
        setStatus({
          tone: 'error',
          message: payload.error ?? 'Transmission failed.',
        })
        return
      }

      const position = Number(payload.position ?? 0)
      posthog?.capture('waitlist_submitted', { location: analyticsSource, position })
      setEmail('')
      setStatus({
        tone: 'success',
        message: successLabel ?? `You are #${position.toLocaleString()} in the pod.`,
      })
      onSuccess?.({ position })
    } catch {
      posthog?.capture('waitlist_failed', { location: analyticsSource, reason: 'network' })
      setStatus({ tone: 'error', message: 'Link down. Try again.' })
    } finally {
      setPending(false)
    }
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Email</span>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@domain.com"
            className="field"
          />
        </label>

        <button type="submit" disabled={pending} className="btn whitespace-nowrap sm:min-w-[12rem]">
          {pending ? 'Joining…' : buttonLabel}
        </button>
      </form>

      {status ? (
        <p
          aria-live="polite"
          className={`mt-2 font-display text-[1rem] tracking-[-0.01em] ${
            status.tone === 'success' ? 'text-cyan' : 'text-highlight'
          }`}
        >
          {status.message}
        </p>
      ) : null}
    </div>
  )
}
