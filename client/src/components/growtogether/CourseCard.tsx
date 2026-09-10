import React from 'react'
import Link from 'next/link'
import type { Course } from '@/lib/courseApi'
import { CATEGORY_EMOJI, MODE_LABEL, daysLeft } from '@/lib/courseApi'
import Badge from '@/components/ui/badge'
import { MapPin, Clock, Users, Wifi } from 'lucide-react'

export interface CourseCardAction {
    label: string
    icon: React.ReactNode
    onClick: () => void
    busy?: boolean
    variant: 'danger' | 'success'
}

interface CourseCardProps {
    course: Course
    action?: CourseCardAction
}

const MODE_COLOR: Record<string, string> = {
    ONLINE: 'bg-sky-50 text-sky-700 border-sky-100',
    OFFLINE: 'bg-amber-50 text-amber-700 border-amber-100',
    HYBRID: 'bg-violet-50 text-violet-700 border-violet-100',
}

const ACTION_STYLE: Record<CourseCardAction['variant'], string> = {
    danger: 'text-red-600 hover:bg-red-50',
    success: 'text-emerald-700 hover:bg-emerald-50',
}

export default function CourseCard({ course, action }: CourseCardProps) {
    const emoji = CATEGORY_EMOJI[course.skillCategory] ?? '📚'
    const left = course.applicationDeadline ? daysLeft(course.applicationDeadline) : null
    const locationLine = course.mode === 'ONLINE'
        ? 'Online'
        : [course.upazila, course.district].filter(Boolean).join(', ') || course.division || 'Location TBA'

    return (
        <div className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
            <Link href={`/grow-together/courses/${course.slug}`} className="group flex flex-col flex-1">
                <div className="relative h-28 overflow-hidden bg-gradient-to-br from-emerald-300 to-teal-500 flex items-center justify-center">
                    <span className="text-5xl opacity-70">{emoji}</span>
                    <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-700 shadow-md">
                            <span>{emoji}</span>
                            {course.skillCategory}
                        </span>
                    </div>
                    <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold border ${MODE_COLOR[course.mode]} bg-white/90 shadow-md`}>
                            {course.mode === 'ONLINE' && <Wifi size={10} />}
                            {MODE_LABEL[course.mode]}
                        </span>
                    </div>
                    {course.status === 'CLOSED' && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <span className="text-xs font-bold text-white px-3 py-1 rounded-full bg-black/50 border border-white/30">Closed</span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-2.5 p-4 flex-1">
                    <div className="flex items-center gap-2">
                        {course.branch.provider.logo ? (
                            <img src={course.branch.provider.logo} alt={course.branch.provider.institutionName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        ) : (
                            <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                                {course.branch.provider.institutionName.charAt(0).toUpperCase()}
                            </span>
                        )}
                        <span className="text-xs font-medium text-gray-500 truncate">{course.branch.provider.institutionName}</span>
                    </div>

                    <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
                        {course.title}
                    </h3>

                    <div className="flex items-center gap-2 flex-wrap mt-auto pt-2.5 border-t border-emerald-50 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                            <Clock size={12} className="text-emerald-500" />
                            {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                            <MapPin size={12} className="text-emerald-500" />
                            {locationLine}
                        </span>
                        {course.seatsAvailable && (
                            <span className="flex items-center gap-1">
                                <Users size={12} className="text-emerald-500" />
                                {course.seatsAvailable} seats
                            </span>
                        )}
                    </div>

                    {left !== null && (
                        <Badge variant={left <= 3 ? 'danger' : 'warning'} className="w-fit">
                            {left > 0 ? `${left}d left to apply` : 'Deadline today'}
                        </Badge>
                    )}
                    {course.isOngoing && (
                        <Badge variant="success" className="w-fit">Rolling admission</Badge>
                    )}
                </div>
            </Link>

            {action && (
                <button
                    onClick={action.onClick}
                    disabled={action.busy}
                    className={`flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 border-t border-gray-100 transition-colors disabled:opacity-60 ${ACTION_STYLE[action.variant]}`}
                >
                    {action.icon}
                    {action.busy ? 'Please wait…' : action.label}
                </button>
            )}
        </div>
    )
}