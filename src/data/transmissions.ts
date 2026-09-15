import type { TransmissionType } from '@/types';

export const transmissions: TransmissionType[] = [
  {
    id: 'ball_screw',
    kind: 'ball_screw',
    name: '滚珠丝杠',
    tagline: '高精度 · 大推力 · 高刚性',
    advantages: [
      '定位精度和重复定位精度高',
      '机械效率高（约90%）',
      '刚性好，承载能力强',
      '润滑得当则寿命长',
    ],
    limitations: [
      '最高转速低于同步带',
      '长行程时受临界转速限制',
      '成本高于滑动丝杠',
    ],
    recommendedFor: '精密定位、大推力、中短行程',
  },
  {
    id: 'lead_screw',
    kind: 'lead_screw',
    name: '滑动丝杠',
    tagline: '经济实惠 · 自锁特性 · 中速',
    advantages: [
      '成本低于滚珠丝杠',
      '部分导程具备自锁特性',
      '运行安静',
      '维护简单',
    ],
    limitations: [
      '效率较低（30–60%）',
      '发热量较大',
      '转速和占空比受限',
    ],
    recommendedFor: '成本敏感、低占空比、垂直保持应用',
  },
  {
    id: 'timing_belt',
    kind: 'timing_belt',
    name: '同步带',
    tagline: '高速度 · 长行程 · 低噪音',
    advantages: [
      '线速度极高',
      '支持长行程',
      '运行噪音低',
      '惯量小，适合快速循环',
    ],
    limitations: [
      '定位精度较低',
      '皮带长期使用会伸长磨损',
      '推力有限',
      '需定期张紧维护',
    ],
    recommendedFor: '高速搬运、长行程、包装分拣',
  },
];
