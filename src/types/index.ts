export type MeetingType = 'video' | 'onsite' | 'phone';

export type CandidateStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

export type ScheduleStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export type ConflictType = 'time_conflict' | 'missing_contact' | 'interviewer_too_dense' | 'candidate_unavailable';

export type ConflictSeverity = 'error' | 'warning';

export type TemplateType = 'candidate_invite' | 'interviewer_notice' | 'reschedule';

export type EmailStatus = 'draft' | 'reviewed' | 'skipped' | 'ready';

export type StepType = 'import' | 'parse' | 'verify' | 'generate' | 'review';

export type ImportStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface Availability {
  id: string;
  interviewerId: string;
  startTime: string;
  endTime: string;
  recurring?: 'daily' | 'weekly' | null;
}

export interface Position {
  id: string;
  name: string;
  department: string;
  description: string;
}

export interface InterviewRound {
  id: string;
  positionId: string;
  roundNumber: number;
  roundName: string;
  duration: number;
  requiredInterviewerRoles: string[];
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  positionId: string;
  timezone: string;
  preferredMeetingType: MeetingType;
  status: CandidateStatus;
  unavailableTimes?: TimeRange[];
  currentRound?: number;
}

export interface Interviewer {
  id: string;
  name: string;
  email: string;
  positions: string[];
  timezone: string;
  role: string;
  availabilities: Availability[];
}

export interface ConflictInfo {
  id: string;
  type: ConflictType;
  severity: ConflictSeverity;
  description: string;
  relatedIds: string[];
  scheduleId?: string;
  resolved?: boolean;
}

export interface InterviewSchedule {
  id: string;
  candidateId: string;
  interviewerIds: string[];
  roundId: string;
  startTime: string;
  endTime: string;
  meetingType: MeetingType;
  meetingLink?: string;
  location?: string;
  status: ScheduleStatus;
  conflicts: ConflictInfo[];
  notes?: string;
}

export interface EmailTemplate {
  id: string;
  type: TemplateType;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface GeneratedEmail {
  id: string;
  scheduleId: string;
  type: TemplateType;
  to: string;
  cc?: string;
  subject: string;
  body: string;
  status: EmailStatus;
  createdAt: string;
}

export interface ImportResult<T> {
  success: boolean;
  data: T[];
  errors: string[];
  warnings: string[];
}

export interface AppState {
  candidates: Candidate[];
  interviewers: Interviewer[];
  positions: Position[];
  interviewRounds: InterviewRound[];
  schedules: InterviewSchedule[];
  templates: EmailTemplate[];
  generatedEmails: GeneratedEmail[];
  currentStep: StepType;
  importStatus: {
    candidates: ImportStatus;
    interviewers: ImportStatus;
  };
  parseProgress: number;
  verifyResults: ConflictInfo[];
  generateProgress: number;
  selectedEmailId: string | null;
}

export interface AppActions {
  setCurrentStep: (step: StepType) => void;
  importCandidates: (file: File) => Promise<void>;
  importInterviewers: (file: File) => Promise<void>;
  clearCandidates: () => void;
  clearInterviewers: () => void;
  loadMockData: () => void;
  runMatching: () => Promise<void>;
  runVerification: () => void;
  resolveConflict: (conflictId: string) => void;
  generateEmails: () => Promise<void>;
  updateSchedule: (id: string, updates: Partial<InterviewSchedule>) => void;
  updateEmailStatus: (id: string, status: EmailStatus) => void;
  regenerateEmail: (id: string) => void;
  selectEmail: (id: string | null) => void;
  batchConfirmEmails: () => void;
  resetAll: () => void;
}

export type AppStore = AppState & AppActions;

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  video: '视频会议',
  onsite: '现场面试',
  phone: '电话面试',
};

export const CONFLICT_TYPE_LABELS: Record<ConflictType, string> = {
  time_conflict: '时间冲突',
  missing_contact: '缺少联系方式',
  interviewer_too_dense: '面试官日程过密',
  candidate_unavailable: '候选人时间不可用',
};

export const STEP_LABELS: Record<StepType, string> = {
  import: '导入',
  parse: '解析',
  verify: '核对',
  generate: '生成',
  review: '发送前检查',
};

export const EMAIL_STATUS_LABELS: Record<EmailStatus, string> = {
  draft: '草稿',
  reviewed: '已审核',
  skipped: '已跳过',
  ready: '待发送',
};
