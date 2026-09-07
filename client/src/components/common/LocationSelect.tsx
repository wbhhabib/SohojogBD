'use client'

import { useMemo, useEffect } from 'react'
import Select from '@/components/ui/select'
import { allDivision, districtsOf, upazilaNamesOf, DivisionName } from '@bangladeshi/bangladesh-address/build/src'

interface LocationSelectProps {
    division: string
    district: string
    upazila: string
    onDivisionChange: (val: string) => void
    onDistrictChange: (val: string) => void
    onUpazilaChange: (val: string) => void
    required?: boolean
    layout?: 'stacked' | 'inline'
    // filter-এর জন্য — "All Division"/"All District"/"All Upazila" কে dropdown-এর
    // নিজের একটা অপশন হিসেবে দেখায়, যাতে আলাদা "Clear filters" বাটন ছাড়াই সরাসরি
    // dropdown থেকে আবার "সব" এ ফিরে যাওয়া যায়। Registration-এর মতো ফর্মে
    // (required=true) এটা কখনো পাস করবে না, শুধু browse/filter পেজে ব্যবহার করবে।
    allowAll?: boolean
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
    allowAll = false,
}: LocationSelectProps) {
    const districts = useMemo(() => {
        if (!division) return []
        return districtsOf(division as DivisionName) ?? []
    }, [division])

    const upazilas = useMemo(() => {
        if (!district) return []
        return upazilaNamesOf(district) ?? []
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

    const divisionOptions = allowAll
        ? [{ label: 'All Divisions', value: '' }, ...DIVISIONS.map((d) => ({ label: d, value: d }))]
        : DIVISIONS.map((d) => ({ label: d, value: d }))

    const districtOptions = allowAll
        ? [{ label: 'All Districts', value: '' }, ...districts.map((d: string) => ({ label: d, value: d }))]
        : districts.map((d: string) => ({ label: d, value: d }))

    const upazilaOptions = allowAll
        ? [{ label: 'All Upazilas', value: '' }, ...upazilas.map((u: string) => ({ label: u, value: u }))]
        : upazilas.map((u: string) => ({ label: u, value: u }))

    return (
        <div className={wrapperClass}>
            <Select
                label="Division"
                required={required}
                placeholder="Select division"
                options={divisionOptions}
                value={division}
                onChange={(e) => onDivisionChange(e.target.value)}
            />
            <Select
                label="District"
                required={required}
                placeholder={division ? 'Select district' : 'Select division first'}
                options={districtOptions}
                value={district}
                onChange={(e) => onDistrictChange(e.target.value)}
                disabled={!division}
            />
            <Select
                label="Upazila"
                required={required}
                placeholder={district ? 'Select upazila' : 'Select district first'}
                options={upazilaOptions}
                value={upazila}
                onChange={(e) => onUpazilaChange(e.target.value)}
                disabled={!district}
            />
        </div>
    )
}