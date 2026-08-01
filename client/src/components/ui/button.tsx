
'use client'

import React from 'react'
import Loader from './loader'

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  disabled?: boolean
  onClick?: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

const variantClasses: Record<string, string> = {
  primary: 'bg-emerald-600 text-white hover:bg-emerald-700 border border-transparent',
  outline: 'border border-emerald-600 text-emerald-600 hover:bg-emerald-50 bg-transparent',
  ghost: 'bg-transparent text-slate-700 hover:bg-gray-100 border border-transparent',
  danger: 'bg-red-500 text-white hover:bg-red-600 border border-transparent',
}

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-lg',
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  onClick,
  children,
  className = '',
  type = 'button',
}: ButtonProps) {
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium transition-colors
        focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2
        disabled:opacity-60 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {isLoading && (
        <Loader
          size={size === 'lg' ? 'md' : 'sm'}
          color={variant === 'primary' || variant === 'danger' ? 'white' : undefined}
        />
      )}
      {children}
    </button>
  )
}

export default Button