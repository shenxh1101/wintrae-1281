import type {
  Candidate,
  Interviewer,
  InterviewSchedule,
  Position,
  InterviewRound,
  ConflictInfo,
  MeetingType,
} from '../types';
import { generateId, addMinutes, isTimeOverlap, isTimeInRange, getMinutesDifference } from '../utils/dateUtils';
import { convertTime } from '../utils/timezoneUtils';
import { MEETING_TYPE_LABELS } from '../types';

interface MatchContext {
  candidates: Candidate[];
  interviewers: Interviewer[];
  positions: Position[];
  interviewRounds: InterviewRound[];
  existingSchedules: InterviewSchedule[];
}

interface MatchResult {
  schedules: InterviewSchedule[];
  conflicts: ConflictInfo[];
  stats: {
    total: number;
    matched: number;
    unmatched: number;
  };
}

const findSuitableInterviewers = (
  candidate: Candidate,
  round: InterviewRound,
  interviewers: Interviewer[]
): Interviewer[] => {
  return interviewers.filter((interviewer) => {
    if (!interviewer.positions.includes(candidate.positionId)) {
      return false;
    }
    if (!round.requiredInterviewerRoles.includes(interviewer.role)) {
      return false;
    }
    return true;
  });
};

const findAvailableTimeSlot = (
  candidate: Candidate,
  interviewers: Interviewer[],
  duration: number,
  existingSchedules: InterviewSchedule[],
  preferredMeetingType: MeetingType
): {
  startTime: string;
  endTime: string;
  interviewerIds: string[];
  meetingType: MeetingType;
} | null => {
  const candidateTimezone = candidate.timezone;

  for (const interviewer of interviewers) {
    const interviewerTimezone = interviewer.timezone;

    for (const availability of interviewer.availabilities) {
      const interviewerStart = availability.startTime;
      const interviewerEnd = availability.endTime;

      const slotDuration = getMinutesDifference(interviewerStart, interviewerEnd);
      if (slotDuration < duration) continue;

      const intervals = Math.floor((slotDuration - duration) / 30) + 1;

      for (let i = 0; i < intervals; i++) {
        const slotStart = addMinutes(interviewerStart, i * 30);
        const slotEnd = addMinutes(slotStart, duration);

        const candidateSlotStart = convertTime(slotStart, interviewerTimezone, candidateTimezone);
        const candidateSlotEnd = convertTime(slotEnd, interviewerTimezone, candidateTimezone);

        if (candidate.unavailableTimes) {
          const hasConflict = candidate.unavailableTimes.some((unavailable) =>
            isTimeOverlap(candidateSlotStart, candidateSlotEnd, unavailable.startTime, unavailable.endTime)
          );
          if (hasConflict) continue;
        }

        const hasInterviewerConflict = existingSchedules.some((schedule) =>
          schedule.interviewerIds.includes(interviewer.id) &&
          isTimeOverlap(slotStart, slotEnd, schedule.startTime, schedule.endTime)
        );
        if (hasInterviewerConflict) continue;

        const candidateHour = new Date(candidateSlotStart).getHours();
        if (candidateHour < 9 || candidateHour >= 18) continue;

        return {
          startTime: slotStart,
          endTime: slotEnd,
          interviewerIds: [interviewer.id],
          meetingType: preferredMeetingType,
        };
      }
    }
  }

  return null;
};

