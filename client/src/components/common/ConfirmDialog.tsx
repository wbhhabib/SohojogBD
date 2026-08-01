
'use client'

import React from 'react'
import Modal from '@/components/ui/modal'
import Button from '@/components/ui/button'

interface ConfirmDialogProps {
  isOpen?: boolean
  open?: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
}

export default function ConfirmDialog({
  isOpen,
  open,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
}: ConfirmDialogProps) {
  const visible = isOpen ?? open ?? false
  const handleClose = onClose ?? onCancel ?? (() => {})
  const handleConfirm = async () => {
    await onConfirm()
    handleClose()
  }

  return (
    <Modal isOpen={visible} onClose={handleClose} title={title} size="sm">
      <p className="text-sm text-slate-600 mb-6">{description}</p>
      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" size="sm" onClick={handleClose}>
          {cancelLabel}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={handleConfirm}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
