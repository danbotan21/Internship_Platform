import { useAuth } from '../hooks/useAuth'
import { useUserRole } from '../hooks/useUserRole'
import { useDocumentation } from '../hooks/useDocumentation'
import TopBar from '../components/documentation/TopBar'
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
    <div className="w-full pb-12 overflow-x-hidden bg-gray-50/30 min-h-screen">
      {/* Top Header Navigation matching screenshot */}
      <TopBar
        searchQuery={docState.searchQuery}
        onSearchChange={docState.setSearchQuery}
      />

      <div className="mx-auto max-w-[1600px] px-10 pt-8">
        {/* Page Title & Subtitle */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Documentation
          </h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Upload and manage institutional logs, evaluations, and certifications
        </p>
      </div>

      {/* US 730: Compliance Access Gate Overlay */}
      <ComplianceGateOverlay
        isComplianceSigned={docState.isComplianceSigned}
        onSignCompliance={docState.handleSignCompliance}
      />

      {/* Top Section: 4 Metric Cards */}
      <MetricHeader stats={docState.stats} />

      {/* Main 3-Column Layout matching screenshot */}
      <div className="flex flex-col xl:flex-row items-start gap-8">
        {/* Column 1: Left Filter Bar */}
        <FilterSidebar
          categoryFilters={docState.categoryFilters}
          statusFilters={docState.statusFilters}
          mandatoryOnly={docState.mandatoryOnly}
          onToggleCategory={docState.handleToggleCategory}
          onToggleStatus={docState.handleToggleStatus}
          onToggleMandatory={docState.handleToggleMandatory}
        />

        {/* Column 2: Central Vault Area */}
        <div className="w-full xl:flex-1 min-w-0">
          {/* Drag-and-drop dropzone */}
          <UploadDropzone
            onUpload={docState.handleUploadFile}
            activeCategory={docState.activeTab}
          />

          {/* Directory Grid with category tabs */}
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

        {/* Column 3: Right Rail Panel */}
        <RightRailPanel
          stats={docState.stats}
          checklists={docState.checklists}
          activityLogs={docState.activityLogs}
          onToggleChecklist={docState.toggleChecklistItem}
        />
      </div>

      {/* Right Side Quick Preview Drawer */}
      <QuickPreviewDrawer
        document={docState.selectedDoc}
        onClose={docState.handleClosePreview}
        onApprove={docState.handleApprove}
        onReject={() => docState.handleOpenRejectModal(docState.selectedDoc!)}
      />

      {/* US 729: Rejection Reason Modal */}
      <RejectModal
        document={docState.docToReject}
        isOpen={docState.isRejectModalOpen}
        onClose={() => docState.setIsRejectModalOpen(false)}
        onConfirm={docState.handleConfirmReject}
      />

        {/* US 460 & 461: Certificate Modal */}
        <CertificateModal
          isOpen={docState.isCertificateModalOpen}
          onClose={() => docState.setIsCertificateModalOpen(false)}
          recipientName={session?.fullName ?? 'Student'}
        />
      </div>
    </div>
  )
}
