import { useEffect, useRef, useState } from 'react'
import * as docx from 'docx-preview'
import { FileText, Loader2 } from 'lucide-react'
import type { VaultDocument } from '../../types/documentation'

interface InlineDocumentPreviewProps {
  document: VaultDocument
}

type PreviewState = 'loading' | 'ready' | 'unavailable'

export default function InlineDocumentPreview({ document }: InlineDocumentPreviewProps) {
  const [state, setState] = useState<PreviewState>('loading')
  const [worksheet, setWorksheet] = useState<unknown[][]>([])
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const wordContainerRef = useRef<HTMLDivElement>(null)
  const fileType = document.fileType.toLowerCase()
  const isPdf = fileType === 'pdf'
  const isWord = fileType === 'docx' || fileType === 'doc'
  const isExcel = ['xlsx', 'xls', 'csv'].includes(fileType)

  useEffect(() => {
    let isActive = true
    const renderPreview = async () => {
      setState('loading')
      setWorksheet([])
      setPreviewUrl(null)

      try {
        if (isPdf) {
          const response = await fetch(document.fileUrl)
          if (!response.ok) throw new Error('PDF could not be loaded')
          if (isActive) setPreviewUrl(document.fileUrl)
          if (isActive) setState('ready')
          return
        }

        const response = await fetch(document.fileUrl)
        if (!response.ok) throw new Error('Document could not be loaded')

        if (isWord && wordContainerRef.current) {
          wordContainerRef.current.replaceChildren()
          await docx.renderAsync(await response.blob(), wordContainerRef.current, undefined, {
            inWrapper: false,
            breakPages: false,
            ignoreLastRenderedPageBreak: true,
          })
        } else if (isExcel) {
          const XLSX = await import('xlsx')
          const workbook = XLSX.read(await response.arrayBuffer(), { type: 'array' })
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
          if (!firstSheet) throw new Error('Workbook has no sheets')
          const rows = XLSX.utils.sheet_to_json<unknown[]>(firstSheet, {
            header: 1,
            blankrows: false,
            defval: '',
          })
          if (isActive) setWorksheet(rows.slice(0, 20).map((row) => row.slice(0, 8)))
        }

        if (isActive) setState('ready')
      } catch {
        if (isPdf) {
          try {
            const fallback = await fetch('/dummy.pdf')
            if (fallback.ok && isActive) {
              setPreviewUrl('/dummy.pdf')
              setState('ready')
              return
            }
          } catch {
            // The unavailable state below gives the user a clear fallback.
          }
        }
        if (isActive) setState('unavailable')
      }
    }

    renderPreview()
    return () => {
      isActive = false
    }
  }, [document.fileUrl, isExcel, isPdf, isWord])

  if (isWord) {
    return (
      <div className="relative h-64 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div
          ref={wordContainerRef}
          className="h-full overflow-auto p-3 text-[10px] [&_.docx-wrapper]:bg-white [&_.docx-wrapper]:p-0 [&_section.docx]:mx-0 [&_section.docx]:min-h-0 [&_section.docx]:w-full [&_section.docx]:p-3"
        />
        {state === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-xs text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading preview...
          </div>
        )}
        {state === 'unavailable' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50 px-6 text-center text-xs text-gray-500">
            <FileText className="mb-2 h-7 w-7 text-gray-400" />
            Preview is unavailable for this file. Download it to view the original document.
          </div>
        )}
      </div>
    )
  }

  if (state === 'loading') {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading preview...
      </div>
    )
  }

  if (state === 'unavailable') {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 text-center text-xs text-gray-500">
        <FileText className="mb-2 h-7 w-7 text-gray-400" />
        Preview is unavailable for this file. Download it to view the original document.
      </div>
    )
  }

  if (isPdf) {
    return (
      <iframe
        src={`${previewUrl}#toolbar=0&navpanes=0`}
        title={`Preview for ${document.fileName}`}
        className="h-64 w-full rounded-xl border border-gray-200 bg-white"
      />
    )
  }

  if (isExcel) {
    return (
      <div className="h-64 overflow-auto rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full border-collapse text-left text-[10px]">
          <tbody>
            {worksheet.map((row, rowIndex) => (
              <tr key={rowIndex} className={rowIndex === 0 ? 'bg-emerald-50 font-semibold text-emerald-900' : 'border-t border-gray-100'}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="max-w-36 truncate border-r border-gray-100 px-2 py-1.5">
                    {String(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}
