import type { Candidate, Interviewer, Position, InterviewRound, EmailTemplate, Availability } from '../types';
import { generateId, setTime, getNextBusinessDay } from '../utils/dateUtils';

const generateAvailabilities = (interviewerId: string): Availability[] => {
  const nextMonday = getNextBusinessDay(new Date());
  const nextTuesday = getNextBusinessDay(nextMonday);
  const nextWednesday = getNextBusinessDay(nextTuesday);

  return [
    {
      id: generateId(),
      interviewerId,
      startTime: setTime(nextMonday, 9, 0).toISOString(),
      endTime: setTime(nextMonday, 12, 0).toISOString(),
    },
    {
      id: generateId(),
      interviewerId,
      startTime: setTime(nextMonday, 14, 0).toISOString(),
      endTime: setTime(nextMonday, 18, 0).toISOString(),
    },
    {
      id: generateId(),
      interviewerId,
      startTime: setTime(nextTuesday, 9, 0).toISOString(),
      endTime: setTime(nextTuesday, 12, 0).toISOString(),
    },
    {
      id: generateId(),
      interviewerId,
      startTime: setTime(nextTuesday, 14, 0).toISOString(),
      endTime: setTime(nextTuesday, 18, 0).toISOString(),
    },
    {
      id: generateId(),
      interviewerId,
      startTime: setTime(nextWednesday, 10, 0).toISOString(),
      endTime: setTime(nextWednesday, 16, 0).toISOString(),
    },
  ];
};

export const mockPositions: Position[] = [
  {
    id: 'pos-001',
    name: '高级前端工程师',
    department: '技术部',
    description: '负责公司核心产品的前端开发工作',
  },
  {
    id: 'pos-002',
    name: '后端开发工程师',
    department: '技术部',
    description: '负责公司后端服务的设计与开发',
  },
  {
    id: 'pos-003',
    name: '产品经理',
    department: '产品部',
    description: '负责产品规划、需求分析和产品迭代',
  },
  {
    id: 'pos-004',
    name: 'UI设计师',
    department: '设计部',
    description: '负责产品界面设计和用户体验优化',
  },
];

export const mockInterviewRounds: InterviewRound[] = [
  { id: 'round-001', positionId: 'pos-001', roundNumber: 1, roundName: '技术一面', duration: 60, requiredInterviewerRoles: ['前端工程师'] },
  { id: 'round-002', positionId: 'pos-001', roundNumber: 2, roundName: '技术二面', duration: 60, requiredInterviewerRoles: ['技术负责人'] },
  { id: 'round-003', positionId: 'pos-001', roundNumber: 3, roundName: 'HR面', duration: 30, requiredInterviewerRoles: ['HR'] },
  { id: 'round-004', positionId: 'pos-002', roundNumber: 1, roundName: '技术一面', duration: 60, requiredInterviewerRoles: ['后端工程师'] },
  { id: 'round-005', positionId: 'pos-002', roundNumber: 2, roundName: '技术二面', duration: 60, requiredInterviewerRoles: ['技术负责人'] },
  { id: 'round-006', positionId: 'pos-002', roundNumber: 3, roundName: 'HR面', duration: 30, requiredInterviewerRoles: ['HR'] },
  { id: 'round-007', positionId: 'pos-003', roundNumber: 1, roundName: '专业一面', duration: 60, requiredInterviewerRoles: ['产品经理'] },
  { id: 'round-008', positionId: 'pos-003', roundNumber: 2, roundName: '总监面', duration: 45, requiredInterviewerRoles: ['产品总监'] },
  { id: 'round-009', positionId: 'pos-003', roundNumber: 3, roundName: 'HR面', duration: 30, requiredInterviewerRoles: ['HR'] },
  { id: 'round-010', positionId: 'pos-004', roundNumber: 1, roundName: '专业一面', duration: 60, requiredInterviewerRoles: ['设计师'] },
  { id: 'round-011', positionId: 'pos-004', roundNumber: 2, roundName: '设计总监面', duration: 45, requiredInterviewerRoles: ['设计总监'] },
  { id: 'round-012', positionId: 'pos-004', roundNumber: 3, roundName: 'HR面', duration: 30, requiredInterviewerRoles: ['HR'] },
];

