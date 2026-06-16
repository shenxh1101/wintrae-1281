import { create } from 'zustand';
import type { AppStore, AppState, StepType, EmailStatus, InterviewSchedule, ImportStatus } from '../types';
import { mockCandidates, mockInterviewers, mockPositions, mockInterviewRounds, mockTemplates, DEFAULT_COMPANY_NAME, DEFAULT_CONTACT_INFO } from '../data/mockData';
import { parseCandidates, parseInterviewers, generatePositionsFromData, generateInterviewRoundsFromData } from '../services/fileParser';
import { runMatching } from '../services/matcher';
import { runVerification } from '../services/verifier';
import { generateEmails, regenerateEmail } from '../services/emailGenerator';

const defaultTemplates = mockTemplates;

const initialState: AppState = {
  candidates: [],
  interviewers: [],
  positions: [],
  interviewRounds: [],
  schedules: [],
  templates: defaultTemplates,
  generatedEmails: [],
  currentStep: 'import' as StepType,
  importStatus: {
    candidates: 'idle' as ImportStatus,
    interviewers: 'idle' as ImportStatus,
  },
  parseProgress: 0,
  verifyResults: [],
  generateProgress: 0,
  selectedEmailId: null as string | null,
};

const syncBaseData = (state: Partial<AppState>) => {
  const candidates = state.candidates || [];
  const interviewers = state.interviewers || [];
  
  if (candidates.length > 0 || interviewers.length > 0) {
    const positions = generatePositionsFromData(candidates, interviewers);
    const interviewRounds = generateInterviewRoundsFromData(positions, interviewers);
    return { positions, interviewRounds };
  }
  return { positions: [], interviewRounds: [] };
};

