import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileUploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export default function FileUploadZone({ onFile, disabled }: FileUploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((accepted: File[], rejected: FileRejection[]) => {
    setError(null);
    if (rejected.length > 0) {
      setError('不支持的文件类型或文件过大（最大 10MB）');
      return;
    }
    if (accepted.length > 0) {
      onFile(accepted[0]);
    }
  }, [onFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled,
    maxSize: 10 * 1024 * 1024,
  });

  return (
    <div {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
      <input {...getInputProps()} />
      <Upload className="mx-auto w-10 h-10 text-slate-400 mb-3" />
      <p className="text-sm text-slate-600 font-medium">
        {isDragActive ? '松开文件以上传' : '拖拽文件到此处，或点击选择'}
      </p>
      <p className="text-xs text-slate-400 mt-1">支持 Excel (.xlsx, .xls)、CSV、PDF 格式，最大 10MB</p>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}
