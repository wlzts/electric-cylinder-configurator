import type { TransmissionType } from '@/types';

export const transmissions: TransmissionType[] = [
  {
    id: 'ball_screw',
    kind: 'ball_screw',
    name: 'Ball Screw',
    tagline: 'High precision · High force · High rigidity',
    advantages: [
      'High positioning accuracy and repeatability',
      'High mechanical efficiency (~90%)',
      'Excellent rigidity and load capacity',
      'Long service life with proper lubrication',
    ],
    limitations: [
      'Lower max speed compared to belt drive',
      'Critical speed limits at long strokes',
      'Higher cost than lead screw',
    ],
    recommendedFor: 'Precision positioning, high force, short-to-medium stroke',
  },
  {
    id: 'lead_screw',
    kind: 'lead_screw',
    name: 'Lead Screw',
    tagline: 'Cost effective · Self-locking · Medium speed',
    advantages: [
      'Lower cost than ball screw',
      'Self-locking characteristics (some leads)',
      'Quiet operation',
      'Simple maintenance',
    ],
    limitations: [
      'Lower efficiency (30–60%)',
      'Higher heat generation',
      'Limited speed and duty cycle',
    ],
    recommendedFor: 'Cost-sensitive, low duty cycle, vertical hold applications',
  },
  {
    id: 'timing_belt',
    kind: 'timing_belt',
    name: 'Timing Belt',
    tagline: 'High speed · Long stroke · Low noise',
    advantages: [
      'Very high linear speeds',
      'Long stroke capability',
      'Low noise operation',
      'Lower inertia for fast cycling',
    ],
    limitations: [
      'Lower positioning accuracy',
      'Belt stretch and wear over time',
      'Limited thrust capacity',
      'Requires tension maintenance',
    ],
    recommendedFor: 'High speed transfer, long stroke, packaging, sorting',
  },
];
