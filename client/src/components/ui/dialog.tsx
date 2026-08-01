
'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import Button from './button'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  isConfirmLoading?: boolean
  confirmVariant?: 'primary' | 'danger'
}

const sizeClasses: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-xl',
}

export function Dialog({
  isOpen,
  onClose,
  title,
  children,
  size = 'sm',
  confirmLabel,
  cancelLabel = 'Cancel',
  onConfirm,
  isConfirmLoading = false,
  confirmVariant = 'primary',
}: DialogProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={`relative bg-white rounded-xl shadow-md w-full ${sizeClasses[size]}`}>
        <div className="flex items-center justify-between p-5 border-b border-gray-200">
          {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
          <button
            onClick={onClose}
            className="ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {(confirmLabel || cancelLabel) && (
          <div className="flex items-center justify-end gap-3 px-5 pb-5">
            <Button variant="ghost" size="sm" onClick={onClose}>
              {cancelLabel}
            </Button>
            {confirmLabel && onConfirm && (
              <Button
                variant={confirmVariant}
                size="sm"
                onClick={onConfirm}
                isLoading={isConfirmLoading}
              >
                {confirmLabel}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dialog