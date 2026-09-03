'use client'

import { useState } from 'react'
import { uploadProviderDocument } from '@/lib/providerApi'
import { Check, Upload, Loader2 } from 'lucide-react'

interface ProviderDocUploadProps {
    label: string
    required?: boolean
    value: string
    onChange: (url: string) => void
    hint?: string
}

export default function ProviderDocUpload({ label, required, value, onChange, hint }: ProviderDocUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [err, setErr] = useState('')

    const handleFile = async (file: File | null) => {
        if (!file) return
        setUploading(true)
        setErr('')
        const res = await uploadProviderDocument(file)
        if (res.success && res.data) {
            onChange(res.data.url)
        } else {
            setErr(res.message ?? 'Upload failed. Please try again.')
        }
        setUploading(false)
    }

    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            {hint && <p className="text-xs text-gray-400">{hint}</p>}
            <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-emerald-300 bg-emerald-50 text-emerald-700 text-sm font-medium cursor-pointer hover:bg-emerald-100 transition-colors">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {value ? 'Replace file' : 'Upload file'}
                    <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                    />
                </label>
                {value && !uploading && (
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                        <Check size={13} /> Uploaded
                    </span>
                )}
            </div>
            {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
    )
}