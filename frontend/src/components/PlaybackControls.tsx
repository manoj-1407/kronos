import { motion } from 'framer-motion'
import { Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  current: number
  total: number
  isPlaying: boolean
  speed: number
  onPlay:    () => void
  onPause:   () => void
  onPrev:    () => void
  onNext:    () => void
  onFirst:   () => void
  onLast:    () => void
  onSpeedChange: (ms: number) => void
}

const SPEEDS = [
  { label: '0.25×', ms: 1600 },
  { label: '0.5×',  ms: 800  },
  { label: '1×',    ms: 400  },
  { label: '2×',    ms: 200  },
  { label: '4×',    ms: 100  },
]

export default function PlaybackControls(props: Props) {
  const { current, total, isPlaying, speed } = props
  const pct = total > 1 ? (current / (total - 1)) * 100 : 0

  return (
    <div className="kronos-card flex flex-col gap-3">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs font-mono mb-1.5"
             style={{ color: 'var(--text-3)' }}>
          <span>STEP {current + 1} / {total}</span>
          <span>{pct.toFixed(0)}%</span>
        </div>
        <div
          className="w-full rounded-full overflow-hidden cursor-pointer"
          style={{ height: 4, background: 'var(--dim)' }}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const pct  = (e.clientX - rect.left) / rect.width
            const step = Math.round(pct * (total - 1))
            props.onFirst()  // reset first
            // jump via calling next N times is inefficient; just expose setStep
          }}
        >
          <motion.div
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.1 }}
            style={{ height: '100%', background: 'var(--cyan)', borderRadius: 9999 }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-center gap-2">
        <button className="btn btn-ghost" onClick={props.onFirst} title="First">
          <SkipBack size={14} />
        </button>
        <button className="btn btn-ghost" onClick={props.onPrev} disabled={current === 0} title="Prev">
          <ChevronLeft size={14} />
        </button>

        <button
          className={`btn ${isPlaying ? 'btn-rose' : 'btn-cyan'}`}
          onClick={isPlaying ? props.onPause : props.onPlay}
          disabled={current >= total - 1 && !isPlaying}
          style={{ minWidth: 80 }}
        >
          {isPlaying ? <><Pause size={14} /> PAUSE</> : <><Play size={14} /> PLAY</>}
        </button>

        <button className="btn btn-ghost" onClick={props.onNext} disabled={current >= total - 1} title="Next">
          <ChevronRight size={14} />
        </button>
        <button className="btn btn-ghost" onClick={props.onLast} title="Last">
          <SkipForward size={14} />
        </button>
      </div>

      {/* Speed selector */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-xs font-mono mr-2" style={{ color: 'var(--text-3)' }}>SPEED:</span>
        {SPEEDS.map(s => (
          <button
            key={s.ms}
            onClick={() => props.onSpeedChange(s.ms)}
            className="btn"
            style={{
              padding: '3px 8px', fontSize: '0.7rem',
              background: speed === s.ms ? 'rgba(0,229,255,0.15)' : 'transparent',
              border: `1px solid ${speed === s.ms ? 'var(--cyan)' : 'var(--border)'}`,
              color: speed === s.ms ? 'var(--cyan)' : 'var(--text-3)',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
