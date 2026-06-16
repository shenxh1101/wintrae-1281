import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ImportStatus } from '@/types';

interface FileUploadProps {
  title: string;
  description: string;
  accept: string;
  status: ImportStatus;
  fileName?: string;
  onFileSelect: (file: File) => void;
  onClear?: () => void;
  onDownloadTemplate?: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  title,
  description,
  accept,
  status,
  fileName,
  onFileSelect,
  onClear,
  onDownloadTemplate,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const statusConfig = {
    idle: {
      bg: 'bg-white',
      border: 'border-slate-300',
      hoverBorder: 'hover:border-blue-400',
      icon: <Upload size={32} className="text-slate-400" />,
      textColor: 'text-slate-600',
    },
    loading: {
      bg: 'bg-blue-50',
      border: 'border-blue-300',
      hoverBorder: '',
      icon: (
        <div className="animate-spin">
          <Upload size={32} className="text-blue-500" />
        </div>
      ),
      textColor: 'text-blue-600',
    },
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-300',
      hoverBorder: '',
      icon: <CheckCircle2 size={32} className="text-emerald-500" />,
      textColor: 'text-emerald-600',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-300',
      hoverBorder: '',
      icon: <AlertCircle size={32} className="text-red-500" />,
      textColor: 'text-red-600',
    },
  };

  const config = statusConfig[status];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {onDownloadTemplate && (
          <button
            onClick={onDownloadTemplate}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            下载模板
          </button>
        )}
      </div>
      <p className="text-sm text-slate-500">{description}</p>

      {status === 'success' && fileName ? (
        <div className={cn('flex items-center gap-3 p-4 rounded-lg border', config.bg, config.border)}>
          <FileText size={20} className="text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-700 truncate">{fileName}</p>
            <p className="text-xs text-emerald-600">导入成功</p>
          </div>
          {onClear && (
            <button
              onClick={onClear}
              className="p-1.5 rounded-md hover:bg-emerald-100 transition-colors"
            >
              <X size={16} className="text-emerald-600" />
            </button>
          )}
        </div>
      ) : (
        <label
          className={cn(
            'block cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all duration-200',
            config.bg,
            config.border,
            isDragOver && 'border-blue-500 bg-blue-50 scale-[1.02]',
            status === 'idle' && config.hoverBorder
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={handleFileChange}
            disabled={status === 'loading'}
          />
          <div className="flex flex-col items-center gap-3">
            {config.icon}
            <div>
              <p className={cn('text-sm font-medium', config.textColor)}>
                {status === 'loading'
                  ? '正在导入...'
                  : status === 'error'
                  ? '导入失败，请重试'
                  : '拖拽文件到此处，或点击选择'}
              </p>
              <p className="text-xs text-slate-400 mt-1">支持 {accept.toUpperCase()} 格式</p>
            </div>
          </div>
        </label>
      )}
    </div>
  );
};
