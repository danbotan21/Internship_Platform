import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'
import type { DocumentCategory } from '../../types/documentation'

interface UploadDropzoneProps {
  onUpload: (file: File, category?: DocumentCategory) => Promise<unknown>
  activeCategory?: DocumentCategory | 'All Docs'
}

export default function UploadDropzone({ onUpload, activeCategory }: UploadDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files[0])
    }
  }

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files[0])
      e.target.value = ''
    }
  }

  const processFiles = async (file: File) => {
    setIsUploading(true)
    try {
      const cat: DocumentCategory =
        activeCategory && activeCategory !== 'All Docs' ? activeCategory : 'Reports'
      await onUpload(file, cat)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative mb-6 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 ${
        isDragging
          ? 'border-emerald-500 bg-emerald-50/80 scale-[1.01] shadow-emerald-500/10 shadow-lg'
          : 'border-emerald-200/60 bg-white hover:border-emerald-400 hover:bg-white hover:shadow-md'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".pdf,.docx,.xlsx,.doc,.xls"
        className="hidden"
      />

      {/* Upload Icon inside soft circle/square */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
        <Upload className="h-8 w-8" strokeWidth={2} />
      </div>

      <h4 className="text-base font-semibold text-gray-800">
        {isUploading ? 'Uploading document...' : 'Drag and drop your document here'}
      </h4>
      <p className="mt-1 text-sm text-gray-500">
        Supports PDF, DOCX, or XLSX up to 10MB.
      </p>

      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-3 text-sm font-bold tracking-wide text-white shadow-md transition-all hover:from-emerald-700 hover:to-emerald-600 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
      >
        {isUploading ? 'Processing...' : 'Browse Files'}
      </button>
    </div>
  )
}
