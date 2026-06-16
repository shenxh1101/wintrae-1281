import React, { useState, useEffect } from 'react';
import {
  Mail,
  ArrowRight,
  Play,
  RefreshCw,
  Users,
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { EMAIL_STATUS_LABELS } from '@/types';
import type { TemplateType, GeneratedEmail } from '@/types';
import { exportEmails } from '@/services/emailGenerator';
import { formatDateTime } from '@/utils/dateUtils';

const typeLabels: Record<TemplateType, string> = {
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

export const GenerateModule: React.FC = () => {
  const {
    candidates,
    interviewers,
    schedules,
    generatedEmails,
    templates,
    generateProgress,
    generateEmails,
    regenerateEmail,
    selectEmail,
    setCurrentStep,
  } = useAppStore();

  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<GeneratedEmail | null>(null);

  useEffect(() => {
    if (generatedEmails.length > 0) {
      setHasRun(true);
    }
  }, [generatedEmails]);

  const handleGenerate = async () => {
    setIsRunning(true);
    await generateEmails();
    setIsRunning(false);
    setHasRun(true);
  };

  const handleRegenerate = async (email: GeneratedEmail) => {
    regenerateEmail(email.id);
  };

  const handlePreview = (email: GeneratedEmail) => {
    setSelectedEmail(email);
    selectEmail(email.id);
  };

  const handleExport = () => {
    const csv = exportEmails(generatedEmails);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `面试邮件列表_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const emailTypeCount = generatedEmails.reduce(
    (acc, email) => {
      acc[email.type] = (acc[email.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const emailStatusCount = generatedEmails.reduce(
    (acc, email) => {
      acc[email.status] = (acc[email.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const isReady = schedules.length > 0;

  const getCandidateName = (candidateId: string) => {
    return candidates.find((c) => c.id === candidateId)?.name || candidateId;
  };

  const getInterviewerNames = (interviewerIds: string[]) => {
    return interviewerIds
      .map((id) => interviewers.find((i) => i.id === id)?.name || id)
      .join('、');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">批量生成</h2>
          <p className="mt-1 text-sm text-slate-500">
            批量生成候选人面试通知、面试官日程说明和改期模板
          </p>
        </div>
        {!isReady && <Badge variant="warning">请先完成核对</Badge>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatsCard
          title="待生成邮件"
          value={schedules.length * 3}
          icon={<Mail size={24} />}
          variant="info"
        />
        <StatsCard
          title="已生成邮件"
          value={generatedEmails.length}
          icon={<FileText size={24} />}
          variant="success"
        />
        <StatsCard
          title="候选人邀请"
          value={emailTypeCount.candidate_invite || 0}
          icon={<Users size={24} />}
          variant="default"
        />
        <StatsCard
          title="面试官通知"
          value={emailTypeCount.interviewer_notice || 0}
          icon={<FileText size={24} />}
          variant="default"
        />
        <StatsCard
          title="改期模板"
          value={emailTypeCount.reschedule || 0}
          icon={<RefreshCw size={24} />}
          variant="default"
        />
      </div>

      {!hasRun && isReady && (
        <Card className="border-dashed border-emerald-300 bg-emerald-50">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="bg-emerald-100 p-4 rounded-full mb-4">
              <Mail size={32} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              开始批量生成邮件
            </h3>
            <p className="text-slate-600 mb-6 max-w-md">
              系统将根据面试安排自动生成候选人面试邀请邮件和面试官日程通知邮件。
              生成过程可能需要几秒钟。
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                leftIcon={isRunning ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                onClick={handleGenerate}
                disabled={isRunning}
              >
                {isRunning ? '生成中...' : '批量生成'}
              </Button>
            </div>
            {isRunning && (
              <div className="w-full max-w-md mt-6">
                <Progress value={generateProgress} showLabel />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {hasRun && (
        <>
          {isRunning && (
            <Card>
              <CardContent className="py-6">
                <div className="flex items-center gap-4">
                  <RefreshCw size={20} className="text-emerald-600 animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">正在生成邮件...</p>
                    <p className="text-sm text-slate-500 mt-1">
                      正在根据模板生成候选人邀请和面试官通知
                    </p>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{generateProgress}%</span>
                </div>
                <div className="mt-4">
                  <Progress value={generateProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>生成结果</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Download size={14} />}
                    onClick={handleExport}
                  >
                    导出列表
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw size={14} />}
                    onClick={handleGenerate}
                    disabled={isRunning}
                  >
                    重新生成
                  </Button>
                  {generatedEmails.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={() => setCurrentStep('review')}
                    >
                      下一步：发送前检查
                    </Button>
                  )}
                </div>
              </div>
              {generatedEmails.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">邮件类型：</span>
                    {Object.entries(emailTypeCount).map(([type, count]) => (
                      <Badge key={type} variant="info" size="sm">
                        {typeLabels[type as TemplateType]}: {count}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-500">状态：</span>
                    {Object.entries(emailStatusCount).map(([status, count]) => (
                      <Badge key={status} variant={statusVariants[status]} size="sm">
                        {EMAIL_STATUS_LABELS[status as keyof typeof EMAIL_STATUS_LABELS]}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>类型</TableHead>
                    <TableHead>收件人</TableHead>
                    <TableHead>主题</TableHead>
                    <TableHead>关联候选人</TableHead>
                    <TableHead>创建时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedEmails.map((email) => {
                    const schedule = schedules.find((s) => s.id === email.scheduleId);
                    return (
                      <TableRow
                        key={email.id}
                        selected={selectedEmail?.id === email.id}
                        onClick={() => handlePreview(email)}
                      >
                        <TableCell>
                          <Badge variant="info" size="sm">
                            {typeLabels[email.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{email.to}</TableCell>
                        <TableCell className="max-w-xs truncate" title={email.subject}>
                          {email.subject}
                        </TableCell>
                        <TableCell>
                          {schedule
                            ? getCandidateName(schedule.candidateId)
                            : '-'}
                        </TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">
                          {formatDateTime(email.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusVariants[email.status]} size="sm">
                            {EMAIL_STATUS_LABELS[email.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(email);
                              }}
                            >
                              <Eye size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegenerate(email);
                              }}
                            >
                              <RefreshCw size={14} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {generatedEmails.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <Mail size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>暂无生成的邮件，请点击"批量生成"</p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedEmail && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="lg:col-span-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">邮件详情</CardTitle>
                    <button
                      onClick={() => {
                        setSelectedEmail(null);
                        selectEmail(null);
                      }}
                      className="p-1 hover:bg-slate-100 rounded"
                    >
                      ×
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-slate-500">类型</span>
                    <p className="font-medium">
                      <Badge variant="info" size="sm">
                        {typeLabels[selectedEmail.type]}
                      </Badge>
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">收件人</span>
                    <p className="font-medium">{selectedEmail.to}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">主题</span>
                    <p className="font-medium">{selectedEmail.subject}</p>
                  </div>
                  <div>
                    <span className="text-sm text-slate-500">状态</span>
                    <p>
                      <Badge variant={statusVariants[selectedEmail.status]} size="sm">
                        {EMAIL_STATUS_LABELS[selectedEmail.status]}
                      </Badge>
                    </p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRegenerate(selectedEmail)}
                    >
                      重新生成
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base">邮件正文预览</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 p-4 rounded-lg whitespace-pre-wrap text-sm text-slate-700 leading-relaxed max-h-96 overflow-y-auto">
                    {selectedEmail.body}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <CheckCircle2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="font-medium text-emerald-800">生成完成</p>
                <p className="text-sm text-emerald-600">
                  已成功生成 {generatedEmails.length} 封邮件
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => setCurrentStep('review')}
            >
              下一步：发送前检查
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
