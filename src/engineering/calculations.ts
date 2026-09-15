import type {
  ApplicationRequirement,
  Configuration,
  PerformanceResult,
  BallScrew,
  TimingBelt,
  Motor,
  CylinderSeries,
} from '@/types';
import { ENGINEERING_CONFIG } from './config';
import { ballScrews, timingBelts, motors, gearboxes, cylinderSeries, drives } from '@/data';

// ============================================================================
// DEMO ENGINEERING CALCULATION LAYER
// Simplified models for UI demonstration. NOT certified engineering data.
// All formulas are clearly marked as demo in the UI.
// ============================================================================

const G = ENGINEERING_CONFIG.gravity;
const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v));
const safe = (v: number | null | undefined): number | null =>
  v === null || v === undefined || !Number.isFinite(v) ? null : v;

// ---------------------------------------------------------------------------
// Required thrust to move the payload under acceleration + friction + gravity
// ---------------------------------------------------------------------------
export function calculateRequiredThrust(req: ApplicationRequirement): number {
  const m = Math.max(0, req.payload);
  const a = Math.max(0, req.acceleration) / 1000; // mm/s² -> m/s²
  const mu =
    req.orientation === 'vertical'
      ? ENGINEERING_CONFIG.friction.vertical
      : ENGINEERING_CONFIG.friction.horizontal;

  const inertial = m * a; // N
  const gravityForce = req.orientation === 'vertical' ? m * G : 0; // N (lifting against gravity)
  const friction = req.orientation === 'horizontal' ? m * G * mu : m * G * mu * 0.1; // N
  return inertial + gravityForce + friction;
}

// ---------------------------------------------------------------------------
// Motor torque required at the motor shaft (Nm), after accounting for
// transmission mechanical advantage and efficiency.
// Ball/lead screw: T = F * lead / (2π * η)
// Timing belt:    T = F * pulleyRadius / η  (pulley radius derived from pitch & teeth)
// ---------------------------------------------------------------------------
export function calculateMotorTorque(
  req: ApplicationRequirement,
  config: Configuration,
): number | null {
  const thrust = calculateRequiredThrust(req);
  const eff =
    ENGINEERING_CONFIG.efficiency[config.transmission ?? 'ball_screw'] ??
    ENGINEERING_CONFIG.efficiency.ball_screw;

  let outputTorque: number | null;
  if (config.transmission === 'timing_belt') {
    const belt = timingBelts.find((b) => b.id === config.beltId);
    if (!belt) return null;
    const pulleyTeeth = 20;
    const radiusM = (pulleyTeeth * belt.pitchMm) / (2 * Math.PI) / 1000;
    outputTorque = safe((thrust * radiusM) / eff);
  } else {
    const screw = ballScrews.find((s) => s.id === config.screwId);
    if (!screw) return null;
    const leadM = screw.lead / 1000;
    outputTorque = safe((thrust * leadM) / (2 * Math.PI * eff));
  }

  if (outputTorque === null) return null;
  // Apply gearbox reduction: motor torque = output torque / (ratio * gbxEff)
  if (config.gearboxId) {
    const gb = gearboxes.find((g) => g.id === config.gearboxId);
    if (gb) return safe(outputTorque / (gb.ratio * gb.efficiency));
  }
  return outputTorque;
}

// ---------------------------------------------------------------------------
// Motor RPM needed to achieve target linear speed
// Screw: RPM = speed(mm/s) * 60 / lead(mm/rev)
// Belt:  RPM = speed / (pulleyCircumference) * 60
// ---------------------------------------------------------------------------
export function calculateMotorRPM(
  req: ApplicationRequirement,
  config: Configuration,
): number | null {
  const speed = Math.max(0, req.targetSpeed);
  let outputRPM: number | null;
  if (config.transmission === 'timing_belt') {
    const belt = timingBelts.find((b) => b.id === config.beltId);
    if (!belt) return null;
    const pulleyTeeth = 20;
    const circumferenceMm = pulleyTeeth * belt.pitchMm;
    outputRPM = safe((speed / circumferenceMm) * 60);
  } else {
    const screw = ballScrews.find((s) => s.id === config.screwId);
    if (!screw) return null;
    if (screw.lead <= 0) return null;
    outputRPM = safe((speed * 60) / screw.lead);
  }

  if (outputRPM === null) return null;
  // Apply gearbox: motor spins faster by ratio
  if (config.gearboxId) {
    const gb = gearboxes.find((g) => g.id === config.gearboxId);
    if (gb) return safe(outputRPM * gb.ratio);
  }
  return outputRPM;
}

