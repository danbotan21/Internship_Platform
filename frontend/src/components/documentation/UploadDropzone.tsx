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
      className={`relative mb-5 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-7 text-center transition-all ${
        isDragging
          ? 'border-[#FF7A00] bg-orange-50/70 scale-[1.005]'
          : 'border-[#FFB877]/60 bg-[#FFFAF5]/70 hover:border-[#FF7A00]/80'
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
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFEAD6] text-[#FF7A00] shadow-xs">
        <Upload className="h-6 w-6" strokeWidth={2.2} />
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
        className="mt-5 inline-flex items-center justify-center rounded-lg bg-[#FF7A00] px-6 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-[#E86E00] hover:shadow-md active:scale-95 disabled:opacity-50"
      >
        {isUploading ? 'Processing...' : 'Browse Files'}
      </button>
    </div>
  )
}
