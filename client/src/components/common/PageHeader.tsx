
import React, { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle?: string
  description?: string
  action?: ReactNode
}

export default function PageHeader({ title, subtitle, description, action }: PageHeaderProps) {
  const supportingText = subtitle ?? description

  return (
    <div className="flex items-start justify-between border-b border-gray-200 pb-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {supportingText && <p className="text-sm text-slate-500 mt-1">{supportingText}</p>}
      </div>
      {action && <div className="ml-4 flex-shrink-0">{action}</div>}
    </div>
  )
}
