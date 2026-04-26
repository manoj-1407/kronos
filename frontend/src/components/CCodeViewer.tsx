import { useEffect, useRef } from 'react'
import { Code2 } from 'lucide-react'
import hljs from 'highlight.js/lib/core'
import c from 'highlight.js/lib/languages/c'
import { C_CODE } from '../lib/ccode'

hljs.registerLanguage('c', c)

interface Props {
  algorithm: string
  label?: string
}

export default function CCodeViewer({ algorithm, label }: Props) {
  const ref = useRef<HTMLElement>(null)
  const code = C_CODE[algorithm.toLowerCase().replace(/[\s()]/g, '_').replace(/\(np\)/,'').replace(/\(p\)/,'_p')]
    ?? C_CODE[algorithm.toLowerCase()]
    ?? `// C implementation for ${algorithm}\n// Coming soon...`

  useEffect(() => {
    if (ref.current) {
      ref.current.removeAttribute('data-highlighted')
      hljs.highlightElement(ref.current)
    }
  }, [algorithm])

  return (
    <div className="kronos-card flex flex-col" style={{ minHeight: 0 }}>
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        <Code2 size={14} style={{ color: 'var(--cyan)' }} />
        <span className="text-xs font-mono tracking-wide" style={{ color: 'var(--text-3)' }}>
          C IMPLEMENTATION — {label ?? algorithm.toUpperCase()}
        </span>
      </div>

      {/* Traffic lights */}
      <div className="flex items-center gap-1.5 mb-3">
        <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
        <div className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
        <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-3)' }}>
          {algorithm.toLowerCase()}.c
        </span>
      </div>

      <div
        className="overflow-auto rounded-md p-4 flex-1"
        style={{ background: 'var(--void)', border: '1px solid var(--border)', minHeight: 180 }}
      >
        <pre className="m-0">
          <code ref={ref} className="language-c code-block">
            {code}
          </code>
        </pre>
      </div>

      <p className="mt-2 text-xs font-mono" style={{ color: 'var(--text-3)' }}>
        ↑ This is what the visualizer animates — live C logic
      </p>
    </div>
  )
}
