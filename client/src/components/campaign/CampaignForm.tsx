
'use client'

import React from 'react'
import type { Campaign } from '@/lib/api'
import { Target, BookOpen, ImageIcon, Calendar, Tag, FileText, User, Heart, Lightbulb, CheckCircle2 } from 'lucide-react'

interface CampaignFormProps {
  step: 1 | 2 | 3
  formData: Partial<Campaign>
  onChange: (data: Partial<Campaign>) => void
}

const CATEGORIES = [
  { label: '📚 Education',        value: 'Education'      },
  { label: '❤️‍🩹 Medical',          value: 'Medical'        },
  { label: '🆘 Disaster Relief',  value: 'Disaster Relief'},
  { label: '🌿 Environment',      value: 'Environment'    },
  { label: '🐾 Animal Welfare',   value: 'Animal Welfare' },
  { label: '🤝 Community',        value: 'Community'      },
  { label: '🏠 Poverty',          value: 'Poverty'        },
  { label: '🎨 Arts',             value: 'Arts'           },
  { label: '⚽ Sports',           value: 'Sports'         },
  { label: '💡 Technology',       value: 'Technology'     },
  { label: '✨ Other',            value: 'Other'          },
]

const STEP_META = [
  { step: 1, icon: Target,    title: 'Campaign Basics',    subtitle: 'Define your goal, category, and timeline', color: 'text-emerald-600',  bg: 'bg-emerald-50',  border: 'border-emerald-200'  },
  { step: 2, icon: BookOpen,  title: 'Your Story',          subtitle: 'Share the heart behind your campaign',     color: 'text-amber-600',   bg: 'bg-amber-50',   border: 'border-amber-200'   },
  { step: 3, icon: ImageIcon, title: 'Media & Preview',     subtitle: 'Add photos to bring your campaign to life',color: 'text-violet-600',  bg: 'bg-violet-50',  border: 'border-violet-200'  },
]

function StepHeader({ step }: { step: 1 | 2 | 3 }) {
  const meta = STEP_META[step - 1]
  const Icon = meta.icon
  return (
    <div className={`flex items-start gap-3 ${meta.bg} border ${meta.border} rounded-2xl p-4 mb-2`}>
      <div className={`w-9 h-9 rounded-xl ${meta.bg} border ${meta.border} flex items-center justify-center flex-shrink-0`}>
        <Icon size={16} className={meta.color} />
      </div>
      <div>
        <h3 className="text-sm font-bold text-gray-900">{meta.title}</h3>
        <p className="text-xs text-gray-500 mt-0.5">{meta.subtitle}</p>
      </div>
    </div>
  )
}

