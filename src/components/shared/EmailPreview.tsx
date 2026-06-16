import React from 'react';
import { Mail, User, Calendar, Copy, Check } from 'lucide-react';
import type { GeneratedEmail } from '@/types';
import { EMAIL_STATUS_LABELS } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDateTime } from '@/utils/dateUtils';

interface EmailPreviewProps {
  email: GeneratedEmail;
  onStatusChange?: (status: 'ready' | 'skipped') => void;
  onRegenerate?: () => void;
}

const typeLabels: Record<string, string> = {
  candidate_invite: '候选人邀请',
  interviewer_notice: '面试官通知',
  reschedule: '改期通知',
};

const statusVariants: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  draft: 'default',
  reviewed: 'info',
  skipped: 'warning',
  ready: 'success',
};

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  email,
  onStatusChange,
  onRegenerate,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">邮件预览</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariants[email.status]} size="sm">
              {EMAIL_STATUS_LABELS[email.status]}
            </Badge>
            <Badge variant="info" size="sm">
              {typeLabels[email.type]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <Mail size={16} className="text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 w-16">收件人：</span>
            <span className="text-slate-700 font-medium">{email.to}</span>
          </div>
          {email.cc && (
            <div className="flex items-center gap-2 text-sm">
              <User size={16} className="text-slate-400 flex-shrink-0" />
              <span className="text-slate-500 w-16">抄送：</span>
              <span className="text-slate-700">{email.cc}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={16} className="text-slate-400 flex-shrink-0" />
            <span className="text-slate-500 w-16">创建：</span>
            <span className="text-slate-600">{formatDateTime(email.createdAt)}</span>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">主题</span>
              <button
                onClick={() => copyToClipboard(email.subject)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                title="复制主题"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
              </button>
            </div>
            <p className="text-sm text-slate-900 font-medium bg-slate-50 p-3 rounded">
              {email.subject}
            </p>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">正文</span>
              <button
                onClick={() => copyToClipboard(email.body)}
                className="p-1 hover:bg-slate-100 rounded transition-colors"
                title="复制正文"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} className="text-slate-400" />}
              </button>
            </div>
            <div className="text-sm text-slate-700 bg-slate-50 p-4 rounded whitespace-pre-wrap leading-relaxed">
              {email.body}
            </div>
          </div>
        </div>
      </CardContent>
      {(onStatusChange || onRegenerate) && (
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-lg flex gap-2 justify-end">
          {onRegenerate && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRegenerate}
            >
              重新生成
            </Button>
          )}
          {onStatusChange && email.status !== 'skipped' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onStatusChange('skipped')}
            >
              跳过
            </Button>
          )}
          {onStatusChange && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onStatusChange('ready')}
            >
              确认发送
            </Button>
          )}
        </div>
      )}
    </Card>
  );
};
