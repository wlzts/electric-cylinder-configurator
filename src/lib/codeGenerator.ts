import type { Configuration } from '@/types';
import { cylinderSeries, ballScrews, timingBelts, motors, protocols } from '@/data';

// Generate configuration model code, e.g. EC80-BS25-L10-S800-SV750-BR-ECAT
export function generateConfigurationCode(config: Configuration): string {
  const parts: string[] = [];

  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  if (cyl) parts.push(cyl.model);

  if (config.transmission === 'timing_belt') {
    const belt = timingBelts.find((b) => b.id === config.beltId);
    if (belt) parts.push(`TB${belt.pitch.replace(/[^A-Z0-9]/gi, '')}W${belt.width}`);
  } else {
    const screw = ballScrews.find((s) => s.id === config.screwId);
    if (screw) {
      parts.push(`BS${screw.diameter}`);
      parts.push(`L${screw.lead}`);
    }
  }

  if (config.stroke > 0) parts.push(`S${config.stroke}`);

  const motor = motors.find((m) => m.id === config.motorId);
  if (motor) {
    const prefix = motor.type === 'servo' ? 'SV' : motor.type === 'stepper' ? 'ST' : 'CL';
    parts.push(`${prefix}${motor.power}`);
  }

  if (config.brake) parts.push('BR');

  const proto = protocols.find((p) => p.id === config.communicationId);
  if (proto) parts.push(proto.code);

  return parts.join('-');
}

export function generateConfigurationId(): string {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `CFG-${rand}`;
}
