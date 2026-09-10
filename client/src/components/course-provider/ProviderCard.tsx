import Link from 'next/link'
import type { PublicProvider } from '@/lib/providerApi'
import { INSTITUTION_TYPE_LABEL } from '@/lib/providerApi'
import { getImageUrl } from '@/lib/utils'
import { MapPin, Building2, BadgeCheck } from 'lucide-react'

interface ProviderCardProps {
    provider: PublicProvider
}

export default function ProviderCard({ provider }: ProviderCardProps) {
    const locationLabel = [provider.headquartersDistrict, provider.headquartersDivision].filter(Boolean).join(', ')

    return (
        <Link
            href={`/grow-together/courses/providers/${provider.slug}`}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-emerald-100/60 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
        >
            <div className="relative h-20 bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-end px-3 pt-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold text-white bg-white/20 backdrop-blur-sm">
                    <BadgeCheck size={12} /> Verified
                </span>
            </div>
            <div className="flex items-center gap-3 px-4 -mt-7 relative z-10">
                <div className="w-14 h-14 rounded-full border-[3px] border-white bg-white overflow-hidden shadow-md shrink-0 ring-1 ring-gray-100">
                    {provider.logo ? (
                        <img src={getImageUrl(provider.logo)} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold">
                            {provider.institutionName.charAt(0)}
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 p-4 pt-2 flex-1">
                <h3 className="font-semibold text-gray-900 text-[15px] leading-snug line-clamp-2">
                    {provider.institutionName}
                </h3>
                <p className="text-xs text-emerald-600 font-medium">{INSTITUTION_TYPE_LABEL[provider.institutionType]}</p>
                <p className="text-xs text-gray-500 line-clamp-2">{provider.description}</p>
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-emerald-50 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-emerald-500" />
                        {locationLabel}
                    </span>
                    <span className="flex items-center gap-1">
                        <Building2 size={12} className="text-emerald-500" />
                        {provider._count.branches} branch{provider._count.branches !== 1 ? 'es' : ''}
                    </span>
                </div>
            </div>
        </Link>
    )
}