import { Fragment, useEffect, useRef, useState } from 'react'

type Step = {
  label: string
  detail: string
  ai?: boolean
}

const STEPS: Step[] = [
  { label: 'Signal', detail: 'A live burst lands on sweep.' },
  { label: 'No handler', detail: 'Nothing in memory fits yet.' },
  { label: 'Query', detail: 'Bit asks the open registry.', ai: true },
  { label: 'Module', detail: 'A signed decoder rises up.' },
  { label: 'Verify', detail: 'Signature check passes.', ai: true },
  { label: 'Install', detail: 'Only the needed pieces land.' },
  { label: 'Ready', detail: 'Added to the pocket playbook.' },
]

export default function LearningFlow() {
  const sectionRef = useRef<HTMLElement | null>(null)
  const [inView, setInView] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!inView) return
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % STEPS.length)
    }, 900)
    return () => window.clearInterval(timer)
  }, [inView])

  return (
    <section ref={sectionRef}>
      <div className="mb-8 flex flex-col gap-2">
        <span className="label-cyan">How Bit learns</span>
        <h2 className="max-w-[20ch] font-display text-[2.6rem] uppercase leading-[0.95] sm:text-[3.4rem]">
          Bit doesn&apos;t know everything. Bit knows how to learn.
        </h2>
      </div>

      <div className="flex flex-col gap-2 lg:flex-row lg:items-stretch lg:gap-0">
        {STEPS.map((step, index) => {
          const isComplete = index < activeStep
          const isActive = index === activeStep
          const connectorLive = activeStep > index

          const base = 'flex-1 border-2 p-3 transition-colors duration-150'
          const tone = isActive
            ? 'border-amber bg-amber text-ink'
            : isComplete
              ? 'border-amber bg-amber/10 text-amber'
              : step.ai
                ? 'border-cyan/70 bg-ink text-cyan'
                : 'border-amber/40 bg-ink text-amber/80'

          return (
            <Fragment key={step.label}>
              <div className={`${base} ${tone}`}>
                <div className="flex items-center justify-between">
                  <span className="font-display text-[0.85rem] uppercase tracking-[0.2em] opacity-70">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {step.ai ? (
                    <span className={`font-display text-[0.8rem] uppercase tracking-[0.2em] ${isActive ? 'text-ink' : 'text-cyan'}`}>
                      AI
                    </span>
                  ) : null}
                </div>
                <div className="mt-1 font-display text-[1.6rem] uppercase leading-none sm:text-[1.8rem]">
                  {step.label}
                </div>
                <p className={`mt-2 text-[0.72rem] uppercase leading-5 tracking-[0.1em] ${isActive ? 'text-ink/80' : 'opacity-80'}`}>
                  {step.detail}
                </p>
              </div>

              {index < STEPS.length - 1 ? (
                <>
                  <div className={`flow-line-v mx-auto h-6 w-1 lg:hidden ${connectorLive ? 'is-live' : ''}`} />
                  <div className={`flow-line hidden h-1 w-6 self-center lg:block ${connectorLive ? 'is-live' : ''}`} />
                </>
              ) : null}
            </Fragment>
          )
        })}
      </div>
    </section>
  )
}