export const mockInterviewers: Interviewer[] = [
  {
    id: 'int-001',
    name: '张伟',
    email: 'zhangwei@example.com',
    positions: ['pos-001'],
    timezone: 'Asia/Shanghai',
    role: '前端工程师',
    availabilities: generateAvailabilities('int-001'),
  },
  {
    id: 'int-002',
    name: '李娜',
    email: 'lina@example.com',
    positions: ['pos-001', 'pos-002'],
    timezone: 'Asia/Shanghai',
    role: '技术负责人',
    availabilities: generateAvailabilities('int-002'),
  },
  {
    id: 'int-003',
    name: '王强',
    email: 'wangqiang@example.com',
    positions: ['pos-002'],
    timezone: 'Asia/Shanghai',
    role: '后端工程师',
    availabilities: generateAvailabilities('int-003'),
  },
  {
    id: 'int-004',
    name: '刘芳',
    email: 'liufang@example.com',
    positions: ['pos-003'],
    timezone: 'Asia/Shanghai',
    role: '产品经理',
    availabilities: generateAvailabilities('int-004'),
  },
  {
    id: 'int-005',
    name: '陈明',
    email: 'chenming@example.com',
    positions: ['pos-003'],
    timezone: 'Asia/Shanghai',
    role: '产品总监',
    availabilities: generateAvailabilities('int-005'),
  },
  {
    id: 'int-006',
    name: '赵雪',
    email: 'zhaoxue@example.com',
    positions: ['pos-004'],
    timezone: 'Asia/Shanghai',
    role: '设计师',
    availabilities: generateAvailabilities('int-006'),
  },
  {
    id: 'int-007',
    name: '孙磊',
    email: 'sunlei@example.com',
    positions: ['pos-004'],
    timezone: 'Asia/Shanghai',
    role: '设计总监',
    availabilities: generateAvailabilities('int-007'),
  },
  {
    id: 'int-008',
    name: '周婷',
    email: 'zhouting@example.com',
    positions: ['pos-001', 'pos-002', 'pos-003', 'pos-004'],
    timezone: 'Asia/Shanghai',
    role: 'HR',
    availabilities: generateAvailabilities('int-008'),
  },
];

export const mockCandidates: Candidate[] = [
  {
    id: 'can-001',
    name: '吴小明',
    email: 'wuxiaoming@example.com',
    phone: '13800138001',
    positionId: 'pos-001',
    timezone: 'Asia/Shanghai',
    preferredMeetingType: 'video',
    status: 'pending',
    currentRound: 1,
  },
  {
    id: 'can-002',
    name: '郑小红',
    email: 'zhengxiaohong@example.com',
    phone: '13800138002',
    positionId: 'pos-001',
    timezone: 'Asia/Shanghai',
    preferredMeetingType: 'video',
    status: 'pending',
    currentRound: 1,
  },
  {
    id: 'can-003',
    name: '黄大伟',
    email: 'huangdawei@example.com',
    phone: '',
    positionId: 'pos-002',
    timezone: 'Asia/Shanghai',
    preferredMeetingType: 'onsite',
    status: 'pending',
    currentRound: 1,
  },
  {
    id: 'can-004',
    name: '林小丽',
    email: 'linxiaoli@example.com',
    phone: '13800138004',
    positionId: 'pos-002',
    timezone: 'Asia/Tokyo',
    preferredMeetingType: 'video',
    status: 'pending',
    currentRound: 2,
    unavailableTimes: [
      {
        startTime: setTime(getNextBusinessDay(), 10, 0).toISOString(),
        endTime: setTime(getNextBusinessDay(), 12, 0).toISOString(),
      },
    ],
  },
  {
    id: 'can-005',
    name: '何建国',
    email: 'hejianguo@example.com',
    phone: '13800138005',
    positionId: 'pos-003',
    timezone: 'Asia/Shanghai',
    preferredMeetingType: 'video',
    status: 'pending',
    currentRound: 1,
  },
  {
    id: 'can-006',
    name: '马美玲',
    email: 'mameiling@example.com',
    phone: '13800138006',
    positionId: 'pos-003',
    timezone: 'Asia/Shanghai',
    preferredMeetingType: 'phone',
    status: 'pending',
    currentRound: 1,
  },
  {
    id: 'can-007',
    name: '朱小杰',
    email: 'zhuxiaojie@example.com',
    phone: '13800138007',
    positionId: 'pos-004',
    timezone: 'America/New_York',
    preferredMeetingType: 'video',
    status: 'pending',
    currentRound: 1,
  },
  {
    id: 'can-008',
    name: '胡小芳',
    email: 'huxiaofang@example.com',
    phone: '13800138008',
    positionId: 'pos-004',
    timezone: 'Asia/Shanghai',
    preferredMeetingType: 'video',
    status: 'pending',
    currentRound: 1,
  },
];