// ---------------------------------------------------------------------------
// Ball screw critical speed (rpm) — simplified DN / fixed-free model.
// N_cr = K * d * 1e6 / L²  (demo approximation; K tuned for plausible values)
// d = root diameter (mm), L = unsupported length (mm) ≈ stroke + 200mm
// ---------------------------------------------------------------------------
export function calculateScrewCriticalSpeed(
  config: Configuration,
  stroke: number,
): number | null {
  const screw = ballScrews.find((s) => s.id === config.screwId);
  if (!screw) return null;
  const unsupportedLength = Math.max(100, stroke + 200); // mm, demo
  const K = 1.5e7; // demo constant
  return safe((K * screw.diameter) / (unsupportedLength * unsupportedLength));
}

// ---------------------------------------------------------------------------
// Timing belt max linear speed from belt rating
// ---------------------------------------------------------------------------
export function calculateBeltSpeed(config: Configuration): number | null {
  const belt = timingBelts.find((b) => b.id === config.beltId);
  return belt ? safe(belt.maxSpeed) : null;
}

// ---------------------------------------------------------------------------
// Safety factor = available thrust / required thrust
// ---------------------------------------------------------------------------
export function calculateSafetyFactor(
  req: ApplicationRequirement,
  config: Configuration,
): number | null {
  const required = calculateRequiredThrust(req);
  if (required <= 0) return null;
  const cylinder = cylinderSeries.find((c) => c.id === config.cylinderId);
  const available = cylinder?.maxThrust ?? 0;
  return safe(available / required);
}

// ---------------------------------------------------------------------------
// Estimated life (hours) — simplified L10 bearing life model.
// L10(h) = (C/P)^3 * 1e6 / (60 * RPM)  (demo)
// C = dynamic load, P = equivalent axial load ≈ required thrust
// ---------------------------------------------------------------------------
export function calculateEstimatedLife(
  req: ApplicationRequirement,
  config: Configuration,
): number | null {
  if (config.transmission === 'timing_belt') {
    // Belt life demo: 20,000h baseline derated by load ratio
    const belt = timingBelts.find((b) => b.id === config.beltId);
    if (!belt) return null;
    const loadRatio = calculateRequiredThrust(req) / Math.max(1, belt.ratedLoad);
    return safe(20000 / Math.pow(Math.max(0.1, loadRatio), 1.5));
  }
  const screw = ballScrews.find((s) => s.id === config.screwId);
  if (!screw) return null;
  const P = Math.max(1, calculateRequiredThrust(req));
  const rpm = calculateMotorRPM(req, config) ?? 0;
  if (rpm <= 0) return null;
  const lifeRev = Math.pow(screw.dynamicLoad / P, 3) * 1e6;
  return safe(lifeRev / (60 * rpm));
}

