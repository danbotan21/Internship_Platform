import { useAuth } from '../hooks/authContext'
import { useUserRole } from '../hooks/useUserRole'
import { useDocumentation } from '../hooks/useDocumentation'
import MetricHeader from '../components/documentation/MetricHeader'
import FilterSidebar from '../components/documentation/FilterSidebar'
import UploadDropzone from '../components/documentation/UploadDropzone'
import VaultTable from '../components/documentation/VaultTable'
import RightRailPanel from '../components/documentation/RightRailPanel'
import QuickPreviewDrawer from '../components/documentation/QuickPreviewDrawer'
import RejectModal from '../components/documentation/RejectModal'
import CertificateModal from '../components/documentation/CertificateModal'
import ComplianceGateOverlay from '../components/documentation/ComplianceGateOverlay'

export default function DocumentationPage() {
  const { session } = useAuth()
  const { role } = useUserRole()
  const docState = useDocumentation(role, session?.fullName)

  return (
    <div className='w-full pb-8 overflow-x-hidden animate-in fade-in duration-500'>
      <div className='w-full px-6 pt-8 md:px-10'>
        <div className='relative mb-8'>
          <div className='absolute -left-4 top-1 h-12 w-1.5 rounded-full bg-gradient-to-b from-[#1e3a2c] to-emerald-500'></div>
          <h1 className='text-3xl font-extrabold tracking-tight text-[#14211b]'>
            Documentation Vault
          </h1>
          <p className='mt-2 text-sm font-medium text-[#5d6b64]'>
            Securely upload, manage, and track institutional logs, evaluations, and certifications.
          </p>
        </div>

        <ComplianceGateOverlay
          isComplianceSigned={docState.isComplianceSigned}
          onSignCompliance={docState.handleSignCompliance}
        />

        <MetricHeader stats={docState.stats} onMetricClick={docState.handleMetricFilter} />

        <div className='flex flex-col items-start gap-8 xl:flex-row'>
          <FilterSidebar
            categoryFilters={docState.categoryFilters}
            statusFilters={docState.statusFilters}
            mandatoryOnly={docState.mandatoryOnly}
            onToggleCategory={docState.handleToggleCategory}
            onToggleStatus={docState.handleToggleStatus}
            onToggleMandatory={docState.handleToggleMandatory}
          />

          <div className='min-w-0 w-full xl:flex-1'>
            <UploadDropzone
              onUpload={docState.handleUploadFile}
              activeCategory={docState.activeTab}
            />

            <VaultTable
              documents={docState.documents}
              activeTab={docState.activeTab}
              onTabChange={docState.setActiveTab}
              selectedDocIds={docState.selectedDocIds}
              onToggleSelectRow={docState.handleToggleSelectRow}
              onSelectAll={docState.handleSelectAll}
              onRowClick={docState.handleOpenPreview}
              onDeleteDoc={docState.handleDeleteDocument}
              onBulkDelete={docState.handleBulkDelete}
              onBulkApprove={docState.handleBulkApprove}
            />
          </div>

          <RightRailPanel
            stats={docState.stats}
            checklists={docState.checklists}
            activityLogs={docState.activityLogs}
            onToggleChecklist={docState.toggleChecklistItem}
          />
        </div>

        <QuickPreviewDrawer
          document={docState.selectedDoc}
          onClose={docState.handleClosePreview}
          onApprove={docState.handleApprove}
          onReject={() => docState.handleOpenRejectModal(docState.selectedDoc!)}
          onSign={docState.handleSignDocument}
        />

        <RejectModal
          document={docState.docToReject}
          isOpen={docState.isRejectModalOpen}
          onClose={() => docState.setIsRejectModalOpen(false)}
          onConfirm={docState.handleConfirmReject}
        />

        <CertificateModal
          isOpen={docState.isCertificateModalOpen}
          onClose={() => docState.setIsCertificateModalOpen(false)}
          recipientName={session?.fullName ?? 'Student'}
        />
      </div>

    </div>
  )
}
