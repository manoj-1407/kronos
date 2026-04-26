import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface Props {
  label: string
  value: string | number
  unit?: string
  color?: string
  icon?: ReactNode
  delay?: number
  small?: boolean
}

export default function StatCard({ label, value, unit, color = 'var(--cyan)', icon, delay = 0, small }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="kronos-card flex flex-col gap-1"
    >
      <div className="flex items-center gap-2">
        {icon && <span style={{ color }}>{icon}</span>}
        <span className="text-xs font-mono tracking-wide" style={{ color: 'var(--text-3)' }}>
          {label}
        </span>
      </div>
      <div className={`font-display font-bold tabular-nums ${small ? 'text-xl' : 'text-2xl'}`} style={{ color }}>
        {value}
        {unit && <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-3)' }}>{unit}</span>}
      </div>
    </motion.div>
  )
}
