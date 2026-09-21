import type { VaultDocument } from '../../types/documentation';

interface DocumentThumbnailProps {
  document: VaultDocument;
  className?: string;
}

export default function DocumentThumbnail({ document, className = '' }: DocumentThumbnailProps) {
  const fileType = document.fileType?.toLowerCase() || '';
  const isPdf = fileType === 'pdf';
  const isDocx = ['docx', 'doc'].includes(fileType);
  const isExcel = ['xlsx', 'xls', 'csv'].includes(fileType);

  return (
    <div className={`relative w-full aspect-[1/1.2] bg-[#f8f9fa] flex items-center justify-center overflow-hidden ${className}`}>
      <div className="w-[65%] h-[80%] bg-white rounded shadow-sm border border-gray-200 flex flex-col items-center justify-center p-2">
        {isDocx ? (
          <div className="w-full flex flex-col gap-2 p-1">
            <div className="w-[80%] h-2.5 bg-blue-100 rounded-full mx-auto" />
            <div className="w-[90%] h-2.5 bg-blue-100 rounded-full mx-auto" />
            <div className="w-[70%] h-2.5 bg-blue-100 rounded-full mx-auto" />
            <div className="w-[85%] h-2.5 bg-blue-100 rounded-full mx-auto" />
          </div>
        ) : isExcel ? (
          <div className="grid grid-cols-3 gap-1.5 w-[80%] mx-auto">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="w-full aspect-square bg-emerald-100 rounded-sm" />
            ))}
          </div>
        ) : isPdf ? (
          <div className="w-full flex flex-col gap-2 p-1">
            <div className="w-[90%] h-2.5 bg-red-100 rounded-full mx-auto" />
            <div className="w-[80%] h-2.5 bg-red-100 rounded-full mx-auto" />
            <div className="w-[85%] h-2.5 bg-red-100 rounded-full mx-auto" />
            <div className="w-[60%] h-2.5 bg-red-100 rounded-full mx-auto" />
          </div>
        ) : (
          <div className="w-full flex flex-col gap-2 p-1">
            <div className="w-[80%] h-2.5 bg-gray-200 rounded-full mx-auto" />
            <div className="w-[90%] h-2.5 bg-gray-200 rounded-full mx-auto" />
            <div className="w-[70%] h-2.5 bg-gray-200 rounded-full mx-auto" />
          </div>
        )}
      </div>
    </div>
  );
}
