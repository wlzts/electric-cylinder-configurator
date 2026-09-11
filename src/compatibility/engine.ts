import type {
  ApplicationRequirement,
  Configuration,
  CompatibilityStatus,
  CylinderSeries,
  TransmissionKind,
  BallScrew,
  TimingBelt,
  Motor,
  Drive,
  Encoder,
  Accessory,
  CommunicationProtocol,
} from '@/types';
import {
  cylinderSeries,
  transmissions,
  motors,
  drives,
  protocols,
} from '@/data';
import { calculateRequiredThrust, calculateMotorTorque, calculateMotorRPM, calculateScrewCriticalSpeed, ENGINEERING_CONFIG } from '@/engineering';

export interface CompatibilityResult {
  status: CompatibilityStatus;
  reasons: string[];
}

const WORST: Record<CompatibilityStatus, number> = {
  incompatible: 3,
  warning: 2,
  compatible: 1,
  recommended: 0,
};

function worst(a: CompatibilityStatus, b: CompatibilityStatus): CompatibilityStatus {
  return WORST[a] >= WORST[b] ? a : b;
}

// ---------------------------------------------------------------------------
// Cylinder series compatibility against requirements
// ---------------------------------------------------------------------------
export function checkCylinder(
  cyl: CylinderSeries,
  req: ApplicationRequirement,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';

  const requiredThrust = calculateRequiredThrust(req);
  if (cyl.maxThrust < requiredThrust) {
    status = 'incompatible';
    reasons.push(`Max thrust ${cyl.maxThrust} N is below required ${Math.round(requiredThrust)} N.`);
  } else if (cyl.maxThrust < requiredThrust * 1.5) {
    status = worst(status, 'warning');
    reasons.push(`Thrust margin is narrow (${Math.round(cyl.maxThrust / requiredThrust)}×).`);
  }
  if (cyl.maxPayload < req.payload) {
    status = 'incompatible';
    reasons.push(`Max payload ${cyl.maxPayload} kg is below required ${req.payload} kg.`);
  }
  if (cyl.maxStroke < req.stroke) {
    status = 'incompatible';
    reasons.push(`Max stroke ${cyl.maxStroke} mm is below required ${req.stroke} mm.`);
  }
  if (cyl.maxSpeed < req.targetSpeed) {
    status = worst(status, 'warning');
    reasons.push(`Max speed ${cyl.maxSpeed} mm/s is below target ${req.targetSpeed} mm/s.`);
  }
  if (req.environment === 'cleanroom' && cyl.protection !== 'IP67') {
    status = worst(status, 'warning');
    reasons.push('Cleanroom environment may require higher protection rating.');
  }
  if (reasons.length === 0) reasons.push('Meets all application requirements.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Transmission compatibility with cylinder
// ---------------------------------------------------------------------------
export function checkTransmission(
  kind: TransmissionKind,
  config: Configuration,
  req: ApplicationRequirement,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);

  if (cyl && !cyl.compatibleTransmissions.includes(kind)) {
    status = 'incompatible';
    reasons.push(`${cyl.model} does not support ${transmissions.find((t) => t.kind === kind)?.name ?? kind}.`);
  }
  if (kind === 'timing_belt' && req.repeatability < 0.03) {
    status = worst(status, 'warning');
    reasons.push('Timing belt typically cannot achieve ±0.03 mm repeatability; consider ball screw.');
  }
  if (kind === 'lead_screw' && req.dailyHours > 6) {
    status = worst(status, 'warning');
    reasons.push('Lead screw at high duty cycle may overheat; consider ball screw.');
  }
  if (kind === 'ball_screw' && req.targetSpeed > 1500) {
    status = worst(status, 'warning');
    reasons.push('Ball screw at very high speed may hit critical speed; consider timing belt.');
  }
  if (reasons.length === 0) reasons.push('Transmission is suitable for this application.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Ball screw compatibility
// ---------------------------------------------------------------------------
export function checkScrew(
  screw: BallScrew,
  config: Configuration,
  req: ApplicationRequirement,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);

  if (cyl && !screw.compatibleSeries.includes(cyl.id)) {
    status = 'incompatible';
    reasons.push(`${screw.model} is not compatible with ${cyl.model}.`);
  }
  if (screw.maxStroke < config.stroke) {
    status = 'incompatible';
    reasons.push(`Screw max stroke ${screw.maxStroke} mm is below configured ${config.stroke} mm.`);
  }
  // Critical speed check
  const critical = calculateScrewCriticalSpeed({ ...config, screwId: screw.id }, config.stroke);
  const rpm = calculateMotorRPM(req, { ...config, screwId: screw.id });
  if (critical && rpm && rpm > critical * ENGINEERING_CONFIG.criticalSpeedMargin) {
    status = worst(status, 'warning');
    reasons.push(
      `Current screw lead exceeds the permitted critical speed at the requested travel speed (critical ${Math.round(critical)} RPM).`,
    );
  }
  // Accuracy vs requirement
  const screwRepeat = screw.accuracy === 'C3' ? 0.005 : screw.accuracy === 'C5' ? 0.01 : 0.02;
  if (screwRepeat > req.repeatability) {
    status = worst(status, 'warning');
    reasons.push(`Screw accuracy ${screw.accuracy} may not achieve ±${req.repeatability} mm repeatability.`);
  }
  if (reasons.length === 0) reasons.push('Screw is compatible.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Timing belt compatibility
// ---------------------------------------------------------------------------
export function checkBelt(
  belt: TimingBelt,
  config: Configuration,
  req: ApplicationRequirement,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);

  if (cyl && !belt.compatibleSeries.includes(cyl.id)) {
    status = 'incompatible';
    reasons.push(`${belt.series} ${belt.pitch} ${belt.width}mm belt is not compatible with ${cyl.model}.`);
  }
  if (belt.maxSpeed < req.targetSpeed) {
    status = 'incompatible';
    reasons.push(`Belt max speed ${belt.maxSpeed} mm/s is below target ${req.targetSpeed} mm/s.`);
  }
  const requiredThrust = calculateRequiredThrust(req);
  if (belt.ratedLoad < requiredThrust) {
    status = 'incompatible';
    reasons.push(`Belt rated load ${belt.ratedLoad} N is below required ${Math.round(requiredThrust)} N.`);
  }
  if (reasons.length === 0) reasons.push('Belt is compatible.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Motor compatibility
// ---------------------------------------------------------------------------
export function checkMotor(
  motor: Motor,
  config: Configuration,
  req: ApplicationRequirement,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);

  if (cyl && !motor.compatibleCylinderSeries.includes(cyl.id)) {
    status = 'incompatible';
    reasons.push(`${motor.name} is not compatible with ${cyl.model}.`);
  }
  // Torque
  const requiredTorque = calculateMotorTorque(req, { ...config, motorId: motor.id });
  if (requiredTorque && motor.ratedTorque < requiredTorque) {
    status = 'incompatible';
    reasons.push(
      `This motor cannot provide sufficient torque for the current load (required ${requiredTorque.toFixed(2)} Nm, rated ${motor.ratedTorque} Nm).`,
    );
  } else if (requiredTorque && motor.peakTorque < requiredTorque) {
    status = worst(status, 'warning');
    reasons.push('Required torque exceeds rated but is within peak; verify duty cycle.');
  }
  // RPM
  const requiredRPM = calculateMotorRPM(req, config);
  if (requiredRPM && motor.maxRPM < requiredRPM) {
    status = worst(status, 'warning');
    reasons.push(`Required RPM ${Math.round(requiredRPM)} approaches motor max ${motor.maxRPM}.`);
  }
  // Brake
  if (req.orientation === 'vertical' && !motor.brakeAvailable && (req.brakeRequired || config.brake)) {
    status = 'incompatible';
    reasons.push('This motor does not offer a brake, which is required for vertical application.');
  }
  // Power vs cylinder
  if (cyl && !cyl.compatibleMotorPowers.includes(motor.power)) {
    status = worst(status, 'warning');
    reasons.push(`${motor.power}W is outside the typical power range for ${cyl.model}.`);
  }
  if (reasons.length === 0) reasons.push('Motor is compatible.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Drive compatibility
// ---------------------------------------------------------------------------
export function checkDrive(
  drive: Drive,
  config: Configuration,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const motor = motors.find((m) => m.id === config.motorId);

  if (motor && !drive.motorCompatibility.includes(motor.id)) {
    status = 'incompatible';
    reasons.push(`${drive.name} cannot drive ${motor.name}.`);
  }
  if (motor && !drive.supportedMotorTypes.includes(motor.type)) {
    status = 'incompatible';
    reasons.push(`${drive.name} does not support ${motor.type} motors.`);
  }
  if (config.communicationId && !drive.communication.includes(config.communicationId)) {
    status = worst(status, 'warning');
    const proto = protocols.find((p) => p.id === config.communicationId);
    reasons.push(`${drive.name} does not support ${proto?.name ?? config.communicationId}; communication will be adjusted.`);
  }
  if (reasons.length === 0) reasons.push('Drive is compatible.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Encoder compatibility
// ---------------------------------------------------------------------------
export function checkEncoder(
  encoder: Encoder,
  config: Configuration,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const motor = motors.find((m) => m.id === config.motorId);

  if (motor && !motor.encoderOptions.includes(encoder.id)) {
    status = 'incompatible';
    reasons.push(`${encoder.name} is not available on ${motor.name}.`);
  }
  if (reasons.length === 0) reasons.push('Encoder is compatible.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Accessory compatibility
// ---------------------------------------------------------------------------
export function checkAccessory(
  acc: Accessory,
  config: Configuration,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);

  if (cyl && !acc.compatibleSeries.includes(cyl.id)) {
    status = 'incompatible';
    reasons.push(`${acc.name} is not available for ${cyl.model}.`);
  }
  if (reasons.length === 0) reasons.push('Accessory is compatible.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Protocol compatibility with drive
// ---------------------------------------------------------------------------
export function checkProtocol(
  proto: CommunicationProtocol,
  config: Configuration,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';
  const drive = drives.find((d) => d.id === config.driveId);

  if (drive && !drive.communication.includes(proto.id)) {
    status = 'incompatible';
    reasons.push(`${drive.name} does not support ${proto.name}.`);
  }
  if (reasons.length === 0) reasons.push('Protocol is supported.');
  return { status, reasons };
}

// ---------------------------------------------------------------------------
// Overall configuration health
// ---------------------------------------------------------------------------
export function evaluateConfiguration(
  config: Configuration,
  req: ApplicationRequirement,
): CompatibilityResult {
  const reasons: string[] = [];
  let status: CompatibilityStatus = 'recommended';

  const cyl = cylinderSeries.find((c) => c.id === config.cylinderId);
  if (!cyl) return { status: 'incompatible', reasons: ['No cylinder selected.'] };

  const cylRes = checkCylinder(cyl, req);
  status = worst(status, cylRes.status);
  reasons.push(...cylRes.reasons.filter((r) => r !== 'Meets all application requirements.'));

  if (config.transmission) {
    const tRes = checkTransmission(config.transmission, config, req);
    status = worst(status, tRes.status);
  }

  if (config.motorId) {
    const motor = motors.find((m) => m.id === config.motorId);
    if (motor) {
      const mRes = checkMotor(motor, config, req);
      status = worst(status, mRes.status);
      reasons.push(...mRes.reasons.filter((r) => r !== 'Motor is compatible.'));
    }
  }
  if (config.driveId) {
    const drive = drives.find((d) => d.id === config.driveId);
    if (drive) {
      const dRes = checkDrive(drive, config);
      status = worst(status, dRes.status);
    }
  }

  if (reasons.length === 0) reasons.push('Configuration is valid.');
  return { status, reasons };
}

export { worst };
