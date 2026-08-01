'use client'

import React, { useMemo, useRef, useState } from 'react'
import { Upload, X } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface PreviewItem {
  id: string
  src: string
  file?: File
}

interface ImageUploadPreviewProps {
  initialImages?: string[]
  onChange?: (images: string[]) => void
  onFilesChange?: (files: File[]) => void
  maxFiles?: number
}

export default function ImageUploadPreview({
  initialImages = [],
  onChange,
  onFilesChange,
  maxFiles = 5,
}: ImageUploadPreviewProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [items, setItems] = useState<PreviewItem[]>(
    () => initialImages.map((src, index) => ({
      id: `remote-${index}-${src}`,
      src: getImageUrl(src),
    }))
  )
  const [isDragging, setIsDragging] = useState(false)

  const files = useMemo(
    () => items.filter((item) => item.file).map((item) => item.file!) ,
    [items]
  )

  const emit = (nextItems: PreviewItem[]) => {
    setItems(nextItems)
    onChange?.(nextItems.filter((item) => !item.file).map((item) => item.src))
    onFilesChange?.(nextItems.filter((item) => item.file).map((item) => item.file!))
  }

  const addFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return

    const accepted = Array.from(fileList).filter((file) =>
      ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)
    )

    if (accepted.length === 0) return

    const remainingSlots = Math.max(0, maxFiles - items.length)
    const selected = accepted.slice(0, remainingSlots)

    const nextItems = [
      ...items,
      ...selected.map((file) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        src: URL.createObjectURL(file),
        file,
      })),
    ]

    emit(nextItems)
  }

  const handleRemove = (index: number) => {
    const nextItems = items.filter((_, i) => i !== index)
    emit(nextItems)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    addFiles(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors
          ${isDragging
            ? 'border-emerald-500 bg-emerald-50'
            : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'}
        `}
      >
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
          <Upload size={22} className="text-slate-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-slate-700">Drag & drop images here</p>
          <p className="text-xs text-slate-400 mt-0.5">or click to upload</p>
        </div>
        <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handleInputChange}
        />
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {items.map((item, i) => (
            <div key={item.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100">
              <img src={item.src} alt={`Upload preview ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemove(i)}
                className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
              >
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <p className="text-xs text-slate-500">
          {files.length} new file{files.length > 1 ? 's' : ''} selected
        </p>
      )}
    </div>
  )
}