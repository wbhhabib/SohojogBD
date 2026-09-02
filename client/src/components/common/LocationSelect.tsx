'use client'

import { useMemo, useEffect } from 'react'
import Select from '@/components/ui/select'
import { allDivision, districtOf, upazilasOf, DivisionName } from '@bangladeshi/bangladesh-address'

interface LocationSelectProps {
    division: string
    district: string
    upazila: string
    onDivisionChange: (val: string) => void
    onDistrictChange: (val: string) => void
    onUpazilaChange: (val: string) => void
    required?: boolean
    layout?: 'stacked' | 'inline'
}

// Package's DivisionName enum is the source of truth for spelling —
// never hardcode division names elsewhere, to avoid silent filter mismatches.
const DIVISIONS: string[] = allDivision()

export default function LocationSelect({
    division,
    district,
    upazila,
    onDivisionChange,
    onDistrictChange,
    onUpazilaChange,
    required = false,
    layout = 'stacked',
}: LocationSelectProps) {
    const districts = useMemo(() => {
        if (!division) return []
        return districtOf(division as DivisionName) ?? []
    }, [division])

    const upazilas = useMemo(() => {
        if (!district) return []
        return upazilasOf(district) ?? []
    }, [district])

    // Division বদলালে আগের District/Upazila আর valid না থাকতে পারে, তাই reset করা
    useEffect(() => {
        if (district && !districts.includes(district)) {
            onDistrictChange('')
            onUpazilaChange('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [division])

    useEffect(() => {
        if (upazila && !upazilas.includes(upazila)) {
            onUpazilaChange('')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [district])

    const wrapperClass = layout === 'inline' ? 'flex flex-wrap gap-3' : 'flex flex-col gap-3'

    return (
        <div className={wrapperClass}>
            <Select
                label="Division"
                required={required}
                placeholder="Select division"
                options={DIVISIONS.map((d) => ({ label: d, value: d }))}
                value={division}
                onChange={(e) => onDivisionChange(e.target.value)}
            />
            <Select
                label="District"
                required={required}
                placeholder={division ? 'Select district' : 'Select division first'}
                options={districts.map((d: string) => ({ label: d, value: d }))}
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
                disabled={!division}
            />
            <Select
                label="Upazila"
                required={required}
                placeholder={district ? 'Select upazila' : 'Select district first'}
                options={upazilas.map((u: string) => ({ label: u, value: u }))}
                value={upazila}
                onChange={(e) => onUpazilaChange(e.target.value)}
                disabled={!district}
            />
        </div>
    )
}