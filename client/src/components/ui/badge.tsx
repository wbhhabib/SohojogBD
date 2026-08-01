
import React from 'react'

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'outline'
  children: React.ReactNode
  className?: string
}

const variantClasses: Record<string, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  outline: 'border border-gray-300 text-gray-600 bg-transparent',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}


export function campaignStatusVariant(status: string): BadgeProps['variant'] {
  const normalized = status.toLowerCase()
  const map: Record<string, BadgeProps['variant']> = {
    active:    'success',
    paused:    'warning',
    suspended: 'danger',
    draft:     'outline',
    completed: 'info',
    pending:   'warning',
    rejected:  'danger',
  }
  return map[normalized] ?? 'default'
}

export default Badge