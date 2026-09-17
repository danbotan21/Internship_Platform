import { ShieldAlert, CheckCircle2, FileText, ArrowRight } from 'lucide-react'
import { useState } from 'react'

interface ComplianceGateOverlayProps {
  isComplianceSigned: boolean
  onSignCompliance: () => void
  onDismiss?: () => void
}

export default function ComplianceGateOverlay({
  isComplianceSigned,
  onSignCompliance,
}: ComplianceGateOverlayProps) {
  const [isSigning, setIsSigning] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  if (isComplianceSigned) return null

  const handleSign = async () => {
    setIsSigning(true)
    setTimeout(() => {
      onSignCompliance()
      setIsSigning(false)
    }, 600)
  }

  if (isMinimized) {
    return (
      <div className="mb-4 flex items-center justify-between rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900 shadow-xs">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Access Gate Warning:</strong> Mandatory Health &amp; Safety Compliance Form is unsigned.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleSign}
            className="rounded-lg bg-[#FF7A00] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#E86E00]"
          >
            Sign Now
          </button>
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="text-xs text-amber-700 underline hover:text-amber-900"
          >
            View Details
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/50 to-white p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">
                Mandatory Institutional Compliance Gate (US 730)
              </h3>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800 uppercase tracking-wide">
                Action Required
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600 max-w-2xl leading-relaxed">
              Institutional protocol requires all interns to accept the <strong>Health &amp; Safety Compliance Agreement</strong> prior to mid-term signoffs. Please verify your student acknowledgement below.
            </p>
            <div className="mt-2 flex items-center gap-4 text-[11px] text-gray-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3 text-gray-400" /> Form: Health_Safety_Compliance_Form.pdf
              </span>
              <span>• Total Signatures Required: 3 (Intern, Mentor, University)</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:self-center">
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Minimize Banner
          </button>
          <button
            type="button"
            disabled={isSigning}
            onClick={handleSign}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#FF7A00] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#E86E00] transition-colors active:scale-95 disabled:opacity-50"
          >
            {isSigning ? (
              'Verifying...'
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Digitally Sign Form
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
