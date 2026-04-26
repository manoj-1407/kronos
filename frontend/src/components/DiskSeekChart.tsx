import { motion } from 'framer-motion'
import type { DiskResult } from '../types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Props {
  result: DiskResult
  currentStep: number
}

const CustomDot = (props: any) => {
  const { cx, cy, payload } = props
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill="var(--void)"
      stroke="var(--cyan)"
      strokeWidth={2}
    />
  )
}

export default function DiskSeekChart({ result, currentStep }: Props) {
  const seq = result.seek_sequence.slice(0, currentStep + 1)

  const data = seq.map((pos, i) => ({
    step: i,
    position: pos,
    dist: i > 0 ? Math.abs(seq[i] - seq[i - 1]) : 0,
    label: i === 0 ? 'Start' : `${pos}`,
  }))

  const totalVisible = data.slice(1).reduce((s, d) => s + d.dist, 0)

  return (
    <div className="space-y-4">
      <div className="kronos-card">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
            DISK HEAD SEEK PATH — {result.algorithm}
          </span>
          <div className="flex gap-3">
            <span className="badge badge-amber">
              {totalVisible} CYLINDERS
            </span>
            <span className="badge badge-cyan">
              STEP {currentStep}/{result.seek_sequence.length - 1}
            </span>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="step"
              label={{ value: 'Request Order', position: 'insideBottom', offset: -2,
                       fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }}
              tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }}
            />
            <YAxis
              domain={[0, result.disk_size]}
              label={{ value: 'Cylinder', angle: -90, position: 'insideLeft',
                       fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }}
              tick={{ fill: 'var(--text-3)', fontSize: 11, fontFamily: 'Space Mono' }}
            />
            <Tooltip
              contentStyle={{ background: 'var(--panel)', border: '1px solid var(--border)', fontSize: 12, fontFamily: 'Space Mono' }}
              labelFormatter={(l) => `Request #${l}`}
              formatter={(v: any, n: string) => [v, n === 'position' ? 'Cylinder' : 'Distance']}
            />
            <Line
              type="linear"
              dataKey="position"
              stroke="var(--cyan)"
              strokeWidth={2}
              dot={<CustomDot />}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Seek sequence */}
      <div className="kronos-card">
        <div className="text-xs font-mono mb-3" style={{ color: 'var(--text-3)' }}>
          SEEK SEQUENCE
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          {result.seek_sequence.map((pos, i) => (
            <div key={i} className="flex items-center gap-1">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={i <= currentStep ? { opacity: 1, scale: 1 } : { opacity: 0.3, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                style={{
                  padding: '4px 10px',
                  background: i === currentStep
                    ? 'rgba(0,229,255,0.15)'
                    : i < currentStep
                    ? 'rgba(0,229,255,0.06)'
                    : 'var(--dim)',
                  border: `1px solid ${i <= currentStep ? 'rgba(0,229,255,0.4)' : 'var(--border)'}`,
                  borderRadius: 4,
                  fontFamily: '"Space Mono", monospace',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: i === 0 ? 'var(--amber)' : i <= currentStep ? 'var(--cyan)' : 'var(--text-3)',
                }}
              >
                {pos}
              </motion.div>
              {i < result.seek_sequence.length - 1 && (
                <span style={{ color: 'var(--text-3)', fontSize: 12 }}>→</span>
              )}
            </div>
          ))}
        </div>

        {currentStep > 0 && (
          <div className="mt-3 text-xs font-mono" style={{ color: 'var(--text-3)' }}>
            Last move:{' '}
            <span style={{ color: 'var(--amber)' }}>
              {result.seek_sequence[currentStep - 1]} → {result.seek_sequence[currentStep]}{' '}
              ({Math.abs(result.seek_sequence[currentStep] - result.seek_sequence[currentStep - 1])} cylinders)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
