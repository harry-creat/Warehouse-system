import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface UploadProgressProps {
  progress: number;
  status: 'idle' | 'uploading' | 'parsing' | 'confirming' | 'done' | 'error';
  error?: string;
}

const labels: Record<string, string> = {
  idle: '等待上传',
  uploading: '上传文件...',
  parsing: '解析数据...',
  confirming: '确认中...',
  done: '处理完成',
  error: '处理失败',
};

export default function UploadProgressComp({ progress, status, error }: UploadProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {status === 'uploading' || status === 'parsing' || status === 'confirming' ? (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        ) : status === 'done' ? (
          <CheckCircle className="w-5 h-5 text-green-500" />
        ) : status === 'error' ? (
          <XCircle className="w-5 h-5 text-red-500" />
        ) : null}
        <span className="text-sm font-medium text-slate-700">{labels[status]}</span>
      </div>
      {(status === 'uploading' || status === 'parsing' || status === 'confirming') && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