export const runMatching = (ctx: MatchContext, onProgress?: (progress: number) => void): MatchResult => {
  const schedules: InterviewSchedule[] = [];
  const conflicts: ConflictInfo[] = [];
  let matchedCount = 0;
  const totalCandidates = ctx.candidates.length;

  ctx.candidates.forEach((candidate, candidateIndex) => {
    const currentRound = candidate.currentRound || 1;
    const round = ctx.interviewRounds.find(
      (r) => r.positionId === candidate.positionId && r.roundNumber === currentRound
    );

    if (!round) {
      conflicts.push({
        id: generateId(),
        type: 'time_conflict',
        severity: 'error',
        description: `候选人 ${candidate.name} 的岗位未找到第 ${currentRound} 轮面试配置`,
        relatedIds: [candidate.id],
      });
      return;
    }

    const suitableInterviewers = findSuitableInterviewers(candidate, round, ctx.interviewers);

    if (suitableInterviewers.length === 0) {
      conflicts.push({
        id: generateId(),
        type: 'time_conflict',
        severity: 'error',
        description: `候选人 ${candidate.name} 未找到合适的面试官（需要 ${round.requiredInterviewerRoles.join('/')}）`,
        relatedIds: [candidate.id, candidate.positionId],
      });
      return;
    }

    const timeSlot = findAvailableTimeSlot(
      candidate,
      suitableInterviewers,
      round.duration,
      [...ctx.existingSchedules, ...schedules],
      candidate.preferredMeetingType
    );

    if (!timeSlot) {
      conflicts.push({
        id: generateId(),
        type: 'time_conflict',
        severity: 'error',
        description: `候选人 ${candidate.name} 未找到可用的时间段`,
        relatedIds: [candidate.id],
      });
      return;
    }

    const scheduleConflicts: ConflictInfo[] = [];

    const interviewerIds = timeSlot.interviewerIds;
    const minGap = 15;

    for (const interviewerId of interviewerIds) {
      const allSchedules = [...ctx.existingSchedules, ...schedules];
      const interviewerSchedules = allSchedules.filter((s) => s.interviewerIds.includes(interviewerId));

      for (const existing of interviewerSchedules) {
        const gapBefore = getMinutesDifference(existing.endTime, timeSlot.startTime);
        const gapAfter = getMinutesDifference(timeSlot.endTime, existing.startTime);

        if ((gapBefore > 0 && gapBefore < minGap) || (gapAfter > 0 && gapAfter < minGap)) {
          const interviewer = ctx.interviewers.find((i) => i.id === interviewerId);
          scheduleConflicts.push({
            id: generateId(),
            type: 'interviewer_too_dense',
            severity: 'warning',
            description: `面试官 ${interviewer?.name || interviewerId} 的连续面试间隔不足 ${minGap} 分钟`,
            relatedIds: [interviewerId, existing.id],
          });
        }
      }
    }

    const schedule: InterviewSchedule = {
      id: generateId(),
      candidateId: candidate.id,
      interviewerIds: timeSlot.interviewerIds,
      roundId: round.id,
      startTime: timeSlot.startTime,
      endTime: timeSlot.endTime,
      meetingType: timeSlot.meetingType,
      status: 'pending',
      conflicts: scheduleConflicts,
    };

    schedules.push(schedule);
    matchedCount++;

    if (onProgress) {
      onProgress(Math.round(((candidateIndex + 1) / totalCandidates) * 100));
    }
  });

  return {
    schedules,
    conflicts,
    stats: {
      total: totalCandidates,
      matched: matchedCount,
      unmatched: totalCandidates - matchedCount,
    },
  };
};

export const getMeetingInfo = (meetingType: MeetingType, schedule: InterviewSchedule): string => {
  switch (meetingType) {
    case 'video':
      return `- 会议链接：${schedule.meetingLink || '待生成'}`;
    case 'onsite':
      return `- 面试地点：${schedule.location || '待安排'}`;
    case 'phone':
      return `- 电话：${schedule.meetingLink || '待安排'}`;
    default:
      return '';
  }
};

export const formatInterviewTime = (
  startTime: string,
  endTime: string,
  timezone?: string
): string => {
  const formatDate = (date: Date): string => {
    return `${date.getFullYear()}年${String(date.getMonth() + 1).padStart(2, '0')}月${String(date.getDate()).padStart(2, '0')}日`;
  };

  const formatTime = (date: Date): string => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone || 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const startStr = startDate.toLocaleString('zh-CN', options);
  const endStr = endDate.toLocaleTimeString('zh-CN', { ...options, year: undefined, month: undefined, day: undefined });

  return `${startStr} - ${endStr}`;
};
