export const formatDateTime = (isoString: string, timezone?: string): string => {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone || 'Asia/Shanghai',
  };
  return date.toLocaleString('zh-CN', options);
};

export const formatDate = (isoString: string, timezone?: string): string => {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone || 'Asia/Shanghai',
  };
  return date.toLocaleDateString('zh-CN', options);
};

export const formatTime = (isoString: string, timezone?: string): string => {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: timezone || 'Asia/Shanghai',
  };
  return date.toLocaleTimeString('zh-CN', options);
};

export const addMinutes = (isoString: string, minutes: number): string => {
  const date = new Date(isoString);
  date.setMinutes(date.getMinutes() + minutes);
  return date.toISOString();
};

export const getMinutesDifference = (startIso: string, endIso: string): number => {
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return Math.round((end - start) / (1000 * 60));
};

export const isTimeOverlap = (
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean => {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 < e2 && s2 < e1;
};

export const isTimeInRange = (
  time: string,
  start: string,
  end: string
): boolean => {
  const t = new Date(time).getTime();
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  return t >= s && t <= e;
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getNextBusinessDay = (fromDate: Date = new Date()): Date => {
  const date = new Date(fromDate);
  do {
    date.setDate(date.getDate() + 1);
  } while (date.getDay() === 0 || date.getDay() === 6);
  return date;
};

export const setTime = (date: Date, hours: number, minutes: number): Date => {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
};
