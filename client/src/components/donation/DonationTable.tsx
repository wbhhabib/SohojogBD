
import type { Donation } from '@/lib/api'
import { formatBDT } from '@/lib/utils'
import EmptyState from '@/components/common/EmptyState'
import ReceiptDownload from '@/components/donation/ReceiptDownload'

interface DonationTableProps {
  donations: Donation[]
  showCampaign?: boolean
  showDonor?: boolean
}

const STATUS_DISPLAY: Record<string, { label: string; classes: string }> = {
  completed: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  COMPLETED: { label: 'Completed', classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  pending:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border border-amber-200'     },
  PENDING:   { label: 'Pending',   classes: 'bg-amber-50 text-amber-700 border border-amber-200'     },
  refunded:  { label: 'Refunded',  classes: 'bg-red-50 text-red-600 border border-red-200'            },
  REFUNDED:  { label: 'Refunded',  classes: 'bg-red-50 text-red-600 border border-red-200'            },
  failed:    { label: 'Failed',    classes: 'bg-gray-50 text-gray-600 border border-gray-200'         },
  FAILED:    { label: 'Failed',    classes: 'bg-gray-50 text-gray-600 border border-gray-200'         },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function truncate(str: string, max = 40) {
  return str.length > max ? str.slice(0, max) + '…' : str
}

export default function DonationTable({
  donations,
  showCampaign = false,
  showDonor = true,
}: DonationTableProps) {
  if (!donations.length) {
    return <EmptyState title="No donations found" description="There are no donations to display yet." />
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full divide-y divide-gray-200 text-sm">
        <thead className="bg-gray-50">
          <tr>
            {showDonor && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Donor
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Amount
            </th>
            {showCampaign && (
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                Campaign
              </th>
            )}
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Message
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Date
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Receipt
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {donations.map((donation, idx) => {
            const donorName     = donation.isAnonymous ? 'Anonymous' : donation.donor?.name ?? 'Unknown'
            const campaignTitle = donation.campaign?.title ?? '—'
            const statusEntry   = STATUS_DISPLAY[donation.status] ?? {
              label: donation.status,
              classes: 'bg-gray-50 text-gray-600 border border-gray-200',
            }

            return (
              <tr key={donation.id} className={idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'}>
                {showDonor && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="font-medium text-slate-800">{donorName}</span>
                  </td>
                )}
                <td className="px-4 py-3 whitespace-nowrap font-semibold text-emerald-700">
                  {formatBDT(donation.amount)}
                </td>
                {showCampaign && (
                  <td className="px-4 py-3 text-slate-700 max-w-[180px]">
                    <span title={campaignTitle}>{truncate(campaignTitle, 30)}</span>
                  </td>
                )}
                <td className="px-4 py-3 text-slate-500 max-w-[200px]">
                  {donation.message ? (
                    <span title={donation.message}>{truncate(donation.message)}</span>
                  ) : (
                    <span className="text-slate-300 italic">—</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                  {formatDate(donation.createdAt)}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusEntry.classes}`}>
                    {statusEntry.label}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <ReceiptDownload donation={donation} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}