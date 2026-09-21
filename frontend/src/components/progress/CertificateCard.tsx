import type { StudentProgress } from '../../types/progress'

export default function CertificateCard({ progress }: { progress: StudentProgress }) {
  async function handleDownload() {
    const { default: jsPDF } = await import('jspdf')
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })
    const width = doc.internal.pageSize.getWidth()
    const height = doc.internal.pageSize.getHeight()

    doc.setDrawColor('#1e3a2c')
    doc.setLineWidth(3)
    doc.rect(24, 24, width - 48, height - 48)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(28)
    doc.setTextColor('#1e3a2c')
    doc.text('Certificate of Completion', width / 2, 120, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(14)
    doc.setTextColor('#333333')
    doc.text(`${progress.studentName} has completed the internship program`, width / 2, 170, { align: 'center' })
    doc.text(
      `${progress.hoursLogged} hours logged, ${progress.taskLog.length} tasks completed, ${progress.milestonesCompleted} milestones achieved.`,
      width / 2,
      195,
      { align: 'center' },
    )

    doc.setFontSize(11)
    doc.setTextColor('#888888')
    doc.text(`Issued ${new Date().toLocaleDateString()}`, width / 2, 240, { align: 'center' })

    doc.save(`${progress.studentName.replace(/\s+/g, '-')}-certificate.pdf`)
  }

  return (
    <div className="rounded-xl border border-orange-100 bg-orange-50 p-5">
      <h3 className="text-sm font-semibold text-gray-900">Certificate of Completion</h3>
      <p className="mt-1 text-sm text-gray-600">
        {progress.studentName} has completed the internship program — {progress.hoursLogged} hours,{' '}
        {progress.taskLog.length} tasks, {progress.milestonesCompleted} milestones.
      </p>
      <button
        type="button"
        onClick={handleDownload}
        className="mt-3 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
      >
        Download PDF
      </button>
    </div>
  )
}
