import React from 'react';
import { AlertTriangle, AlertCircle, Clock, UserX, PhoneOff } from 'lucide-react';
import type { ConflictInfo } from '@/types';
import { CONFLICT_TYPE_LABELS } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface ConflictCardProps {
  conflict: ConflictInfo;
  onResolve?: (conflict: ConflictInfo) => void;
}

const conflictIcons: Record<string, React.ReactNode> = {
  time_conflict: <Clock size={20} />,
  missing_contact: <PhoneOff size={20} />,
  interviewer_too_dense: <AlertTriangle size={20} />,
  candidate_unavailable: <UserX size={20} />,
};

export const ConflictCard: React.FC<ConflictCardProps> = ({ conflict, onResolve }) => {
  const isError = conflict.severity === 'error';

  return (
    <Card className={cn(
      'border-l-4 transition-all hover:shadow-md',
      isError ? 'border-l-red-500' : 'border-l-amber-500'
    )}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-lg flex-shrink-0',
              isError ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
            )}
          >
            {conflictIcons[conflict.type] || <AlertCircle size={20} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={isError ? 'error' : 'warning'} size="sm">
                {CONFLICT_TYPE_LABELS[conflict.type]}
              </Badge>
              <Badge variant={isError ? 'error' : 'warning'} size="sm">
                {isError ? '错误' : '警告'}
              </Badge>
            </div>
            <p className="mt-2 text-sm text-slate-700">{conflict.description}</p>
            {onResolve && (
              <button
                onClick={() => onResolve(conflict)}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                去处理 →
              </button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: (string | boolean)[]) {
  return classes.filter(Boolean).join(' ');
}
