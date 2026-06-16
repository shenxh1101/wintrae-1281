import React, { useState, useMemo } from 'react';
import {
  Eye,
  CheckCircle2,
  AlertCircle,
  SkipForward,
  RefreshCw,
  CheckSquare,
  Square,
  Download,
  Mail,
  FileText,
  Users,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { EmailPreview } from '@/components/shared/EmailPreview';
import type { GeneratedEmail, TemplateType, EmailStatus } from '@/types';
import { EMAIL_STATUS_LABELS } from '@/types';
import { exportEmails } from '@/services/emailGenerator';
import { formatDateTime } from '@/utils/dateUtils';

const typeLabels: Record<TemplateType, string> = {
  candidate_invite: '候选人邀请',
  interviewer_notice: '面试官通知',
  reschedule: '改期通知',
};

const statusVariants: Record<EmailStatus, 'success' | 'warning' | 'info' | 'default'> = {
  draft: 'default',
  reviewed: 'info',
  skipped: 'warning',
  ready: 'success',
};

export const ReviewModule: React.FC = () => {
  const {
    generatedEmails,
    selectedEmailId,
    selectEmail,
    updateEmailStatus,
    regenerateEmail,
    batchConfirmEmails,
  } = useAppStore();

  const [filterType, setFilterType] = useState<TemplateType | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<EmailStatus | 'all'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filteredEmails = useMemo(() => {
    return generatedEmails.filter((email) => {
      if (filterType !== 'all' && email.type !== filterType) return false;
      if (filterStatus !== 'all' && email.status !== filterStatus) return false;
      return true;
    });
  }, [generatedEmails, filterType, filterStatus]);

  const selectedEmail = useMemo(() => {
    return generatedEmails.find((e) => e.id === selectedEmailId) || filteredEmails[0] || null;
  }, [generatedEmails, selectedEmailId, filteredEmails]);

  const currentIndex = filteredEmails.findIndex((e) => e.id === selectedEmail?.id);

  const stats = useMemo(() => {
    const total = generatedEmails.length;
    const ready = generatedEmails.filter((e) => e.status === 'ready').length;
    const skipped = generatedEmails.filter((e) => e.status === 'skipped').length;
    const draft = generatedEmails.filter((e) => e.status === 'draft').length;
    const reviewed = generatedEmails.filter((e) => e.status === 'reviewed').length;
    const candidateInvites = generatedEmails.filter((e) => e.type === 'candidate_invite').length;
    const interviewerNotices = generatedEmails.filter((e) => e.type === 'interviewer_notice').length;
    return { total, ready, skipped, draft, reviewed, candidateInvites, interviewerNotices };
  }, [generatedEmails]);

  const handleStatusChange = (id: string, status: 'ready' | 'skipped') => {
    updateEmailStatus(id, status);
  };

  const handleRegenerate = (id: string) => {
    regenerateEmail(id);
  };

  const handleSelectEmail = (email: GeneratedEmail) => {
    selectEmail(email.id);
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredEmails.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmails.map((e) => e.id)));
    }
  };

  const handleBatchConfirm = () => {
    batchConfirmEmails();
  };

  const handleExport = () => {
    const readyEmails = generatedEmails.filter((e) => e.status === 'ready');
    const csv = exportEmails(readyEmails);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `待发送邮件列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      selectEmail(filteredEmails[currentIndex - 1].id);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredEmails.length - 1) {
      selectEmail(filteredEmails[currentIndex + 1].id);
    }
  };

  const typeFilters: { type: TemplateType | 'all'; label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'candidate_invite', label: '候选人邀请' },
    { type: 'interviewer_notice', label: '面试官通知' },
  ];

  const statusFilters: { status: EmailStatus | 'all'; label: string }[] = [
    { status: 'all', label: '全部状态' },
    { status: 'draft', label: '草稿' },
    { status: 'reviewed', label: '已审核' },
    { status: 'skipped', label: '已跳过' },
    { status: 'ready', label: '待发送' },
  ];

  const allSelected = selectedIds.size === filteredEmails.length && filteredEmails.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">发送前检查</h2>
          <p className="mt-1 text-sm text-slate-500">
            汇总待确认项，支持逐条预览、跳过和重新生成
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Download size={14} />}
          onClick={handleExport}
        >
          导出待发送列表
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <StatsCard
          title="邮件总数"
          value={stats.total}
          icon={<Mail size={20} />}
          variant="info"
        />
        <StatsCard
          title="待发送"
          value={stats.ready}
          icon={<CheckCircle2 size={20} />}
          variant="success"
        />
        <StatsCard
          title="草稿"
          value={stats.draft}
          icon={<FileText size={20} />}
          variant="default"
        />
        <StatsCard
          title="已审核"
          value={stats.reviewed}
          icon={<Eye size={20} />}
          variant="info"
        />
        <StatsCard
          title="已跳过"
          value={stats.skipped}
          icon={<SkipForward size={20} />}
          variant="warning"
        />
        <StatsCard
          title="候选人邀请"
          value={stats.candidateInvites}
          icon={<Users size={20} />}
          variant="default"
        />
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle>待确认邮件列表</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500 mr-2">类型：</span>
                {typeFilters.map((filter) => (
                  <button
                    key={filter.type}
                    onClick={() => setFilterType(filter.type)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterType === filter.type
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-sm text-slate-500 mr-2">状态：</span>
                {statusFilters.map((filter) => (
                  <button
                    key={filter.status}
                    onClick={() => setFilterStatus(filter.status)}
                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                      filterStatus === filter.status
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="p-1 hover:bg-slate-100 rounded"
              >
                {allSelected ? (
                  <CheckSquare size={18} className="text-blue-600" />
                ) : (
                  <Square size={18} className="text-slate-400" />
                )}
              </button>
              <span className="text-sm text-slate-500">
                已选择 {selectedIds.size} / {filteredEmails.length} 项
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBatchConfirm}
              >
                批量确认待发送
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex h-[600px]">
            <div className="w-1/2 border-r border-slate-200 overflow-y-auto">
              {filteredEmails.length > 0 ? (
                <div className="divide-y divide-slate-200">
                  {filteredEmails.map((email, index) => (
                    <div
                      key={email.id}
                      onClick={() => handleSelectEmail(email)}
                      className={`p-4 cursor-pointer transition-colors ${
                        selectedEmail?.id === email.id
                          ? 'bg-blue-50 border-l-4 border-l-blue-600'
                          : 'hover:bg-slate-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleSelect(email.id);
                          }}
                          className="mt-0.5 p-0.5 hover:bg-slate-200 rounded"
                        >
                          {selectedIds.has(email.id) ? (
                            <CheckSquare size={16} className="text-blue-600" />
                          ) : (
                            <Square size={16} className="text-slate-400" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="info" size="sm">
                              {typeLabels[email.type]}
                            </Badge>
                            <Badge variant={statusVariants[email.status]} size="sm">
                              {EMAIL_STATUS_LABELS[email.status]}
                            </Badge>
                            <span className="text-xs text-slate-400 ml-auto">
                              #{index + 1}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {email.subject}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            收件人：{email.to}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 font-mono">
                            {formatDateTime(email.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Mail size={48} className="mb-3 text-slate-300" />
                  <p>没有符合条件的邮件</p>
                </div>
              )}
            </div>

            <div className="w-1/2 flex flex-col">
              {selectedEmail ? (
                <>
                  <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-slate-50">
                    <span className="text-sm text-slate-500">
                      {currentIndex + 1} / {filteredEmails.length}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePrev}
                        disabled={currentIndex === 0}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleNext}
                        disabled={currentIndex === filteredEmails.length - 1}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <EmailPreview
                      email={selectedEmail}
                      onStatusChange={(status) => handleStatusChange(selectedEmail.id, status)}
                      onRegenerate={() => handleRegenerate(selectedEmail.id)}
                    />
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500">
                  <Eye size={48} className="mb-3 text-slate-300" />
                  <p>请选择一封邮件进行预览</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-lg">
            <CheckCircle2 size={20} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-medium text-emerald-800">检查完成</p>
            <p className="text-sm text-emerald-600">
              {stats.ready} 封邮件已确认待发送，{stats.skipped} 封已跳过
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download size={14} />}
            onClick={handleExport}
          >
            导出待发送列表
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleBatchConfirm}
          >
            全部确认待发送
          </Button>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckSquare size={20} className="text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">批量操作</p>
                  <p className="text-sm text-blue-600">
                    已选择 {selectedIds.size} 封邮件
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedIds.forEach((id) => handleStatusChange(id, 'skipped'));
                    setSelectedIds(new Set());
                  }}
                  leftIcon={<SkipForward size={14} />}
                >
                  批量跳过
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedIds.forEach((id) => handleRegenerate(id));
                    setSelectedIds(new Set());
                  }}
                  leftIcon={<RefreshCw size={14} />}
                >
                  批量重新生成
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    selectedIds.forEach((id) => handleStatusChange(id, 'ready'));
                    setSelectedIds(new Set());
                  }}
                  leftIcon={<CheckCircle2 size={14} />}
                >
                  批量确认待发送
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedIds(new Set())}
                >
                  <X size={14} />
                  取消选择
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {stats.ready > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">待发送邮件汇总</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={24} className="text-emerald-600" />
                <div>
                  <p className="text-lg font-semibold text-emerald-800">
                    准备就绪
                  </p>
                  <p className="text-emerald-600">
                    共有 {stats.ready} 封邮件已确认待发送，可以导出后进行邮件发送
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-sm text-slate-500">候选人邀请</p>
                  <p className="text-xl font-bold text-slate-900">
                    {generatedEmails.filter((e) => e.type === 'candidate_invite' && e.status === 'ready').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-sm text-slate-500">面试官通知</p>
                  <p className="text-xl font-bold text-slate-900">
                    {generatedEmails.filter((e) => e.type === 'interviewer_notice' && e.status === 'ready').length}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-emerald-200">
                  <p className="text-sm text-slate-500">涉及候选人</p>
                  <p className="text-xl font-bold text-slate-900">
                    {new Set(
                      generatedEmails
                        .filter((e) => e.status === 'ready')
                        .map((e) => e.scheduleId)
                    ).size}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
