import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneOff,
  UserX,
  AlertTriangle,
  ArrowRight,
  Play,
  Filter,
  X,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatsCard } from '@/components/shared/StatsCard';
import { ConflictCard } from '@/components/shared/ConflictCard';
import type { ConflictType, ConflictInfo } from '@/types';
import { CONFLICT_TYPE_LABELS } from '@/types';
import { getConflictsByType, getConflictSeverityCount } from '@/services/verifier';

const conflictTypeIcons: Record<ConflictType, React.ReactNode> = {
  time_conflict: <Clock size={24} />,
  missing_contact: <PhoneOff size={24} />,
  interviewer_too_dense: <AlertTriangle size={24} />,
  candidate_unavailable: <UserX size={24} />,
};

export const VerifyModule: React.FC = () => {
  const {
    schedules,
    verifyResults,
    runVerification,
    setCurrentStep,
    updateSchedule,
  } = useAppStore();

  const [hasRun, setHasRun] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ConflictType | 'all'>('all');
  const [selectedConflict, setSelectedConflict] = useState<ConflictInfo | null>(null);

  useEffect(() => {
    if (verifyResults.length > 0) {
      setHasRun(true);
    }
  }, [verifyResults]);

  const handleRunVerification = () => {
    setIsRunning(true);
    setTimeout(() => {
      runVerification();
      setIsRunning(false);
      setHasRun(true);
    }, 800);
  };

  const handleResolveConflict = (conflict: ConflictInfo) => {
    setSelectedConflict(conflict);
  };

  const handleDismissConflict = (conflictId: string) => {
    if (selectedConflict?.id === conflictId) {
      setSelectedConflict(null);
    }
  };

  const groupedConflicts = getConflictsByType(verifyResults);
  const { errors, warnings } = getConflictSeverityCount(verifyResults);

  const filteredConflicts =
    activeFilter === 'all'
      ? verifyResults
      : groupedConflicts[activeFilter] || [];

  const isReady = schedules.length > 0;

  const conflictTypeFilters: { type: ConflictType | 'all'; label: string }[] = [
    { type: 'all', label: '全部' },
    { type: 'time_conflict', label: '时间冲突' },
    { type: 'missing_contact', label: '缺少联系方式' },
    { type: 'interviewer_too_dense', label: '日程过密' },
    { type: 'candidate_unavailable', label: '时间不可用' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">核对检查</h2>
          <p className="mt-1 text-sm text-slate-500">
            自动检测时间冲突、信息缺失、面试官日程密度和候选人时间可用性问题
          </p>
        </div>
        {!isReady && <Badge variant="warning">请先完成匹配</Badge>}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <StatsCard
          title="总问题数"
          value={verifyResults.length}
          icon={<AlertCircle size={20} />}
          variant={verifyResults.length > 0 ? 'warning' : 'success'}
        />
        <StatsCard
          title="错误"
          value={errors}
          icon={<AlertCircle size={20} />}
          variant="error"
        />
        <StatsCard
          title="警告"
          value={warnings}
          icon={<AlertTriangle size={20} />}
          variant="warning"
        />
        <StatsCard
          title="时间冲突"
          value={groupedConflicts.time_conflict?.length || 0}
          icon={<Clock size={20} />}
          variant={groupedConflicts.time_conflict?.length ? 'error' : 'default'}
        />
        <StatsCard
          title="缺少联系方式"
          value={groupedConflicts.missing_contact?.length || 0}
          icon={<PhoneOff size={20} />}
          variant={groupedConflicts.missing_contact?.length ? 'error' : 'default'}
        />
      </div>

      {!hasRun && isReady && (
        <Card className="border-dashed border-amber-300 bg-amber-50">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <div className="bg-amber-100 p-4 rounded-full mb-4">
              <AlertCircle size={32} className="text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              开始核对检查
            </h3>
            <p className="text-slate-600 mb-6 max-w-md">
              系统将自动检测面试安排中的各类问题，包括时间冲突、信息缺失、
              面试官日程过密和候选人时间不可用。
            </p>
            <Button
              variant="primary"
              size="lg"
              leftIcon={isRunning ? <AlertCircle size={18} className="animate-pulse" /> : <Play size={18} />}
              onClick={handleRunVerification}
              disabled={isRunning}
            >
              {isRunning ? '检查中...' : '开始核对'}
            </Button>
          </CardContent>
        </Card>
      )}

      {hasRun && (
        <>
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle>问题列表</CardTitle>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-400" />
                    <div className="flex flex-wrap gap-1">
                      {conflictTypeFilters.map((filter) => (
                        <button
                          key={filter.type}
                          onClick={() => setActiveFilter(filter.type)}
                          className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                            activeFilter === filter.type
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {filter.label}
                          <span className="ml-1">
                            ({filter.type === 'all'
                              ? verifyResults.length
                              : groupedConflicts[filter.type as ConflictType]?.length || 0})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRunVerification}
                    disabled={isRunning}
                  >
                    重新检查
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredConflicts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredConflicts.map((conflict) => (
                    <ConflictCard
                      key={conflict.id}
                      conflict={conflict}
                      onResolve={handleResolveConflict}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="bg-emerald-100 p-4 rounded-full inline-flex mb-4">
                    <CheckCircle2 size={32} className="text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    {activeFilter === 'all' ? '全部通过' : `${CONFLICT_TYPE_LABELS[activeFilter as ConflictType]}检查通过`}
                  </h3>
                  <p className="text-slate-500">
                    {activeFilter === 'all'
                      ? '未发现任何问题，所有面试安排均符合要求'
                      : '该类别下未发现问题'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedConflict && (
            <Card className="border-blue-300 bg-blue-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">问题详情</CardTitle>
                  <button
                    onClick={() => setSelectedConflict(null)}
                    className="p-1 hover:bg-blue-100 rounded"
                  >
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg flex-shrink-0 ${
                      selectedConflict.severity === 'error'
                        ? 'bg-red-100 text-red-600'
                        : 'bg-amber-100 text-amber-600'
                    }`}
                  >
                    {conflictTypeIcons[selectedConflict.type]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant={selectedConflict.severity === 'error' ? 'error' : 'warning'}>
                        {CONFLICT_TYPE_LABELS[selectedConflict.type]}
                      </Badge>
                      <Badge variant={selectedConflict.severity === 'error' ? 'error' : 'warning'}>
                        {selectedConflict.severity === 'error' ? '错误' : '警告'}
                      </Badge>
                    </div>
                    <p className="text-slate-700">{selectedConflict.description}</p>
                    <div className="mt-4 flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          if (selectedConflict.scheduleId) {
                            updateSchedule(selectedConflict.scheduleId, {
                              conflicts: [],
                            });
                          }
                          setSelectedConflict(null);
                        }}
                      >
                        标记为已解决
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentStep('parse')}
                      >
                        返回调整
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              {verifyResults.length === 0 ? (
                <>
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <CheckCircle2 size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-emerald-800">核对通过</p>
                    <p className="text-sm text-emerald-600">
                      所有面试安排均已通过检查，可以生成邮件
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-amber-100 p-2 rounded-lg">
                    <AlertTriangle size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800">存在待处理问题</p>
                    <p className="text-sm text-amber-600">
                      发现 {errors} 个错误和 {warnings} 个警告，建议先处理后再继续
                    </p>
                  </div>
                </>
              )}
            </div>
            <Button
              variant="primary"
              rightIcon={<ArrowRight size={16} />}
              onClick={() => setCurrentStep('generate')}
            >
              下一步：生成邮件
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
