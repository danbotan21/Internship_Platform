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
  const { role, capabilities } = useUserRole()
  const docState = useDocumentation(role)

  return (
    <div className="mx-auto max-w-[1400px] min-w-[960px] pb-12">
      {/* Top Header Navigation matching screenshot */}
      <TopBar
        searchQuery={docState.searchQuery}
        onSearchChange={docState.setSearchQuery}
      />

      {/* Page Title & Subtitle */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Documentation
        </h1>
        <p className="mt-1 text-xs text-gray-500">
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
      <div className="flex items-start gap-5">
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
        <div className="flex-1 min-w-0">
          {/* Drag-and-drop dropzone */}
          <UploadDropzone
            onUpload={docState.handleUploadFile}
            activeCategory={docState.activeTab}
          />

          {/* Directory Table with category tabs */}
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

      {/* Slide-over Quick Preview Drawer */}
      <QuickPreviewDrawer
        document={docState.selectedDoc}
        onClose={docState.handleClosePreview}
        onApprove={docState.handleApprove}
        onOpenRejectModal={docState.handleOpenRejectModal}
        onSign={docState.handleSignDocument}
        capabilities={capabilities}
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
        recipientName="Ion Popescu"
      />
    </div>
  )
}