export const useAppStore = create<AppStore>((set, get) => ({
  ...initialState,

  setCurrentStep: (step: StepType) => {
    set({ currentStep: step });
  },

  importCandidates: async (file: File) => {
    set({ importStatus: { ...get().importStatus, candidates: 'loading' } });
    try {
      const result = await parseCandidates(file);
      if (result.success) {
        const state = { ...get(), candidates: result.data };
        const baseData = syncBaseData(state);
        set({
          candidates: result.data,
          positions: baseData.positions,
          interviewRounds: baseData.interviewRounds,
          importStatus: { ...get().importStatus, candidates: 'success' },
          schedules: [],
          generatedEmails: [],
          verifyResults: [],
        });
      } else {
        set({ importStatus: { ...get().importStatus, candidates: 'error' } });
      }
    } catch {
      set({ importStatus: { ...get().importStatus, candidates: 'error' } });
    }
  },

  importInterviewers: async (file: File) => {
    set({ importStatus: { ...get().importStatus, interviewers: 'loading' } });
    try {
      const result = await parseInterviewers(file);
      if (result.success) {
        const state = { ...get(), interviewers: result.data };
        const baseData = syncBaseData(state);
        set({
          interviewers: result.data,
          positions: baseData.positions,
          interviewRounds: baseData.interviewRounds,
          importStatus: { ...get().importStatus, interviewers: 'success' },
          schedules: [],
          generatedEmails: [],
          verifyResults: [],
        });
      } else {
        set({ importStatus: { ...get().importStatus, interviewers: 'error' } });
      }
    } catch {
      set({ importStatus: { ...get().importStatus, interviewers: 'error' } });
    }
  },

  clearCandidates: () => {
    const state = { ...get(), candidates: [] };
    const baseData = syncBaseData(state);
    set({
      candidates: [],
      positions: baseData.positions,
      interviewRounds: baseData.interviewRounds,
      importStatus: { ...get().importStatus, candidates: 'idle' },
      schedules: [],
      generatedEmails: [],
      verifyResults: [],
    });
  },

  clearInterviewers: () => {
    const state = { ...get(), interviewers: [] };
    const baseData = syncBaseData(state);
    set({
      interviewers: [],
      positions: baseData.positions,
      interviewRounds: baseData.interviewRounds,
      importStatus: { ...get().importStatus, interviewers: 'idle' },
      schedules: [],
      generatedEmails: [],
      verifyResults: [],
    });
  },

  loadMockData: () => {
    set({
      candidates: mockCandidates,
      interviewers: mockInterviewers,
      positions: mockPositions,
      interviewRounds: mockInterviewRounds,
      templates: mockTemplates,
      importStatus: {
        candidates: 'success',
        interviewers: 'success',
      },
      schedules: [],
      generatedEmails: [],
      verifyResults: [],
    });
  },

  runMatching: async () => {
    const state = get();
    set({ parseProgress: 0, schedules: [], verifyResults: [], generatedEmails: [] });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const result = runMatching(
      {
        candidates: state.candidates,
        interviewers: state.interviewers,
        positions: state.positions,
        interviewRounds: state.interviewRounds,
        existingSchedules: [],
      },
      (progress) => {
        set({ parseProgress: progress });
      }
    );
    set({
      schedules: result.schedules,
      parseProgress: 100,
    });
    if (result.conflicts.length > 0) {
      const schedulesWithConflicts = result.schedules.map((schedule) => {
        const scheduleConflicts = result.conflicts.filter((c) => c.scheduleId === schedule.id);
        return { ...schedule, conflicts: [...schedule.conflicts, ...scheduleConflicts] };
      });
      set({ schedules: schedulesWithConflicts });
    }
  },

  runVerification: () => {
    const state = get();
    const conflicts = runVerification({
      candidates: state.candidates,
      interviewers: state.interviewers,
      schedules: state.schedules,
    });
    const scheduleConflictsMap = new Map<string, typeof conflicts>();
    conflicts.forEach((conflict) => {
      if (conflict.scheduleId) {
        if (!scheduleConflictsMap.has(conflict.scheduleId)) {
          scheduleConflictsMap.set(conflict.scheduleId, []);
        }
        scheduleConflictsMap.get(conflict.scheduleId)!.push(conflict);
      }
    });
    const updatedSchedules = state.schedules.map((schedule) => {
      const additionalConflicts = scheduleConflictsMap.get(schedule.id) || [];
      return {
        ...schedule,
        conflicts: [...schedule.conflicts, ...additionalConflicts],
      };
    });
    set({
      verifyResults: conflicts,
      schedules: updatedSchedules,
    });
  },

  resolveConflict: (conflictId: string) => {
    const state = get();
    
    const updatedVerifyResults = state.verifyResults.map((c) =>
      c.id === conflictId ? { ...c, resolved: true } : c
    );
    
    const updatedSchedules = state.schedules.map((schedule) => ({
      ...schedule,
      conflicts: schedule.conflicts.map((c) =>
        c.id === conflictId ? { ...c, resolved: true } : c
      ),
    }));
    
    set({
      verifyResults: updatedVerifyResults,
      schedules: updatedSchedules,
    });
  },

  generateEmails: async () => {
    const state = get();
    set({ generateProgress: 0 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const emails = generateEmails(
      {
        candidates: state.candidates,
        interviewers: state.interviewers,
        positions: state.positions,
        interviewRounds: state.interviewRounds,
        schedules: state.schedules,
        templates: state.templates,
      },
      {
        types: ['candidate_invite', 'interviewer_notice', 'reschedule'],
        onProgress: (progress) => {
          set({ generateProgress: progress });
        },
      }
    );
    set({
      generatedEmails: emails,
      generateProgress: 100,
    });
  },

  updateSchedule: (id: string, updates: Partial<InterviewSchedule>) => {
    const state = get();
    const updatedSchedules = state.schedules.map((schedule) =>
      schedule.id === id ? { ...schedule, ...updates } : schedule
    );
    set({ schedules: updatedSchedules });
  },

  updateEmailStatus: (id: string, status: EmailStatus) => {
    const state = get();
    const updatedEmails = state.generatedEmails.map((email) =>
      email.id === id ? { ...email, status } : email
    );
    set({ generatedEmails: updatedEmails });
  },

  regenerateEmail: (id: string) => {
    const state = get();
    const email = state.generatedEmails.find((e) => e.id === id);
    if (!email) return;
    const newEmail = regenerateEmail(email, {
      candidates: state.candidates,
      interviewers: state.interviewers,
      positions: state.positions,
      interviewRounds: state.interviewRounds,
      schedules: state.schedules,
      templates: state.templates,
    });
    const updatedEmails = state.generatedEmails.map((e) => (e.id === id ? newEmail : e));
    set({ generatedEmails: updatedEmails });
  },

  selectEmail: (id: string | null) => {
    set({ selectedEmailId: id });
  },

  batchConfirmEmails: () => {
    const state = get();
    const updatedEmails = state.generatedEmails.map((email) =>
      email.status !== 'skipped' ? { ...email, status: 'ready' as const } : email
    );
    set({ generatedEmails: updatedEmails });
  },

  resetAll: () => {
    set(initialState);
  },
}));
