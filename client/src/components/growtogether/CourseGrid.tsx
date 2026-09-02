import React from 'react'
import type { Course } from '@/lib/courseApi'
import CourseCard from './CourseCard'
import Skeleton from '@/components/ui/skeleton'
import EmptyState from '@/components/common/EmptyState'
import { GraduationCap } from 'lucide-react'

interface CourseGridProps {
    courses: Course[]
    loading?: boolean
}

export default function CourseGrid({ courses, loading = false }: CourseGridProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="rounded-2xl overflow-hidden border border-emerald-100/60">
                        <Skeleton className="h-28 w-full rounded-none" />
                        <div className="p-4 space-y-3">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-full" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    if (courses.length === 0) {
        return (
            <EmptyState
                icon={<GraduationCap size={48} />}
                title="No courses found"
                description="Try a different search or category — or check back soon as more organizations post free courses."
            />
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
            ))}
        </div>
    )
}