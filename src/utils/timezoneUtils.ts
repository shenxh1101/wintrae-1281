export const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '中国标准时间 (UTC+8)', offset: 8 },
  { value: 'Asia/Tokyo', label: '日本标准时间 (UTC+9)', offset: 9 },
  { value: 'Asia/Singapore', label: '新加坡时间 (UTC+8)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: '香港时间 (UTC+8)', offset: 8 },
  { value: 'Asia/Seoul', label: '韩国标准时间 (UTC+9)', offset: 9 },
  { value: 'America/New_York', label: '美国东部时间 (UTC-5/-4)', offset: -5 },
  { value: 'America/Los_Angeles', label: '美国太平洋时间 (UTC-8/-7)', offset: -8 },
  { value: 'America/Chicago', label: '美国中部时间 (UTC-6/-5)', offset: -6 },
  { value: 'Europe/London', label: '英国时间 (UTC+0/+1)', offset: 0 },
  { value: 'Europe/Paris', label: '欧洲中部时间 (UTC+1/+2)', offset: 1 },
  { value: 'Australia/Sydney', label: '澳大利亚东部时间 (UTC+10/+11)', offset: 10 },
];

export const convertTime = (
  isoString: string,
  fromTimezone: string,
  toTimezone: string
): string => {
  const date = new Date(isoString);
  const fromTz = TIMEZONES.find((tz) => tz.value === fromTimezone);
  const toTz = TIMEZONES.find((tz) => tz.value === toTimezone);

  if (!fromTz || !toTz) {
    return isoString;
  }

  const utcTime = date.getTime() - fromTz.offset * 60 * 60 * 1000;
  const convertedTime = new Date(utcTime + toTz.offset * 60 * 60 * 1000);
  return convertedTime.toISOString();
};

export const getTimezoneOffset = (timezone: string): number => {
  const tz = TIMEZONES.find((tz) => tz.value === timezone);
  return tz ? tz.offset : 8;
};

export const getTimezoneLabel = (timezone: string): string => {
  const tz = TIMEZONES.find((tz) => tz.value === timezone);
  return tz ? tz.label : timezone;
};
