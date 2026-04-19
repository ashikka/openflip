import { useEffect, useState } from 'react'

export type BitState = 'idle' | 'scanning' | 'installing' | 'excited' | 'sleeping'

type BitProps = {
  state: BitState
  size?: number
  className?: string
}

type MotionFrame = {
  x: number
  y: number
  rotate: number
  tail: number
}

const FRAMES: Record<BitState, MotionFrame[]> = {
  idle: [
    { x: 0, y: 0, rotate: 0, tail: 0 },
    { x: 0, y: -0.5, rotate: -1, tail: -1 },
    { x: 0, y: 0, rotate: 0, tail: 0 },
    { x: 0, y: 0.5, rotate: 1, tail: 1 },
  ],
  scanning: [
    { x: 0, y: 0, rotate: -4, tail: -1 },
    { x: 0.4, y: -0.4, rotate: -2, tail: 0 },
    { x: 0.2, y: 0, rotate: 2, tail: 1 },
    { x: -0.4, y: 0.4, rotate: 4, tail: 0 },
  ],
  installing: [
    { x: 0, y: 0, rotate: 0, tail: -1 },
    { x: 0, y: -0.4, rotate: 0, tail: 0 },
    { x: 0, y: 0.2, rotate: 0, tail: 1 },
    { x: 0, y: -0.2, rotate: 0, tail: 0 },
  ],
  excited: [
    { x: -0.4, y: 0, rotate: -2, tail: 1 },
    { x: 0.6, y: -0.2, rotate: 2, tail: -1 },
    { x: -0.4, y: 0.3, rotate: -2, tail: 1 },
    { x: 0.6, y: -0.1, rotate: 2, tail: -1 },
  ],
  sleeping: [
    { x: 0, y: 0.6, rotate: 0, tail: 0 },
    { x: 0, y: 0.9, rotate: 0, tail: 0 },
    { x: 0, y: 0.6, rotate: 0, tail: 0 },
    { x: 0, y: 0.8, rotate: 0, tail: 0 },
  ],
}

export default function Bit({ state, size = 128, className }: BitProps) {
  const [frame, setFrame] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrame((current) => (current + 1) % 4)
    }, 180)

    return () => window.clearInterval(timer)
  }, [state])

  const motion = FRAMES[state][frame]
  const pulseOpacity =
    state === 'installing' ? [0.2, 0.45, 0.72, 0.45][frame] : state === 'excited' ? 0.26 : 0.12

  return (
    <div className={className} style={{ width: size, height: size }}>
      <svg
        viewBox="0 0 32 32"
        className={`h-full w-full ${state === 'installing' ? 'screen-flash' : ''}`}
        style={{ imageRendering: 'pixelated' }}
        aria-hidden="true"
      >
        <g transform={`translate(${motion.x} ${motion.y}) rotate(${motion.rotate} 16 16)`}>
          <path
            d="M6 17V13H8V11H12V9H20V10H23V12H26V15H27V18H26V20H24V22H21V24H17V25H11V23H9V21H7V19H6Z"
            fill="#2A1503"
          />
          <path
            d="M8 15V13H10V12H12V11H19V12H22V14H24V17H23V19H21V20H18V22H13V21H10V19H9V17H8Z"
            fill="#4B2500"
          />
          <path
            d="M6 17V13H8V11H12V9H20V10H23V12H26V15H27V18H26V20H24V22H21V24H17V25H11V23H9V21H7V19H6Z"
            fill="none"
            stroke="#FF8200"
            strokeWidth="1"
            strokeLinejoin="miter"
            shapeRendering="crispEdges"
          />
          <path d={`M4 ${16 + motion.tail}H6V18H4V20H3V18H2V16H3V14H4Z`} fill="#FF8200" />
          <path d="M12 8H14V7H17V8H19V9H12Z" fill="#FF8200" />
          <path d="M19 4H20V2H21V4H23V5H20V6H19Z" fill="#FF8200" />
          <path d="M18 8H19V6H20V5H21V6H22V7H20V8Z" fill="#00E5FF" />

          <path d="M14 11H16V12H18V13H19V15H18V17H17V18H15V17H14V15H15V13H14Z" fill="#00E5FF" opacity={pulseOpacity} />
          <path d="M14 11H17V12H15V14H18V15H16V17H19V18H16V20H15V18H14V17H15V15H14Z" fill="#00E5FF" opacity="0.82" />

          {state === 'sleeping' ? (
            <path d="M10 14H13V15H10Z" fill="#FF8200" />
          ) : (
            <>
              <path d={state === 'excited' ? 'M10 13H13V16H10Z' : 'M11 13H13V15H11Z'} fill="#0A0A0A" />
              <path d={state === 'excited' ? 'M11 14H12V15H11Z' : 'M12 14H13V15H12Z'} fill="#FFA940" />
            </>
          )}

          {state === 'sleeping' ? (
            <path d="M17 14H21V15H17Z" fill="#00E5FF" />
          ) : (
            <g className="reticle-spin" transform="translate(17 13)">
              <rect width={state === 'excited' ? 4 : 3} height={state === 'excited' ? 4 : 3} fill="#00E5FF" />
              <path d="M1.5 -1V0M1.5 3V4M-1 1.5H0M3 1.5H4" stroke="#00E5FF" strokeWidth="0.7" />
            </g>
          )}

          <path d="M22 14H24V15H22Z" fill="#FF8200" />
          <path d="M20 20H22V21H20Z" fill="#FF8200" />
        </g>

        {state === 'sleeping' ? (
          <g transform={`translate(${20 + frame} ${4 - frame * 0.6})`} fill="#FFA940">
            <path d="M0 0H4V1H2V2H4V3H0V2H2V1H0Z" />
            <path d="M5 2H8V3H6V4H8V5H5V4H6V3H5Z" opacity="0.75" />
          </g>
        ) : null}
      </svg>
    </div>
  )
}
