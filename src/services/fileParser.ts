import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { Candidate, Interviewer, Position, InterviewRound, ImportResult, Availability, MeetingType } from '../types';
import { generateId } from '../utils/dateUtils';
import { validateEmail, validatePhone } from '../utils/stringUtils';

const parseCSV = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      encoding: 'UTF-8',
      complete: (results) => {
        resolve(results.data as T[]);
      },
      error: (error) => {
        reject(error);
      },
    });
  });
};

const parseExcel = <T>(file: File): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as T[];
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
};

const parseFile = async <T>(file: File): Promise<T[]> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV<T>(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseExcel<T>(file);
  }

  throw new Error(`不支持的文件格式: ${extension}`);
};

export const parseCandidates = async (file: File): Promise<ImportResult<Candidate>> => {
  const result: ImportResult<Candidate> = {
    success: true,
    data: [],
    errors: [],
    warnings: [],
  };

  try {
    const rawData = await parseFile<Record<string, string>>(file);

    rawData.forEach((row, index) => {
      const name = row['姓名'] || row['name'] || '';
      const email = row['邮箱'] || row['email'] || '';
      const phone = row['电话'] || row['phone'] || '';
      const positionId = row['岗位ID'] || row['positionId'] || '';
      const timezone = row['时区'] || row['timezone'] || 'Asia/Shanghai';
      const preferredMeetingType = (row['面试方式'] || row['preferredMeetingType'] || 'video') as MeetingType;

      if (!name.trim()) {
        result.errors.push(`第 ${index + 1} 行：候选人姓名不能为空`);
        return;
      }

      if (!email.trim()) {
        result.warnings.push(`第 ${index + 1} 行：候选人 ${name} 未填写邮箱`);
      } else if (!validateEmail(email)) {
        result.warnings.push(`第 ${index + 1} 行：候选人 ${name} 的邮箱格式不正确`);
      }

      if (phone && !validatePhone(phone)) {
        result.warnings.push(`第 ${index + 1} 行：候选人 ${name} 的电话格式不正确`);
      }

      const candidate: Candidate = {
        id: generateId(),
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        positionId: positionId.trim(),
        timezone: timezone.trim(),
        preferredMeetingType,
        status: 'pending',
        currentRound: parseInt(row['当前轮次'] || row['currentRound'] || '1', 10),
      };

      result.data.push(candidate);
    });

    if (result.data.length === 0) {
      result.success = false;
      result.errors.push('未解析到有效的候选人数据');
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`解析文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  return result;
};

export const parseInterviewers = async (file: File): Promise<ImportResult<Interviewer>> => {
  const result: ImportResult<Interviewer> = {
    success: true,
    data: [],
    errors: [],
    warnings: [],
  };

  try {
    const rawData = await parseFile<Record<string, string>>(file);

    rawData.forEach((row, index) => {
      const name = row['姓名'] || row['name'] || '';
      const email = row['邮箱'] || row['email'] || '';
      const positionsStr = row['负责岗位'] || row['positions'] || '';
      const timezone = row['时区'] || row['timezone'] || 'Asia/Shanghai';
      const role = row['角色'] || row['role'] || '';
      const availabilitiesStr = row['可用时间'] || row['availabilities'] || '';

      if (!name.trim()) {
        result.errors.push(`第 ${index + 1} 行：面试官姓名不能为空`);
        return;
      }

      if (!email.trim()) {
        result.errors.push(`第 ${index + 1} 行：面试官 ${name} 的邮箱不能为空`);
        return;
      } else if (!validateEmail(email)) {
        result.warnings.push(`第 ${index + 1} 行：面试官 ${name} 的邮箱格式不正确`);
      }

      const positions = positionsStr
        .split(/[,，;；]/)
        .map((s) => s.trim())
        .filter((s) => s);

      const availabilities: Availability[] = [];
      if (availabilitiesStr) {
        const timeSlots = availabilitiesStr.split(/[;；]/);
        timeSlots.forEach((slot, slotIndex) => {
          const [startTime, endTime] = slot.split('-').map((s) => s.trim());
          if (startTime && endTime) {
            availabilities.push({
              id: generateId(),
              interviewerId: '',
              startTime,
              endTime,
            });
          } else {
            result.warnings.push(`第 ${index + 1} 行：可用时间格式不正确，第 ${slotIndex + 1} 个时间段已跳过`);
          }
        });
      }

      const interviewer: Interviewer = {
        id: generateId(),
        name: name.trim(),
        email: email.trim(),
        positions,
        timezone: timezone.trim(),
        role: role.trim(),
        availabilities,
      };

      availabilities.forEach((a) => {
        a.interviewerId = interviewer.id;
      });

      result.data.push(interviewer);
    });

    if (result.data.length === 0) {
      result.success = false;
      result.errors.push('未解析到有效的面试官数据');
    }
  } catch (error) {
    result.success = false;
    result.errors.push(`解析文件失败: ${error instanceof Error ? error.message : '未知错误'}`);
  }

  return result;
};

export const generateCandidateTemplate = (): string => {
  const headers = ['姓名', '邮箱', '电话', '岗位ID', '时区', '面试方式', '当前轮次'];
  const sampleData = [
    ['张三', 'zhangsan@example.com', '13800138001', 'pos-001', 'Asia/Shanghai', 'video', '1'],
    ['李四', 'lisi@example.com', '13800138002', 'pos-002', 'Asia/Shanghai', 'onsite', '1'],
  ];

  const csvContent = [headers.join(','), ...sampleData.map((row) => row.join(','))].join('\n');
  return csvContent;
};

export const generateInterviewerTemplate = (): string => {
  const headers = ['姓名', '邮箱', '角色', '负责岗位', '时区', '可用时间'];
  const sampleData = [
    ['王经理', 'wang@example.com', '技术负责人', 'pos-001,pos-002', 'Asia/Shanghai', '2024-01-15T09:00:00-2024-01-15T12:00:00;2024-01-15T14:00:00-2024-01-15T18:00:00'],
  ];

  const csvContent = [headers.join(','), ...sampleData.map((row) => row.join(','))].join('\n');
  return csvContent;
};

export const generatePositionsFromData = (
  candidates: Candidate[],
  interviewers: Interviewer[]
): Position[] => {
  const positionMap = new Map<string, { name: string; department: string }>();

  candidates.forEach((candidate) => {
    if (candidate.positionId && !positionMap.has(candidate.positionId)) {
      positionMap.set(candidate.positionId, {
        name: candidate.positionId,
        department: '待定',
      });
    }
  });

  interviewers.forEach((interviewer) => {
    interviewer.positions.forEach((posId) => {
      if (posId && !positionMap.has(posId)) {
        positionMap.set(posId, {
          name: posId,
          department: '待定',
        });
      }
    });
  });

  return Array.from(positionMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    department: data.department,
    description: '',
  }));
};

export const generateInterviewRoundsFromData = (
  positions: Position[],
  interviewers: Interviewer[]
): InterviewRound[] => {
  const rounds: InterviewRound[] = [];

  positions.forEach((position) => {
    const positionInterviewers = interviewers.filter((i) =>
      i.positions.includes(position.id)
    );
    const roles = Array.from(new Set(positionInterviewers.map((i) => i.role)));

    if (roles.length === 0) {
      rounds.push({
        id: `round-${position.id}-1`,
        positionId: position.id,
        roundNumber: 1,
        roundName: '初面',
        duration: 60,
        requiredInterviewerRoles: [],
      });
    } else {
      roles.forEach((role, index) => {
        rounds.push({
          id: `round-${position.id}-${index + 1}`,
          positionId: position.id,
          roundNumber: index + 1,
          roundName: `${role}面`,
          duration: 60,
          requiredInterviewerRoles: [role],
        });
      });
    }

    rounds.push({
      id: `round-${position.id}-hr`,
      positionId: position.id,
      roundNumber: roles.length + 1,
      roundName: 'HR面',
      duration: 30,
      requiredInterviewerRoles: ['HR'],
    });
  });

  return rounds;
};
