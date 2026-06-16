import React, { useState, useEffect } from 'react';
import { Search, ArrowRight, Play, RefreshCw, Users, Clock, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { Progress } from '@/components/ui/Progress';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { MEETING_TYPE_LABELS } from '@/types';
import { formatDateTime } from '@/utils/dateUtils';

export const ParseModule: React.FC = () => {
  const {
    candidates,
    interviewers,
    positions,
    schedules,
    parseProgress,
    runMatching,
    setCurrentStep,
  } = useAppStore();

  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  useEffect(() => {
    if (schedules.length > 0) {
      setHasRun(true);
    }
  }, [schedules]);

  const handleRunMatching = async () => {
    setIsRunning(true);
    await runMatching();
    setIsRunning(false);
    setHasRun(true);
  };

  const getPositionName = (positionId: string) => {
    return positions.find((p) => p.id === positionId)?.name || positionId;
  };

  const getCandidateName = (candidateId: string) => {
    return candidates.find((c) => c.id === candidateId)?.name || candidateId;
  };

  const getInterviewerNames = (interviewerIds: string[]) => {
    return interviewerIds
      .map((id) => interviewers.find((i) => i.id === id)?.name || id)
      .join('、');
  };

  const matchedCount = schedules.length;
  const unmatchedCount = candidates.length - matchedCount;

  const isReady = candidates.length > 0 && interviewers.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">智能匹配</h2>
          <p className="mt-1 text-sm text-slate-500">
            系统将自动匹配岗位、轮次、时区、会议方式和可用时间段
          </p>
        </div>
        {!isReady && (
          <Badge variant="warning">请先导入数据</Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="待匹配候选人"
          value={candidates.length}
          icon={<Users size={24} />}
          variant="info"
        />
        <StatsCard
          title="已成功匹配"
          value={matchedCount}
          icon={<CheckCircle2 size={24} />}
          variant="success"
        />
        <StatsCard
          title="未匹配"
          value={unmatchedCount}
          icon={<AlertCircle size={24} />}
          variant={unmatchedCount > 0 ? 'warning' : 'default'}
        />
        <StatsCard
          title="生成面试安排"
          value={schedules.length}
          icon={<Clock size={24} />}
          variant="default"
        />
      </div>

      {!hasRun && isReady && (
        <Card className="border-dashed border-blue-300 bg-blue-50">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <Search size={32} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              开始智能匹配
            </h3>
            <p className="text-slate-600 mb-6 max-w-md">
              系统将根据候选人的岗位、面试轮次、时区偏好，以及面试官的可用时间，
              智能匹配最合适的面试安排。匹配过程可能需要几秒钟。
            </p>
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="lg"
                leftIcon={isRunning ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                onClick={handleRunMatching}
                disabled={isRunning}
              >
                {isRunning ? '匹配中...' : '开始匹配'}
              </Button>
            </div>
            {isRunning && (
              <div className="w-full max-w-md mt-6">
                <Progress value={parseProgress} showLabel />
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
                  <RefreshCw size={20} className="text-blue-600 animate-spin" />
                  <div className="flex-1">
                    <p className="font-medium text-slate-700">正在进行智能匹配...</p>
                    <p className="text-sm text-slate-500 mt-1">
                      正在分析候选人和面试官的时间可用性
                    </p>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{parseProgress}%</span>
                </div>
                <div className="mt-4">
                  <Progress value={parseProgress} />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>匹配结果</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<RefreshCw size={14} />}
                    onClick={handleRunMatching}
                    disabled={isRunning}
                  >
                    重新匹配
                  </Button>
                  {schedules.length > 0 && (
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight size={14} />}
                      onClick={() => setCurrentStep('verify')}
                    >
                      下一步：核对
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>候选人</TableHead>
                    <TableHead>应聘岗位</TableHead>
                    <TableHead>面试官</TableHead>
                    <TableHead>面试时间</TableHead>
                    <TableHead>方式</TableHead>
                    <TableHead>状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => {
                    const hasConflict = schedule.conflicts.length > 0;
                    return (
                      <TableRow key={schedule.id} className={hasConflict ? 'bg-red-50' : ''}>
                        <TableCell className="font-medium">
                          {getCandidateName(schedule.candidateId)}
                        </TableCell>
                        <TableCell>
                          {getPositionName(
                            candidates.find((c) => c.id === schedule.candidateId)?.positionId || ''
                          )}
                        </TableCell>
                        <TableCell>{getInterviewerNames(schedule.interviewerIds)}</TableCell>
                        <TableCell className="text-slate-500 font-mono text-xs">
                          {formatDateTime(schedule.startTime)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="info" size="sm">
                            {MEETING_TYPE_LABELS[schedule.meetingType]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasConflict ? (
                            <Badge variant="warning" size="sm">
                              存在问题
                            </Badge>
                          ) : (
                            <Badge variant="success" size="sm">
                              匹配成功
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              {schedules.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  <MapPin size={48} className="mx-auto mb-3 text-slate-300" />
                  <p>暂无匹配结果，请点击"开始匹配"</p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
