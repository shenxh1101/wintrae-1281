import type {
  Candidate,
  Interviewer,
  InterviewSchedule,
  ConflictInfo,
} from '../types';
import { generateId, isTimeOverlap, getMinutesDifference } from '../utils/dateUtils';
import { validateEmail, validatePhone, isEmpty } from '../utils/stringUtils';

interface VerifyContext {
  candidates: Candidate[];
  interviewers: Interviewer[];
  schedules: InterviewSchedule[];
}

export const runVerification = (ctx: VerifyContext): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];

  conflicts.push(...checkMissingContacts(ctx.candidates));
  conflicts.push(...checkCandidateUnavailable(ctx.candidates, ctx.schedules));
  conflicts.push(...checkTimeConflicts(ctx.schedules));
  conflicts.push(...checkInterviewerDensity(ctx.schedules, ctx.interviewers));

  return conflicts;
};

const checkMissingContacts = (candidates: Candidate[]): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];

  candidates.forEach((candidate) => {
    const issues: string[] = [];

    if (isEmpty(candidate.email)) {
      issues.push('邮箱');
    } else if (!validateEmail(candidate.email)) {
      issues.push('邮箱格式不正确');
    }

    if (isEmpty(candidate.phone)) {
      issues.push('电话');
    } else if (!validatePhone(candidate.phone)) {
      issues.push('电话格式不正确');
    }

    if (issues.length > 0) {
      conflicts.push({
        id: generateId(),
        type: 'missing_contact',
        severity: 'error',
        description: `候选人 ${candidate.name} 缺少联系方式：${issues.join('、')}`,
        relatedIds: [candidate.id],
      });
    }
  });

  return conflicts;
};

const checkCandidateUnavailable = (
  candidates: Candidate[],
  schedules: InterviewSchedule[]
): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];

  schedules.forEach((schedule) => {
    const candidate = candidates.find((c) => c.id === schedule.candidateId);
    if (!candidate || !candidate.unavailableTimes) return;

    const isUnavailable = candidate.unavailableTimes.some((unavailable) =>
      isTimeOverlap(schedule.startTime, schedule.endTime, unavailable.startTime, unavailable.endTime)
    );

    if (isUnavailable) {
      conflicts.push({
        id: generateId(),
        type: 'candidate_unavailable',
        severity: 'error',
        description: `候选人 ${candidate.name} 的面试时间与其不可用时段冲突`,
        relatedIds: [candidate.id, schedule.id],
        scheduleId: schedule.id,
      });
    }
  });

  return conflicts;
};

const checkTimeConflicts = (schedules: InterviewSchedule[]): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];
  const checkedPairs = new Set<string>();

  for (let i = 0; i < schedules.length; i++) {
    for (let j = i + 1; j < schedules.length; j++) {
      const s1 = schedules[i];
      const s2 = schedules[j];

      const pairId = [s1.id, s2.id].sort().join('-');
      if (checkedPairs.has(pairId)) continue;
      checkedPairs.add(pairId);

      const hasOverlap = isTimeOverlap(s1.startTime, s1.endTime, s2.startTime, s2.endTime);
      if (!hasOverlap) continue;

      const commonInterviewers = s1.interviewerIds.filter((id) => s2.interviewerIds.includes(id));
      if (commonInterviewers.length === 0) continue;

      conflicts.push({
        id: generateId(),
        type: 'time_conflict',
        severity: 'error',
        description: `时间冲突：两个面试安排在同一时间段，涉及面试官 ID: ${commonInterviewers.join(', ')}`,
        relatedIds: [s1.id, s2.id, ...commonInterviewers],
        scheduleId: s1.id,
      });
    }
  }

  return conflicts;
};

const checkInterviewerDensity = (
  schedules: InterviewSchedule[],
  interviewers: Interviewer[]
): ConflictInfo[] => {
  const conflicts: ConflictInfo[] = [];
  const minGap = 15;

  const interviewerSchedules = new Map<string, InterviewSchedule[]>();
  schedules.forEach((schedule) => {
    schedule.interviewerIds.forEach((interviewerId) => {
      if (!interviewerSchedules.has(interviewerId)) {
        interviewerSchedules.set(interviewerId, []);
      }
      interviewerSchedules.get(interviewerId)!.push(schedule);
    });
  });

  interviewerSchedules.forEach((scheds, interviewerId) => {
    const interviewer = interviewers.find((i) => i.id === interviewerId);
    const sortedSchedules = [...scheds].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    for (let i = 0; i < sortedSchedules.length - 1; i++) {
      const current = sortedSchedules[i];
      const next = sortedSchedules[i + 1];

      const gap = getMinutesDifference(current.endTime, next.startTime);

      if (gap < minGap && gap >= 0) {
        conflicts.push({
          id: generateId(),
          type: 'interviewer_too_dense',
          severity: 'warning',
          description: `面试官 ${interviewer?.name || interviewerId} 的连续面试间隔仅 ${gap} 分钟（建议至少 ${minGap} 分钟）`,
          relatedIds: [interviewerId, current.id, next.id],
          scheduleId: current.id,
        });
      }
    }
  });

  return conflicts;
};

export const getConflictsByType = (
  conflicts: ConflictInfo[]
): Record<string, ConflictInfo[]> => {
  const grouped: Record<string, ConflictInfo[]> = {
    time_conflict: [],
    missing_contact: [],
    interviewer_too_dense: [],
    candidate_unavailable: [],
  };

  conflicts.forEach((conflict) => {
    if (!grouped[conflict.type]) {
      grouped[conflict.type] = [];
    }
    grouped[conflict.type].push(conflict);
  });

  return grouped;
};

export const getConflictSeverityCount = (conflicts: ConflictInfo[]): { errors: number; warnings: number } => {
  return conflicts.reduce(
    (acc, conflict) => {
      if (conflict.severity === 'error') {
        acc.errors++;
      } else {
        acc.warnings++;
      }
      return acc;
    },
    { errors: 0, warnings: 0 }
  );
};
