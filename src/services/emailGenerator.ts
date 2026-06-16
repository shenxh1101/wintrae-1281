import type {
  Candidate,
  Interviewer,
  InterviewSchedule,
  Position,
  InterviewRound,
  EmailTemplate,
  GeneratedEmail,
  TemplateType,
} from '../types';
import { generateId } from '../utils/dateUtils';
import { replaceVariables, formatMeetingLink } from '../utils/stringUtils';
import { formatInterviewTime, getMeetingInfo } from './matcher';
import { MEETING_TYPE_LABELS } from '../types';
import { DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_INFO } from '../data/mockData';

interface GeneratorContext {
  candidates: Candidate[];
  interviewers: Interviewer[];
  positions: Position[];
  interviewRounds: InterviewRound[];
  schedules: InterviewSchedule[];
  templates: EmailTemplate[];
}

interface GenerateOptions {
  types?: TemplateType[];
  scheduleIds?: string[];
  onProgress?: (progress: number) => void;
}

export const generateEmails = (ctx: GeneratorContext, options: GenerateOptions = {}): GeneratedEmail[] => {
  const { types = ['candidate_invite', 'interviewer_notice'], scheduleIds, onProgress } = options;

  const emails: GeneratedEmail[] = [];
  const targetSchedules = scheduleIds
    ? ctx.schedules.filter((s) => scheduleIds.includes(s.id))
    : ctx.schedules;

  const total = targetSchedules.length * types.length;
  let processed = 0;

  targetSchedules.forEach((schedule) => {
    const candidate = ctx.candidates.find((c) => c.id === schedule.candidateId);
    const position = ctx.positions.find((p) => p.id === candidate?.positionId);
    const round = ctx.interviewRounds.find((r) => r.id === schedule.roundId);
    const scheduleInterviewers = ctx.interviewers.filter((i) =>
      schedule.interviewerIds.includes(i.id)
    );

    if (!candidate || !position || !round) return;

    if (schedule.meetingType === 'video' && !schedule.meetingLink) {
      schedule.meetingLink = formatMeetingLink('video');
    } else if (schedule.meetingType === 'onsite' && !schedule.location) {
      schedule.location = formatMeetingLink('onsite');
    } else if (schedule.meetingType === 'phone' && !schedule.meetingLink) {
      schedule.meetingLink = formatMeetingLink('phone');
    }

    const commonVariables = {
      companyName: DEFAULT_COMPANY_NAME,
      positionName: position.name,
      candidateName: candidate.name,
      roundName: round.roundName,
      interviewTime: formatInterviewTime(schedule.startTime, schedule.endTime, candidate.timezone),
      meetingType: MEETING_TYPE_LABELS[schedule.meetingType],
      interviewerNames: scheduleInterviewers.map((i) => i.name).join('、'),
      meetingInfo: getMeetingInfo(schedule.meetingType, schedule),
      contactInfo: DEFAULT_CONTACT_INFO,
    };

    if (types.includes('candidate_invite')) {
      const template = ctx.templates.find((t) => t.type === 'candidate_invite');
      if (template) {
        const variables = { ...commonVariables };

        emails.push({
          id: generateId(),
          scheduleId: schedule.id,
          type: 'candidate_invite',
          to: candidate.email,
          subject: replaceVariables(template.subject, variables),
          body: replaceVariables(template.body, variables),
          status: 'draft',
          createdAt: new Date().toISOString(),
        });
      }
      processed++;
      onProgress?.(Math.round((processed / total) * 100));
    }

    if (types.includes('interviewer_notice')) {
      const template = ctx.templates.find((t) => t.type === 'interviewer_notice');
      if (template) {
        scheduleInterviewers.forEach((interviewer) => {
          const variables = {
            ...commonVariables,
            interviewerName: interviewer.name,
            interviewTime: formatInterviewTime(schedule.startTime, schedule.endTime, interviewer.timezone),
          };

          emails.push({
            id: generateId(),
            scheduleId: schedule.id,
            type: 'interviewer_notice',
            to: interviewer.email,
            subject: replaceVariables(template.subject, variables),
            body: replaceVariables(template.body, variables),
            status: 'draft',
            createdAt: new Date().toISOString(),
          });
        });
      }
      processed++;
      onProgress?.(Math.round((processed / total) * 100));
    }

    if (types.includes('reschedule')) {
      const template = ctx.templates.find((t) => t.type === 'reschedule');
      if (template) {
        const variables = {
          ...commonVariables,
          reason: '面试官时间调整',
          oldInterviewTime: formatInterviewTime(schedule.startTime, schedule.endTime, candidate.timezone),
          newInterviewTime: formatInterviewTime(schedule.startTime, schedule.endTime, candidate.timezone),
        };

        emails.push({
          id: generateId(),
          scheduleId: schedule.id,
          type: 'reschedule',
          to: candidate.email,
          subject: replaceVariables(template.subject, variables),
          body: replaceVariables(template.body, variables),
          status: 'draft',
          createdAt: new Date().toISOString(),
        });
      }
      processed++;
      onProgress?.(Math.round((processed / total) * 100));
    }
  });

  return emails;
};

export const regenerateEmail = (
  email: GeneratedEmail,
  ctx: GeneratorContext
): GeneratedEmail => {
  const schedule = ctx.schedules.find((s) => s.id === email.scheduleId);
  if (!schedule) return email;

  const newEmails = generateEmails(ctx, {
    types: [email.type],
    scheduleIds: [schedule.id],
  });

  if (newEmails.length > 0) {
    return {
      ...newEmails[0],
      id: email.id,
      status: 'draft',
    };
  }

  return email;
};

export const getEmailStats = (emails: GeneratedEmail[]): Record<string, number> => {
  return emails.reduce(
    (acc, email) => {
      acc[email.type] = (acc[email.type] || 0) + 1;
      acc[email.status] = (acc[email.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
};

export const exportEmails = (emails: GeneratedEmail[]): string => {
  const headers = ['类型', '收件人', '主题', '状态', '创建时间'];
  const rows = emails.map((email) => [
    email.type,
    email.to,
    email.subject,
    email.status,
    new Date(email.createdAt).toLocaleString('zh-CN'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))].join('\n');
  return csvContent;
};
