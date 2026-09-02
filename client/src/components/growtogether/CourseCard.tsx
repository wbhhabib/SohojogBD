import React from 'react'
import Link from 'next/link'
import type { Course } from '@/lib/courseApi'
import { CATEGORY_EMOJI, MODE_LABEL, daysLeft } from '@/lib/courseApi'
import Badge from '@/components/ui/badge'
import { MapPin, Clock, Users, Wifi } from 'lucide-react'

interface CourseCardProps {
    course: Course
}

const MODE_COLOR: Record<string, string> = {
    ONLINE: 'bg-sky-50 text-sky-700 border-sky-100',
    OFFLINE: 'bg-amber-50 text-amber-700 border-amber-100',
    HYBRID: 'bg-violet-50 text-violet-700 border-violet-100',
}

export default function CourseCard({ course }: CourseCardProps) {
    const emoji = CATEGORY_EMOJI[course.skillCategory] ?? '📚'
    const left = course.applicationDeadline ? daysLeft(course.applicationDeadline) : null
    const locationLine = course.mode === 'ONLINE'
        ? 'Online'
        : [course.upazila, course.district].filter(Boolean).join(', ') || course.division || 'Location TBA'

    return (
        <Link
            href={`/grow-together/courses/${course.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
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
            </div>

            <div className="flex flex-col gap-2.5 p-4 flex-1">
                <div className="flex items-center gap-2">
                    {course.organization.logo ? (
                        <img src={course.organization.logo} alt={course.organization.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    ) : (
                        <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-emerald-50 text-emerald-700 shrink-0">
                            {course.organization.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                    <span className="text-xs font-medium text-gray-500 truncate">{course.organization.name}</span>
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
    )
}