function FieldGroup({ label, required, hint, icon: Icon, children, charCount, minChars }: {
  label: string; required?: boolean; hint?: string; icon?: React.ElementType
  children: React.ReactNode; charCount?: number; minChars?: number
}) {
  const filled = charCount !== undefined && minChars !== undefined ? charCount >= minChars : null
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
          {Icon && <Icon size={13} className="text-gray-400" />}
          {label}
          {required && <span className="text-emerald-600">*</span>}
        </label>
        {charCount !== undefined && minChars !== undefined && (
          <span className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${filled ? 'text-emerald-600' : 'text-gray-400'}`}>
            {filled && <CheckCircle2 size={11} />}
            {charCount} / {minChars} min
          </span>
        )}
      </div>
      {children}
      {hint && (
        <p className="text-[11px] text-gray-400 flex items-start gap-1 mt-0.5">
          <Lightbulb size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />{hint}
        </p>
      )}
    </div>
  )
}

const inputCls = `w-full border-2 border-gray-200 rounded-xl text-sm text-gray-900 bg-white
  placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400
  hover:border-gray-300 transition-all duration-200 px-4 py-2.5`

const textareaCls = `w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 bg-white
  placeholder:text-gray-400 leading-relaxed focus:outline-none focus:ring-2 focus:ring-emerald-200
  focus:border-emerald-400 hover:border-gray-300 resize-none transition-all duration-200`

export default function CampaignForm({ step, formData, onChange }: CampaignFormProps) {
  function handle(field: keyof Campaign, value: string | number) {
    onChange({ ...formData, [field]: value })
  }


  if (step === 1) return (
    <div className="flex flex-col gap-5">
      <StepHeader step={1} />

      <FieldGroup label="Campaign Title" required icon={FileText}
        hint="A clear, emotional title helps donors connect instantly.">
        <input placeholder="E.g. Flood Relief for Sylhet Families" value={formData.title ?? ''}
          onChange={(e) => handle('title', e.target.value)} className={inputCls} />
      </FieldGroup>

      <FieldGroup label="Category" required icon={Tag}
        hint="Choosing the right category helps the right donors find you.">
        <div className="relative">
          <select value={formData.category ?? ''} onChange={(e) => handle('category', e.target.value)}
            className={`${inputCls} appearance-none cursor-pointer`}>
            <option value="" disabled>Select a category…</option>
            {CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">▾</span>
        </div>
      </FieldGroup>

      <FieldGroup label="Fundraising Goal" required icon={Target}
        hint="Set a realistic goal. You can always increase it later.">
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold pointer-events-none">৳</span>
          <input type="number" min={1000} placeholder="500000" value={formData.goalAmount ?? ''}
            onChange={(e) => handle('goalAmount', Number(e.target.value))}
            className={`${inputCls} pl-9`} />
        </div>
      </FieldGroup>

      <FieldGroup label="Campaign Deadline" required icon={Calendar}
        hint="Give yourself enough time — 30 to 90 days works best.">
        <input type="date"
          value={formData.deadline ? formData.deadline.split('T')[0] : ''}
          min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
          onChange={(e) => handle('deadline', e.target.value)} className={inputCls} />
      </FieldGroup>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-amber-700 mb-2 flex items-center gap-1.5">
          <Lightbulb size={13} className="text-amber-500" />Tips for a great campaign
        </p>
        <ul className="space-y-1">
          {['Use a specific, emotional title','Set a realistic funding goal','Give yourself 30–90 days','Choose the most fitting category'].map(tip => (
            <li key={tip} className="text-[11px] text-amber-600 flex items-start gap-1.5">
              <CheckCircle2 size={10} className="text-amber-400 mt-0.5 flex-shrink-0" />{tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )


  if (step === 2) {
    const descLen      = (formData.description ?? '').length
    const storyLen     = (formData.story ?? '').length
    const benefInfoLen = (formData.beneficiaryInfo ?? '').length

    return (
      <div className="flex flex-col gap-5">
        <StepHeader step={2} />

        <FieldGroup label="Short Description" required icon={FileText} charCount={descLen} minChars={20}
          hint="This is shown on campaign cards — make every word count.">
          <textarea placeholder="A brief, powerful summary — 1 to 2 sentences that hook readers."
            value={formData.description ?? ''} onChange={(e) => handle('description', e.target.value)}
            rows={3} className={textareaCls} />
        </FieldGroup>

        <FieldGroup label="Your Story" required icon={Heart} charCount={storyLen} minChars={50}
          hint="Longer, detailed stories with specific details raise 3× more. Be vulnerable and honest.">
          <textarea placeholder="Share the full story — who needs help, why it matters, how funds will be used…"
            value={formData.story ?? ''} onChange={(e) => handle('story', e.target.value)}
            rows={8} className={textareaCls} />
        </FieldGroup>

        <FieldGroup label="Beneficiary Name" required icon={User}
          hint="Who will directly receive or benefit from this campaign?">
          <input placeholder="E.g. Flood victims of Sylhet, or a person's name"
            value={formData.beneficiaryName ?? ''} onChange={(e) => handle('beneficiaryName', e.target.value)}
            className={inputCls} />
        </FieldGroup>

        <FieldGroup label="Beneficiary Information" required icon={BookOpen} charCount={benefInfoLen} minChars={10}
          hint="Donors want transparency about where their money goes.">
          <textarea placeholder="Describe who benefits, their situation, and how funds reach them."
            value={formData.beneficiaryInfo ?? ''} onChange={(e) => handle('beneficiaryInfo', e.target.value)}
            rows={4} className={textareaCls} />
        </FieldGroup>

        {storyLen > 0 && (
          <div className={`rounded-xl p-3 border text-xs font-medium flex items-center gap-2 transition-all
            ${storyLen >= 200 ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : storyLen >= 100 ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            <span className="text-base">{storyLen >= 200 ? '🌟' : storyLen >= 100 ? '📝' : '✍️'}</span>
            {storyLen >= 200 ? `Great story length (${storyLen} chars)! This will build strong donor trust.`
              : storyLen >= 100 ? `Good start (${storyLen} chars). Adding more detail will improve donations.`
              : `Keep writing (${storyLen} chars). Aim for at least 200 characters.`}
          </div>
        )}
      </div>
    )
  }


  return (
    <div className="flex flex-col gap-4">
      <StepHeader step={3} />
      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4">
        <p className="text-xs font-bold text-violet-700 mb-2 flex items-center gap-1.5">
          <ImageIcon size={13} className="text-violet-500" />Why images matter
        </p>
        <ul className="space-y-1">
          {['Campaigns with photos raise 2× more','Use real, authentic photos — not stock images','First image becomes your campaign cover','You can upload up to 5 images'].map(tip => (
            <li key={tip} className="text-[11px] text-violet-600 flex items-start gap-1.5">
              <CheckCircle2 size={10} className="text-violet-400 mt-0.5 flex-shrink-0" />{tip}
            </li>
          ))}
        </ul>
      </div>
      <p className="text-xs text-gray-400 text-center py-2">Image upload area will appear below ↓</p>
    </div>
  )
}