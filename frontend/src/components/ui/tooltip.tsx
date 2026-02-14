import * as React from 'react'
import { cn } from '@/lib/utils'

export function Tooltip({
  children,
  content,
  className,
}: {
  children: React.ReactNode
  content: React.ReactNode
  className?: string
}) {
  const [show, setShow] = React.useState(false)
  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <span className="absolute bottom-full left-1/2 z-50 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-surface-hover px-2 py-1 text-xs text-text-primary shadow">
          {content}
        </span>
      )}
    </span>
  )
}
