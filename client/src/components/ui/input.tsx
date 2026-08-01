
'use client'

import React from 'react'

interface InputProps {
  label?: string
  placeholder?: string
  error?: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  disabled?: boolean
  className?: string
  name?: string
  required?: boolean
  min?: string | number
}

export function Input({
  label,
  placeholder,
  error,
  type = 'text',
  value,
  onChange,
  disabled = false,
  className = '',
  name,
  required = false,
  min,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        min={min}
        className={`
          border rounded-lg px-3 py-2 w-full text-sm text-slate-900
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50
          transition-colors
          ${error ? 'border-red-400' : 'border-gray-200'}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Input