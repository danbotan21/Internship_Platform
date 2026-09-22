import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Download,
  CheckCircle2,
  XCircle,
  PenTool,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as docx from 'docx-preview';
import type { VaultDocument, UserRoleCapabilities } from '../../types/documentation';
import { triggerFileDownload } from '../../utils/downloadHelper';

// Setup pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface DocumentViewerModalProps {
  document: VaultDocument | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onOpenRejectModal: (doc: VaultDocument) => void;
  onSign: (id: string) => void;
  capabilities: UserRoleCapabilities;
}

const formatDate = (isoString?: string): string => {
  if (!isoString) return 'Unknown';
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return 'Unknown';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function DocumentViewerModal({
  document,
  onClose,
  onApprove,
  onOpenRejectModal,
  onSign,
  capabilities,
}: DocumentViewerModalProps) {
  const [numPages, setNumPages] = useState<number>(1);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [docxContainer, setDocxContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!document) return;
    const originalBodyOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = 'hidden';
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.document.body.style.overflow = originalBodyOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [document, onClose, isFullscreen]);

  useEffect(() => {
    if (!document) return;
    const isDocx = ['docx', 'doc'].includes(document.fileType.toLowerCase());
    if (isDocx && docxContainer && document.fileUrl) {
      const renderDocx = async () => {
        try {
          setLoading(true);
          const response = await fetch(document.fileUrl);
          const blob = await response.blob();
          await docx.renderAsync(blob, docxContainer as HTMLElement, undefined, {
            className: 'docx-preview-viewer',
            inWrapper: true,
            ignoreWidth: false,
            ignoreHeight: false,
            ignoreFonts: false,
            breakPages: true,
            ignoreLastRenderedPageBreak: true,
            experimental: false,
            trimXmlDeclaration: true,
            debug: false,
          });
          setLoading(false);
        } catch (err) {
          console.error('Error rendering DOCX:', err);
          setError(true);
          setLoading(false);
        }
      };
      renderDocx();
    }
  }, [document?.fileUrl, document?.fileType, docxContainer, document]);

  if (!document) return null;

  const isApproved = document.status?.toLowerCase() === 'approved';
  const isRejected = document.status?.toLowerCase() === 'rejected';
  const needsSignature = document.completedSignatures < document.totalSignatures;
  const isPdf = document.fileType?.toLowerCase() === 'pdf';
  const isDocx = ['docx', 'doc'].includes(document.fileType?.toLowerCase() || '');

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3.0));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handlePrevPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const handleNextPage = () => setPageNumber((p) => Math.min(p + 1, numPages));

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  const toggleFullscreen = () => {
    if (!document) return;
    if (!window.document.fullscreenElement) {
      window.document.documentElement.requestFullscreen().catch((err) => {
        console.error("Error attempting to enable fullscreen:", err);
      });
      setIsFullscreen(true);
    } else {
      window.document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[100] flex bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true">
      
      {/* Main Viewer Area */}
      <div className={`flex-1 flex flex-col ${isFullscreen ? 'w-full absolute inset-0 z-50 bg-gray-900' : ''}`}>
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-900 text-white shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <div>
              <h2 className="text-lg font-medium">{document.fileName}</h2>
              <p className="text-xs text-gray-400">Uploaded {formatDate(document.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => triggerFileDownload(document.fileUrl, document.fileName)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors text-sm font-medium text-white cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>

        {/* Document Rendering Canvas */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-start justify-center relative hardware-scroll py-8">
           {loading && isPdf && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            </div>
          )}

          {isPdf && !error && (
            <Document
              file={document.fileUrl || ''}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={() => {
                setError(true);
                setLoading(false);
              }}
              className="flex flex-col items-center gap-4"
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-xl bg-white"
              />
            </Document>
          )}

          {isDocx && !error && (
            <div 
              ref={setDocxContainer} 
              className="bg-white shadow-xl max-w-4xl w-full min-h-[800px] p-8 origin-top" 
              style={{ transform: `scale(${scale})` }}
            />
          )}

          {error && (
             <div className="flex flex-col items-center justify-center text-gray-500 h-full">
               <p>Failed to load document preview.</p>
               <p className="text-sm">Please download the file to view it.</p>
             </div>
          )}
        </div>

        {/* Bottom Toolbar */}
        <div className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] gap-6 z-10">
          <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-1">
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-gray-700 rounded-md" aria-label="Zoom Out">
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-medium min-w-[3rem] text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-gray-700 rounded-md" aria-label="Zoom In">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {isPdf && (
            <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-1">
              <button 
                onClick={handlePrevPage} 
                disabled={pageNumber <= 1}
                className="p-1.5 hover:bg-gray-700 rounded-md disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium">
                Page {pageNumber} / {numPages}
              </span>
              <button 
                onClick={handleNextPage} 
                disabled={pageNumber >= numPages}
                className="p-1.5 hover:bg-gray-700 rounded-md disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          <button onClick={toggleFullscreen} className="p-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors ml-auto">
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Right Sidebar for Metadata & Actions (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="w-96 bg-white flex flex-col h-full shadow-2xl animate-in slide-in-from-right duration-200">
          
          <div className="p-6 border-b border-gray-100 flex-1 overflow-y-auto hardware-scroll">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Document Details</h3>
            
            {/* Status */}
            <div className="mb-6">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                isApproved ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : isRejected ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {document.status}
              </span>
            </div>

             {/* Signatures Progress (US 446) */}
             <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-semibold text-gray-900">
                  Multi-Party Signatures
                </h4>
                <span className="text-xs font-bold text-[#FF7A00]">
                  {document.completedSignatures} of {document.totalSignatures}
                </span>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">1. Student ({document.uploadedBy})</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">2. Corporate Mentor</span>
                  {document.completedSignatures >= 2 ? (
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-amber-600">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">3. University Coordinator</span>
                  {document.completedSignatures >= 3 ? (
                    <span className="flex items-center gap-1 font-medium text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Signed
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 font-medium text-gray-400">
                      <Clock className="h-3.5 w-3.5" /> Pending
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Approver info */}
            {document.approvedAt && (
              <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-xs text-emerald-800 mb-6">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold">Officially Verified</p>
                  <p className="text-[11px] text-emerald-700">
                    by {document.approvedBy || 'Mentor'} on {formatDate(document.approvedAt)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 flex flex-col gap-3 shrink-0">
             {needsSignature && (
              <button
                type="button"
                onClick={() => onSign(document.id)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#153327] py-3 text-sm font-semibold text-white shadow-xs hover:bg-[#1B4332] transition-colors"
              >
                <PenTool className="h-4 w-4 text-[#FF7A00]" />
                Add Digital Signature
              </button>
            )}

            <div className="flex gap-2">
               {capabilities.canReject && !isApproved && (
                <button
                  type="button"
                  onClick={() => onOpenRejectModal(document)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              )}
              {capabilities.canApprove && !isApproved && (
                <button
                  type="button"
                  onClick={() => onApprove(document.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#FF7A00] py-2.5 text-sm font-semibold text-white hover:bg-[#E86E00] shadow-xs transition-colors"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(modalContent, window.document.body);
}
