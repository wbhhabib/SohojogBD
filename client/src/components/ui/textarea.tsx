
'use client'

import React from 'react'

interface TextareaProps {
  label?: string
  placeholder?: string
  error?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  disabled?: boolean
  className?: string
  name?: string
  required?: boolean
  rows?: number
}

export function Textarea({
  label,
  placeholder,
  error,
  value,
  onChange,
  disabled = false,
  className = '',
  name,
  required = false,
  rows = 4,
}: TextareaProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className={`
          border rounded-lg px-3 py-2 w-full text-sm text-slate-900
          placeholder:text-slate-400 resize-y
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

export default Textarea