import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BACKEND_URL =
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api/v1')
    .replace(/\/api\/v1\/?$/, '')
    .replace(/\/api\/?$/, '')

/**
 * Converts a relative upload path like "/uploads/images/abc.jpg"
 * to a full URL: "http://localhost:5000/uploads/images/abc.jpg"
 * If the src is already a full URL (http/https), it is returned as-is.
 */
export function getImageUrl(src: string | null | undefined): string {
  if (!src) return ''
  if (src.startsWith('http://') || src.startsWith('https://')) return src
  return `${BACKEND_URL}${src.startsWith('/') ? '' : '/'}${src}`
}



export function formatBDT(amount: number): string {
  return '৳' + new Intl.NumberFormat('en-US').format(amount)
}

export function timeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}

export function daysLeft(deadline: string | null | undefined): number {
  if (!deadline) return 0
  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}