export const mockTemplates: EmailTemplate[] = [
  {
    id: 'tpl-001',
    type: 'candidate_invite',
    name: '候选人面试邀请',
    subject: '【{{companyName}}】{{positionName}}面试邀请 - {{candidateName}}',
    body: `尊敬的{{candidateName}}：

您好！

感谢您对{{companyName}}的关注，我们诚挚地邀请您参加{{positionName}}的{{roundName}}。

面试详情：
- 时间：{{interviewTime}}
- 方式：{{meetingType}}
- 面试官：{{interviewerNames}}
{{meetingInfo}}

面试准备：
- 请提前5分钟进入会议室或保持电话畅通
- 请准备好您的简历和相关作品
- 如需改期，请提前24小时联系我们

如有任何问题，请随时与我们联系。

期待与您的交流！

此致
敬礼

{{companyName}} HR团队
{{contactInfo}}`,
    variables: [
      'companyName',
      'positionName',
      'candidateName',
      'roundName',
      'interviewTime',
      'meetingType',
      'interviewerNames',
      'meetingInfo',
      'contactInfo',
    ],
  },
  {
    id: 'tpl-002',
    type: 'interviewer_notice',
    name: '面试官日程通知',
    subject: '【面试安排】{{positionName}} - {{candidateName}} - {{interviewTime}}',
    body: `您好{{interviewerName}}：

您有一场新的面试安排，详情如下：

候选人信息：
- 姓名：{{candidateName}}
- 应聘岗位：{{positionName}}
- 面试轮次：{{roundName}}

面试详情：
- 时间：{{interviewTime}}
- 方式：{{meetingType}}
{{meetingInfo}}

候选人简历已上传至招聘系统，请提前查阅。

如有时间冲突，请及时联系HR团队协调。

{{companyName}} HR团队`,
    variables: [
      'interviewerName',
      'candidateName',
      'positionName',
      'roundName',
      'interviewTime',
      'meetingType',
      'meetingInfo',
      'companyName',
    ],
  },
  {
    id: 'tpl-003',
    type: 'reschedule',
    name: '面试改期通知',
    subject: '【{{companyName}}】面试时间调整通知 - {{candidateName}}',
    body: `尊敬的{{candidateName}}：

您好！

由于{{reason}}，我们需要为您调整{{positionName}}的面试时间。

原面试安排：
- 时间：{{oldInterviewTime}}
- 方式：{{meetingType}}

新面试安排：
- 时间：{{newInterviewTime}}
- 方式：{{meetingType}}
- 面试官：{{interviewerNames}}
{{meetingInfo}}

如果新时间对您不合适，请及时联系我们重新安排。

给您带来的不便，深表歉意！

如有任何问题，请随时与我们联系。

此致
敬礼

{{companyName}} HR团队
{{contactInfo}}`,
    variables: [
      'companyName',
      'candidateName',
      'positionName',
      'reason',
      'oldInterviewTime',
      'newInterviewTime',
      'meetingType',
      'interviewerNames',
      'meetingInfo',
      'contactInfo',
    ],
  },
];

export const DEFAULT_COMPANY_NAME = '科技创新有限公司';
export const DEFAULT_CONTACT_INFO = '联系电话：400-123-4567 | 邮箱：hr@example.com';
