import React, { useState } from 'react';
import { Users, UserCheck, ArrowRight, Database, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { FileUpload } from '@/components/shared/FileUpload';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { generateCandidateTemplate, generateInterviewerTemplate } from '@/services/fileParser';
import { MEETING_TYPE_LABELS } from '@/types';

export const ImportModule: React.FC = () => {
  const {
    candidates,
    interviewers,
    positions,
    importStatus,
    importCandidates,
    importInterviewers,
    clearCandidates,
    clearInterviewers,
    loadMockData,
    setCurrentStep,
    runMatching,
  } = useAppStore();

  const [isMatching, setIsMatching] = useState(false);

  const [candidateFileName, setCandidateFileName] = useState<string>();
  const [interviewerFileName, setInterviewerFileName] = useState<string>();
  const [showPreview, setShowPreview] = useState(false);

  const handleCandidateSelect = async (file: File) => {
    setCandidateFileName(file.name);
    await importCandidates(file);
  };

  const handleInterviewerSelect = async (file: File) => {
    setInterviewerFileName(file.name);
    await importInterviewers(file);
  };

  const handleClearCandidates = () => {
    setCandidateFileName(undefined);
    clearCandidates();
  };

  const handleClearInterviewers = () => {
    setInterviewerFileName(undefined);
    clearInterviewers();
  };

  const handleDownloadCandidateTemplate = () => {
    const csv = generateCandidateTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '候选人信息模板.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadInterviewerTemplate = () => {
    const csv = generateInterviewerTemplate();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = '面试官信息模板.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const getPositionName = (positionId: string) => {
    return positions.find((p) => p.id === positionId)?.name || positionId;
  };

  const isReady = importStatus.candidates === 'success' && importStatus.interviewers === 'success';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">数据导入</h2>
          <p className="mt-1 text-sm text-slate-500">
            导入候选人信息表和面试官空闲时间表，系统将自动解析并进行匹配
          </p>
        </div>
        <Button
          variant="outline"
          leftIcon={<Database size={16} />}
          onClick={loadMockData}
        >
          加载示例数据
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="候选人总数"
          value={candidates.length}
          icon={<Users size={24} />}
          variant="info"
        />
        <StatsCard
          title="面试官总数"
          value={interviewers.length}
          icon={<UserCheck size={24} />}
          variant="success"
        />
        <StatsCard
          title="招聘岗位"
          value={positions.length}
          icon={<FileSpreadsheet size={24} />}
          variant="default"
        />
        <StatsCard
          title="导入状态"
          value={isReady ? '准备就绪' : '等待导入'}
          icon={<CheckCircle2 size={24} />}
          variant={isReady ? 'success' : 'warning'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-6">
            <FileUpload
              title="候选人信息表"
              description="上传包含候选人姓名、邮箱、电话、应聘岗位等信息的表格文件"
              accept=".csv,.xlsx,.xls"
              status={importStatus.candidates}
              fileName={candidateFileName}
              onFileSelect={handleCandidateSelect}
              onClear={handleClearCandidates}
              onDownloadTemplate={handleDownloadCandidateTemplate}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <FileUpload
              title="面试官空闲时间表"
              description="上传包含面试官姓名、邮箱、负责岗位、可用时间段等信息的表格文件"
              accept=".csv,.xlsx,.xls"
              status={importStatus.interviewers}
              fileName={interviewerFileName}
              onFileSelect={handleInterviewerSelect}
              onClear={handleClearInterviewers}
              onDownloadTemplate={handleDownloadInterviewerTemplate}
            />
          </CardContent>
        </Card>
      </div>

      <div className={`flex items-center justify-between rounded-lg p-4 border ${
        isReady 
          ? 'bg-emerald-50 border-emerald-200' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            isReady ? 'bg-emerald-100' : 'bg-amber-100'
          }`}>
            {isReady ? (
              <CheckCircle2 size={20} className="text-emerald-600" />
            ) : (
              <AlertCircle size={20} className="text-amber-600" />
            )}
          </div>
          <div>
            <p className={`font-medium ${isReady ? 'text-emerald-800' : 'text-amber-800'}`}>
              {isReady ? '数据导入完成' : '等待数据导入'}
            </p>
            <p className={`text-sm ${isReady ? 'text-emerald-600' : 'text-amber-600'}`}>
              {isReady
                ? `已导入 ${candidates.length} 位候选人和 ${interviewers.length} 位面试官`
                : importStatus.candidates !== 'success' && importStatus.interviewers !== 'success'
                  ? '请先导入候选人信息表和面试官空闲时间表'
                  : importStatus.candidates !== 'success'
                    ? '请先导入候选人信息表'
                    : '请先导入面试官空闲时间表'
              }
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          rightIcon={<ArrowRight size={16} />}
          isLoading={isMatching}
          disabled={!isReady || isMatching}
          onClick={async () => {
            setIsMatching(true);
            await runMatching();
            setIsMatching(false);
            setCurrentStep('parse');
          }}
        >
          开始智能匹配
        </Button>
      </div>

      {isReady && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900">数据预览</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? '收起' : '展开'}
            </Button>
          </div>

          {showPreview && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">候选人列表</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>邮箱</TableHead>
                        <TableHead>应聘岗位</TableHead>
                        <TableHead>面试方式</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.slice(0, 5).map((candidate) => (
                        <TableRow key={candidate.id}>
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell className="text-slate-500">{candidate.email}</TableCell>
                          <TableCell>
                            <Badge variant="info" size="sm">
                              {getPositionName(candidate.positionId)}
                            </Badge>
                          </TableCell>
                          <TableCell>{MEETING_TYPE_LABELS[candidate.preferredMeetingType]}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {candidates.length > 5 && (
                    <div className="px-4 py-3 text-center text-sm text-slate-500 border-t border-slate-200">
                      还有 {candidates.length - 5} 位候选人未显示
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">面试官列表</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>姓名</TableHead>
                        <TableHead>角色</TableHead>
                        <TableHead>负责岗位</TableHead>
                        <TableHead>可用时段</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {interviewers.slice(0, 5).map((interviewer) => (
                        <TableRow key={interviewer.id}>
                          <TableCell className="font-medium">{interviewer.name}</TableCell>
                          <TableCell className="text-slate-500">{interviewer.role}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {interviewer.positions.slice(0, 2).map((posId) => (
                                <Badge key={posId} variant="default" size="sm">
                                  {getPositionName(posId)}
                                </Badge>
                              ))}
                              {interviewer.positions.length > 2 && (
                                <Badge variant="default" size="sm">
                                  +{interviewer.positions.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {interviewer.availabilities.length} 个时段
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {interviewers.length > 5 && (
                    <div className="px-4 py-3 text-center text-sm text-slate-500 border-t border-slate-200">
                      还有 {interviewers.length - 5} 位面试官未显示
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
