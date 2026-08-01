
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
      <div className="flex flex-col items-center gap-4 max-w-md w-full">
        <p className="text-8xl font-bold text-emerald-600 leading-none select-none">404</p>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Page not found</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>
        <Link
          href="/"
          className="mt-2 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  )
}