
import type { Donation } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import ReceiptDownload from '@/components/donation/ReceiptDownload'

interface DonationCardProps {
  donation: Donation
}

type NormalizedStatus = 'completed' | 'pending' | 'refunded'

const statusConfig: Record<NormalizedStatus, { label: string; classes: string }> = {
  completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border border-amber-200'     },
  refunded:  { label: 'Refunded',  classes: 'bg-red-50 text-red-600 border border-red-200'            },
}

function normalizeStatus(status: Donation['status']): NormalizedStatus {
  const lower = status.toLowerCase()
  if (lower === 'completed') return 'completed'
  if (lower === 'refunded')  return 'refunded'
  return 'pending'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function DonationCard({ donation }: DonationCardProps) {
  const normalized  = normalizeStatus(donation.status)
  const { label, classes } = statusConfig[normalized]

  const displayName    = donation.isAnonymous ? 'Anonymous' : (donation.donor?.name ?? 'Unknown')
  const campaignTitle  = donation.campaign?.title ?? '—'

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 flex flex-col gap-4">
<div className="flex items-start justify-between gap-2">
        <span className="text-3xl font-bold text-emerald-600">{formatBDT(donation.amount)}</span>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 mt-1 ${classes}`}>
          {label}
        </span>
      </div>
<div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Campaign</p>
        <p className="text-sm font-semibold text-slate-800 leading-snug">{campaignTitle}</p>
      </div>
<div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Donor</p>
          <p className="text-sm text-slate-700 font-medium">{displayName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-0.5">Date</p>
          <p className="text-sm text-slate-500">{formatDate(donation.createdAt)}</p>
        </div>
      </div>
{donation.message && (
        <div className="bg-gray-50 rounded-lg px-3 py-2.5 border border-gray-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-1">Message</p>
          <p className="text-sm text-slate-600 italic">&quot;{donation.message}&quot;</p>
        </div>
      )}
<div className="pt-1 border-t border-gray-100">
        <ReceiptDownload donation={donation} />
      </div>
    </div>
  )
}