import React, { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (content: string, fileName: string) => void;
  disabled?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, disabled }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === 'string') {
        onFileLoaded(text, file.name);
      }
    };
    reader.readAsText(file);
  }, [onFileLoaded]);

  return (
    <div className={`
      relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
      ${disabled 
        ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60' 
        : 'border-slate-300 hover:border-brand-500 hover:bg-brand-50 cursor-pointer group'}
    `}>
      <div className="flex flex-col items-center justify-center space-y-4 pointer-events-none">
        <div className={`p-4 rounded-full ${disabled ? 'bg-slate-100 text-slate-400' : 'bg-brand-50 text-brand-600 group-hover:scale-110 transition-transform'}`}>
          <Upload className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">
            Click to upload text document
          </p>
          <p className="text-xs text-slate-500">
            Supported: .txt, .md, .csv (Max 1MB)
          </p>
        </div>
      </div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={disabled}
        accept=".txt,.md,.json,.csv"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
      />
    </div>
  );
};

export default FileUpload;