// ---------------------------------------------------------------------------
// Master performance calculation
// ---------------------------------------------------------------------------
export function calculatePerformance(
  req: ApplicationRequirement,
  config: Configuration,
): PerformanceResult {
  const notes: string[] = [];
  const cylinder: CylinderSeries | undefined = cylinderSeries.find(
    (c) => c.id === config.cylinderId,
  );
  const motor: Motor | undefined = motors.find((m) => m.id === config.motorId);
  const screw: BallScrew | undefined = ballScrews.find((s) => s.id === config.screwId);
  const belt: TimingBelt | undefined = timingBelts.find((b) => b.id === config.beltId);

  const motorTorque = calculateMotorTorque(req, config);
  const motorRPM = calculateMotorRPM(req, config);
  const safetyFactor = calculateSafetyFactor(req, config);
  const estimatedLife = calculateEstimatedLife(req, config);
  const criticalSpeed =
    config.transmission === 'timing_belt' ? null : calculateScrewCriticalSpeed(config, config.stroke);

  // Rated thrust = cylinder max thrust (demo; actual depends on screw/motor)
  const ratedThrust = cylinder ? safe(cylinder.maxThrust) : null;
  const peakThrust = cylinder && motor ? safe(cylinder.maxThrust * 1.4) : null;

  // Max speed: min of cylinder, screw/belt, motor capability
  let maxSpeed: number | null = null;
  if (cylinder && motor) {
    const cylinderSpeed = cylinder.maxSpeed;
    const motorSpeed =
      config.transmission === 'timing_belt'
        ? belt
          ? (motor.ratedRPM * 20 * belt.pitchMm) / 60
          : null
        : screw
          ? (motor.ratedRPM * screw.lead) / 60
          : null;
    maxSpeed = safe(Math.min(cylinderSpeed, motorSpeed ?? cylinderSpeed));
  }

  const acceleration = motor && motorTorque ? safe(req.acceleration * 1.2) : null;
  const payload = cylinder ? safe(cylinder.maxPayload) : null;
  const repeatability = screw
    ? safe(screw.accuracy === 'C3' ? 0.005 : screw.accuracy === 'C5' ? 0.01 : 0.02)
    : belt
      ? safe(0.05)
      : cylinder
        ? safe(cylinder.repeatability)
        : null;

  if (criticalSpeed && motorRPM && motorRPM > criticalSpeed * ENGINEERING_CONFIG.criticalSpeedMargin) {
    notes.push('Required motor RPM approaches screw critical speed limit.');
  }
  if (config.transmission === 'lead_screw') {
    notes.push('Lead screw efficiency is lower; verify thermal performance at high duty cycle.');
  }

  return {
    ratedThrust,
    peakThrust,
    maxSpeed,
    acceleration,
    payload,
    repeatability,
    motorRPM,
    motorTorque,
    safetyFactor,
    estimatedLife,
    criticalSpeed,
    notes,
  };
}

// ---------------------------------------------------------------------------
// Validate engineering limits; returns list of issues
// ---------------------------------------------------------------------------
export interface EngineeringLimitIssue {
  level: 'warning' | 'fail';
  message: string;
}

export function validateEngineeringLimits(
  req: ApplicationRequirement,
  config: Configuration,
): EngineeringLimitIssue[] {
  const issues: EngineeringLimitIssue[] = [];
  const perf = calculatePerformance(req, config);
  const cylinder = cylinderSeries.find((c) => c.id === config.cylinderId);
  const motor = motors.find((m) => m.id === config.motorId);
  const screw = ballScrews.find((s) => s.id === config.screwId);

  if (!cylinder || !motor) return issues;

  // Payload
  if (req.payload > cylinder.maxPayload) {
    issues.push({ level: 'fail', message: `Payload ${req.payload} kg exceeds ${cylinder.model} max ${cylinder.maxPayload} kg.` });
  }
  // Stroke
  if (config.stroke > cylinder.maxStroke) {
    issues.push({ level: 'fail', message: `Stroke ${config.stroke} mm exceeds ${cylinder.model} max ${cylinder.maxStroke} mm.` });
  }
  if (screw && config.stroke > screw.maxStroke) {
    issues.push({ level: 'fail', message: `Stroke ${config.stroke} mm exceeds screw ${screw.model} max ${screw.maxStroke} mm.` });
  }
  // Speed
  if (perf.maxSpeed && req.targetSpeed > perf.maxSpeed) {
    issues.push({ level: 'fail', message: `Target speed ${req.targetSpeed} mm/s exceeds achievable ${Math.round(perf.maxSpeed)} mm/s.` });
  }
  // Torque
  if (perf.motorTorque && motor.ratedTorque < perf.motorTorque) {
    issues.push({ level: 'fail', message: `Required torque ${perf.motorTorque.toFixed(2)} Nm exceeds motor rated ${motor.ratedTorque} Nm.` });
  } else if (perf.motorTorque && motor.peakTorque < perf.motorTorque) {
    issues.push({ level: 'warning', message: `Required torque exceeds motor rated but within peak; verify duty cycle.` });
  }
  // RPM
  if (perf.motorRPM && motor.maxRPM < perf.motorRPM) {
    issues.push({ level: 'fail', message: `Required RPM ${Math.round(perf.motorRPM)} exceeds motor max ${motor.maxRPM}.` });
  }
  // Critical speed
  if (perf.criticalSpeed && perf.motorRPM && perf.motorRPM > perf.criticalSpeed * ENGINEERING_CONFIG.criticalSpeedMargin) {
    issues.push({ level: 'warning', message: `Operating RPM approaches screw critical speed (${Math.round(perf.criticalSpeed)} RPM).` });
  }
  // Safety factor
  if (perf.safetyFactor !== null && perf.safetyFactor < ENGINEERING_CONFIG.safetyFactor.acceptable) {
    issues.push({ level: 'fail', message: `Safety factor ${perf.safetyFactor.toFixed(2)} below acceptable ${ENGINEERING_CONFIG.safetyFactor.acceptable}.` });
  } else if (perf.safetyFactor !== null && perf.safetyFactor < ENGINEERING_CONFIG.safetyFactor.recommended) {
    issues.push({ level: 'warning', message: `Safety factor ${perf.safetyFactor.toFixed(2)} below recommended ${ENGINEERING_CONFIG.safetyFactor.recommended}.` });
  }
  // Vertical brake
  if (req.orientation === 'vertical' && !config.brake && !req.brakeRequired) {
    issues.push({ level: 'warning', message: 'Brake is recommended for vertical applications to prevent load drop on power loss.' });
  }
  // Thrust
  if (cylinder.maxThrust < calculateRequiredThrust(req)) {
    issues.push({ level: 'fail', message: `Required thrust ${Math.round(calculateRequiredThrust(req))} N exceeds cylinder max ${cylinder.maxThrust} N.` });
  }

  return issues;
}

