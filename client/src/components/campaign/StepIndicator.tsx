
import React from 'react'
import { Check, Sparkles } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number
  steps: string[]
}

const STEP_COLORS = [
  { active: 'from-rose-500 to-orange-400' },
  { active: 'from-amber-500 to-yellow-400' },
  { active: 'from-violet-500 to-purple-400' },
]
const STEP_ICONS = ['🎯', '📖', '🖼️']

export default function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  return (
    <div className="flex items-start justify-between w-full px-1">
      {steps.map((label, i) => {
        const stepNum     = i + 1
        const isCompleted = stepNum < currentStep
        const isCurrent   = stepNum === currentStep
        const colors      = STEP_COLORS[i] ?? STEP_COLORS[0]

        return (
          <React.Fragment key={stepNum}>
            <div className="flex flex-col items-center gap-2 flex-shrink-0 min-w-[70px]">
              <div className="relative">
                {isCurrent && (
                  <div className={`absolute inset-0 rounded-full blur-sm opacity-40 scale-150 bg-gradient-to-br ${colors.active}`} />
                )}
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                  ${isCompleted || isCurrent
                    ? `bg-gradient-to-br ${colors.active} text-white shadow-lg`
                    : 'bg-white border-2 border-gray-200 text-gray-400'}`}>
                  {isCompleted ? <Check size={16} strokeWidth={3} />
                    : isCurrent ? <span className="text-base">{STEP_ICONS[i]}</span>
                    : <span className="text-sm font-bold text-gray-400">{stepNum}</span>}
                </div>
                {isCurrent && (
                  <span className="absolute -top-1 -right-1">
                    <Sparkles size={10} className="text-amber-400" />
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center gap-0.5">
                <span className={`text-[11px] font-semibold text-center leading-tight max-w-[72px]
                  ${isCurrent ? 'text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                  {label}
                </span>
                {isCompleted && <span className="text-[9px] text-emerald-500 font-bold">Done ✓</span>}
                {isCurrent && (
                  <span className="text-[9px] font-bold"
                    style={{ background: 'linear-gradient(90deg, #f43f5e, #fb923c)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    In progress
                  </span>
                )}
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className="flex-1 flex items-start pt-5 mx-1">
                <div className="w-full h-1 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500
                    ${stepNum < currentStep ? 'w-full bg-gradient-to-r from-emerald-400 to-teal-400' : 'w-0'}`} />
                </div>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}