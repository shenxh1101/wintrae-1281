export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

export const isEmpty = (value: string | undefined | null): boolean => {
  return value === undefined || value === null || value.trim() === '';
};

export const truncate = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const capitalizeFirst = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const replaceVariables = (
  template: string,
  variables: Record<string, string>
): string => {
  let result = template;
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, value || '');
  });
  return result;
};

export const extractVariables = (template: string): string[] => {
  const regex = /{{\s*(\w+)\s*}}/g;
  const variables: string[] = [];
  let match;
  while ((match = regex.exec(template)) !== null) {
    if (!variables.includes(match[1])) {
      variables.push(match[1]);
    }
  }
  return variables;
};

export const formatMeetingLink = (type: string): string => {
  const links: Record<string, string> = {
    video: 'https://meeting.example.com/join/' + Math.random().toString(36).substr(2, 8),
    phone: '+86 400-123-4567',
    onsite: '北京市朝阳区科技园区A座10层1001会议室',
  };
  return links[type] || '';
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  const chars = name.trim().split('');
  return chars.length > 0 ? chars[0].toUpperCase() : '';
};
