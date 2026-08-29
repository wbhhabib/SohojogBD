'use client'

import { useState } from 'react'
import { orgApi, openOrgDocument } from '@/lib/api'
import { Check, Upload, Loader2, X, Image as ImageIcon } from 'lucide-react'

interface PhotosUploadProps {
    label: string
    value: string[]
    onChange: (urls: string[]) => void
    max?: number
}

export default function PhotosUpload({ label, value, onChange, max = 6 }: PhotosUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [err, setErr] = useState('')

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return
        setErr('')
        const remaining = max - value.length
        if (remaining <= 0) {
            setErr(`You can upload up to ${max} photos.`)
            return
        }
        const toUpload = Array.from(files).slice(0, remaining)
        setUploading(true)
        const uploaded: string[] = []
        for (const file of toUpload) {
            const res = await orgApi.uploadDocument(file)
            if (res.success && res.data) {
                uploaded.push(res.data.url)
            } else {
                setErr(res.message ?? 'Some photos failed to upload.')
            }
        }
        onChange([...value, ...uploaded])
        setUploading(false)
    }

    const removePhoto = (url: string) => {
        onChange(value.filter((u) => u !== url))
    }

    return (
        <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">{label}</label>

            {value.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {value.map((url, i) => (
                        <div key={url} className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg border border-gray-200 bg-gray-50 text-xs">
                            <ImageIcon size={13} className="text-gray-400" />
                            <button type="button" onClick={() => openOrgDocument(url)} className="text-sky-600 font-medium hover:underline">
                                Photo {i + 1}
                            </button>
                            <button type="button" onClick={() => removePhoto(url)} className="p-0.5 rounded hover:bg-gray-200 text-gray-400 hover:text-red-500">
                                <X size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {value.length < max && (
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-sky-300 bg-sky-50 text-sky-700 text-sm font-medium cursor-pointer hover:bg-sky-100 transition-colors w-fit">
                    {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    Add photos ({value.length}/{max})
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        disabled={uploading}
                        onChange={(e) => handleFiles(e.target.files)}
                    />
                </label>
            )}
            {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
    )
}