// ---------------------------------------------------------------------------
// Recommend a configuration from application requirements (3 tiers)
// ---------------------------------------------------------------------------
export function recommendConfiguration(req: ApplicationRequirement): Configuration[] {
  const requiredThrust = calculateRequiredThrust(req);

  // Pick cylinder by thrust + payload
  const sortedCylinders = [...cylinderSeries].sort((a, b) => a.maxThrust - b.maxThrust);
  const pickCylinder = (minThrust: number, minPayload: number) =>
    sortedCylinders.find((c) => c.maxThrust >= minThrust && c.maxPayload >= minPayload) ??
    sortedCylinders[sortedCylinders.length - 1];

  const econCyl = pickCylinder(requiredThrust * 1.2, req.payload);
  const recCyl = pickCylinder(requiredThrust * 1.8, req.payload);
  const perfCyl = pickCylinder(requiredThrust * 2.5, req.payload);

  const pickScrew = (cylId: string) =>
    ballScrews.find((s) => s.compatibleSeries.includes(cylId) && s.lead >= 10) ??
    ballScrews.find((s) => s.compatibleSeries.includes(cylId)) ??
    ballScrews[0];

  const pickMotor = (cylId: string, power: number) => {
    const candidates = motors
      .filter((m) => m.compatibleCylinderSeries.includes(cylId))
      .sort((a, b) => a.power - b.power);
    return candidates.find((m) => m.power >= power) ?? candidates[candidates.length - 1] ?? motors[0];
  };

  const pickDrive = (motorId: string) => {
    const m = motors.find((x) => x.id === motorId);
    return m?.compatibleDrives[0] ?? 'DRV-400';
  };

  const build = (cylId: string, motorPower: number): Configuration => {
    const motor = pickMotor(cylId, motorPower);
    const drive = pickDrive(motor.id);
    const driveObj = drives.find((d) => d.id === drive);
    const comm = driveObj?.communication.includes(req.communication)
      ? req.communication
      : driveObj?.communication[0] ??
        'ETHERCAT';
    return {
      cylinderId: cylId,
      transmission: 'ball_screw',
      screwId: pickScrew(cylId).id,
      beltId: null,
      motorId: motor.id,
      gearboxId: null,
      driveId: drive,
      encoderId: motor.encoderOptions.includes('ENC-23BIT') ? 'ENC-23BIT' : motor.encoderOptions[0],
      brake: req.orientation === 'vertical' || req.brakeRequired,
      sensors: ['SENS-HOME-NPN-NO', 'SENS-LIMIT-P-NPN-NC', 'SENS-LIMIT-N-NPN-NC'],
      accessories: ['ACC-FRONT-FLANGE', 'ACC-FLOATING-JOINT'],
      communicationId: comm,
      stroke: req.stroke,
    };
  };

  return [
    build(recCyl.id, 400), // recommended
    build(perfCyl.id, 750), // performance
    build(econCyl.id, 200), // economy
  ];
}

// Re-export clamp for reuse
export { clamp };
