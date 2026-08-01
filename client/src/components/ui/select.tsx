
'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  label: string
  value: string
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  label?: string
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  name?: string
  required?: boolean
}

export function Select({
  options,
  value,
  onChange,
  label,
  placeholder,
  error,
  disabled = false,
  className = '',
  name,
  required = false,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          className={`
            appearance-none border rounded-lg px-3 py-2 pr-9 w-full text-sm text-slate-900
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-gray-50
            transition-colors bg-white
            ${error ? 'border-red-400' : 'border-gray-200'}
            ${className}
          `}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}

export default Select