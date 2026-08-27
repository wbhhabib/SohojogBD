'use client'

import React, { ReactNode } from 'react'
import Link from 'next/link'
import { Sparkles, ArrowLeft, Mail } from 'lucide-react'
import Button from '@/components/ui/button'

export interface ComingSoonFeature {
    icon: ReactNode
    title: string
    description: string
}

interface ComingSoonProps {
    /** e.g. "আপনজন" */
    title: string
    /** small pill above the title, defaults to "শীঘ্রই আসছে" */
    eyebrow?: string
    /** one-line tagline shown right under the title */
    tagline: string
    /** short paragraph describing the feature */
    description: string
    icon: ReactNode
    features?: ComingSoonFeature[]
    /** e.g. "emerald" | "rose" | "sky" — controls the accent color */
    accent?: 'emerald' | 'rose' | 'sky' | 'amber'
}

const ACCENT_MAP = {
    emerald: {
        blobA: 'bg-emerald-100/60',
        blobB: 'bg-emerald-50/80',
        ring: 'border-emerald-100/40',
        ring2: 'border-emerald-100/30',
        iconBorder: 'border-emerald-100',
        iconText: 'text-emerald-600',
        pillBg: 'bg-emerald-100',
        pillText: 'text-emerald-700',
        pillBorder: 'border-emerald-200',
        highlight: 'text-emerald-600',
        divider: 'bg-emerald-200',
        cardIconBg: 'bg-emerald-50',
        cardIconText: 'text-emerald-600',
    },
    rose: {
        blobA: 'bg-rose-100/60',
        blobB: 'bg-rose-50/80',
        ring: 'border-rose-100/40',
        ring2: 'border-rose-100/30',
        iconBorder: 'border-rose-100',
        iconText: 'text-rose-600',
        pillBg: 'bg-rose-100',
        pillText: 'text-rose-700',
        pillBorder: 'border-rose-200',
        highlight: 'text-rose-600',
        divider: 'bg-rose-200',
        cardIconBg: 'bg-rose-50',
        cardIconText: 'text-rose-600',
    },
    sky: {
        blobA: 'bg-sky-100/60',
        blobB: 'bg-sky-50/80',
        ring: 'border-sky-100/40',
        ring2: 'border-sky-100/30',
        iconBorder: 'border-sky-100',
        iconText: 'text-sky-600',
        pillBg: 'bg-sky-100',
        pillText: 'text-sky-700',
        pillBorder: 'border-sky-200',
        highlight: 'text-sky-600',
        divider: 'bg-sky-200',
        cardIconBg: 'bg-sky-50',
        cardIconText: 'text-sky-600',
    },
    amber: {
        blobA: 'bg-amber-100/60',
        blobB: 'bg-amber-50/80',
        ring: 'border-amber-100/40',
        ring2: 'border-amber-100/30',
        iconBorder: 'border-amber-100',
        iconText: 'text-amber-600',
        pillBg: 'bg-amber-100',
        pillText: 'text-amber-700',
        pillBorder: 'border-amber-200',
        highlight: 'text-amber-600',
        divider: 'bg-amber-200',
        cardIconBg: 'bg-amber-50',
        cardIconText: 'text-amber-600',
    },
} as const

export default function ComingSoon({
    title,
    eyebrow = 'শীঘ্রই আসছে',
    tagline,
    description,
    icon,
    features = [],
    accent = 'emerald',
}: ComingSoonProps) {
    const c = ACCENT_MAP[accent]

    return (
        <div className="min-h-[calc(100vh-4rem)] bg-[#f9fafb] relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full ${c.blobA} blur-3xl`} />
                <div className={`absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full ${c.blobB} blur-3xl`} />
                <div className={`absolute top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full border ${c.ring}`} />
                <div className={`absolute top-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full border ${c.ring2}`} />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto px-4 py-16 sm:py-24 flex flex-col items-center text-center">
                {/* Icon */}
                <div className="mb-8 relative">
                    <div className={`w-24 h-24 rounded-3xl bg-white border ${c.iconBorder} shadow-lg flex items-center justify-center`}>
                        <div className={`w-12 h-12 ${c.iconText}`}>{icon}</div>
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                        <span className="relative inline-flex items-center justify-center rounded-full h-5 w-5 bg-amber-500">
                            <Sparkles size={11} className="text-white" />
                        </span>
                    </span>
                </div>

                {/* Heading */}
                <span className={`inline-block mb-4 px-3 py-1 rounded-full ${c.pillBg} ${c.pillText} text-xs font-semibold tracking-widest uppercase border ${c.pillBorder}`}>
                    {eyebrow}
                </span>
                <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 leading-tight mb-3">
                    {title}
                </h1>
                <p className={`text-base sm:text-lg font-medium ${c.highlight} mb-4`}>
                    {tagline}
                </p>
                <p className="text-slate-500 text-sm sm:text-base leading-relaxed max-w-xl mb-10">
                    {description}
                </p>

                {/* Feature preview */}
                {features.length > 0 && (
                    <div className="w-full grid sm:grid-cols-3 gap-4 mb-10 text-left">
                        {features.map((f, i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className={`w-10 h-10 rounded-xl ${c.cardIconBg} ${c.cardIconText} flex items-center justify-center mb-3`}>
                                    {f.icon}
                                </div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-1">{f.title}</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Divider */}
                <div className={`w-16 h-px ${c.divider} mb-8`} />

                {/* CTA */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Link href="/">
                        <Button variant="outline" size="md" className="gap-2">
                            <ArrowLeft size={16} />
                            হোমে ফিরে যান
                        </Button>
                    </Link>
                    <Link href="/contact">
                        <Button variant="primary" size="md" className="gap-2">
                            <Mail size={16} />
                            আপডেট পেতে যোগাযোগ করুন
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}