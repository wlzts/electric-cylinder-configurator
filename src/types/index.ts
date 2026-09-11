// Core domain types for the Electric Cylinder Configurator.
// All entities are related by ID. Mock data is clearly marked as demo.

export type ID = string;

export type TransmissionKind = 'ball_screw' | 'lead_screw' | 'timing_belt';

export type MotorType = 'servo' | 'stepper' | 'closed_loop_stepper';

export type MountingOrientation = 'horizontal' | 'vertical';

export type Environment = 'normal' | 'dusty' | 'cleanroom';

export type ControlMode = 'position' | 'velocity' | 'torque';

export type CompatibilityStatus = 'recommended' | 'compatible' | 'warning' | 'incompatible';

export type SensorType = 'home' | 'positive_limit' | 'negative_limit';
export type SensorLogic = 'NO' | 'NC';
export type SensorOutput = 'NPN' | 'PNP';

export interface CylinderSeries {
  id: ID;
  model: string;
  name: string;
  positioning: string;
  maxPayload: number; // kg
  maxThrust: number; // N
  maxSpeed: number; // mm/s
  maxStroke: number; // mm
  repeatability: number; // mm, ±
  compatibleTransmissions: TransmissionKind[];
  compatibleMotorPowers: number[]; // W
  protection: string;
  weight: number; // kg (body only, demo)
  recommendedApplication: string;
}

export interface TransmissionType {
  id: ID;
  kind: TransmissionKind;
  name: string;
  tagline: string;
  advantages: string[];
  limitations: string[];
  recommendedFor: string;
}

export interface BallScrew {
  id: ID;
  model: string;
  diameter: number; // mm
  lead: number; // mm/rev
  accuracy: 'C3' | 'C5' | 'C7';
  preload: 'standard' | 'light' | 'heavy';
  maxRPM: number;
  dynamicLoad: number; // N, Ca
  staticLoad: number; // N, Coa
  maxStroke: number; // mm
  compatibleSeries: ID[];
}

export interface LeadScrew {
  id: ID;
  model: string;
  diameter: number;
  lead: number;
  accuracy: 'C7' | 'C10';
  efficiency: number; // 0..1
  maxRPM: number;
  maxAxialLoad: number;
  maxStroke: number;
  compatibleSeries: ID[];
}

export interface TimingBelt {
  id: ID;
  series: 'HTD' | 'GT' | 'AT';
  pitch: string; // e.g. "5M", "8M", "AT5", "AT10"
  pitchMm: number;
  width: number; // mm
  material: 'PU' | 'Rubber';
  cord: 'Steel' | 'Aramid' | 'Fiberglass';
  maxSpeed: number; // mm/s
  ratedLoad: number; // N
  compatibleSeries: ID[];
}

export interface Motor {
  id: ID;
  brand: string;
  model: string;
  name: string;
  type: MotorType;
  power: number; // W
  ratedTorque: number; // Nm
  peakTorque: number; // Nm
  ratedRPM: number;
  maxRPM: number;
  encoderOptions: ID[];
  brakeAvailable: boolean;
  compatibleDrives: ID[];
  compatibleCylinderSeries: ID[];
  inertia: number; // kg·cm² (demo)
}

export interface Drive {
  id: ID;
  brand: string;
  model: string;
  name: string;
  power: number; // W continuous
  voltage: string; // e.g. "220V AC"
  motorCompatibility: ID[]; // motor ids
  controlModes: ControlMode[];
  communication: ID[]; // protocol ids
  supportedMotorTypes: MotorType[];
}

export interface Encoder {
  id: ID;
  name: string;
  type: 'incremental' | 'absolute';
  resolution: string; // e.g. "23-bit"
  pulsesPerRev?: number;
  powerOffRetention: boolean;
  recommendedFor: string;
}

export interface SensorConfig {
  id: ID;
  name: string;
  type: SensorType;
  output: SensorOutput;
  logic: SensorLogic;
  description: string;
}

export interface Accessory {
  id: ID;
  name: string;
  category: 'mounting' | 'coupling' | 'protection' | 'cable';
  description: string;
  compatibleSeries: ID[];
  icon: string; // lucide icon name key
}

export interface CommunicationProtocol {
  id: ID;
  name: string;
  code: string; // short code for model number
  description: string;
  deterministic: boolean;
}

export interface ApplicationRequirement {
  orientation: MountingOrientation;
  payload: number; // kg
  stroke: number; // mm
  targetSpeed: number; // mm/s
  acceleration: number; // mm/s²
  targetThrust: number; // N
  repeatability: number; // mm ±
  dailyHours: number;
  cyclesPerMin: number;
  environment: Environment;
  controlMode: ControlMode;
  communication: ID;
  brakeRequired: boolean;
}

export interface CompatibilityRule {
  id: ID;
  description: string;
  severity: CompatibilityStatus;
  // rule evaluated by engine; kept declarative-ish
}

export interface PerformanceResult {
  ratedThrust: number | null; // N
  peakThrust: number | null; // N
  maxSpeed: number | null; // mm/s
  acceleration: number | null; // mm/s² (capability)
  payload: number | null; // kg
  repeatability: number | null; // mm
  motorRPM: number | null;
  motorTorque: number | null; // Nm required
  safetyFactor: number | null;
  estimatedLife: number | null; // hours
  criticalSpeed: number | null; // rpm, screw only
  notes: string[];
}

export interface Configuration {
  cylinderId: ID | null;
  transmission: TransmissionKind | null;
  screwId: ID | null;
  beltId: ID | null;
  motorId: ID | null;
  driveId: ID | null;
  encoderId: ID | null;
  brake: boolean;
  sensors: ID[];
  accessories: ID[];
  communicationId: ID | null;
  stroke: number; // mm
}

export interface BOMItem {
  partNumber: string;
  description: string;
  brand: string;
  qty: number;
  status: 'included' | 'optional';
}

export interface Recommendation {
  tier: 'recommended' | 'performance' | 'economy';
  label: string;
  configuration: Configuration;
  performance: PerformanceResult;
  reasons: string[];
}

export interface QuoteRequest {
  customer: {
    company: string;
    name: string;
    email: string;
    phone: string;
    country: string;
  };
  application: string;
  projectQuantity: number;
  expectedDeliveryDate: string;
  message: string;
  applicationRequirements: ApplicationRequirement;
  configuration: Configuration;
  performance: PerformanceResult;
  bom: BOMItem[];
  configurationCode: string;
  createdAt: string;
}

export interface EngineeringCheckItem {
  id: string;
  label: string;
  status: 'PASS' | 'WARNING' | 'FAIL';
  explanation: string;
}

export interface EngineeringCheckResult {
  items: EngineeringCheckItem[];
  passed: number;
  warnings: number;
  failures: number;
  overall: 'valid' | 'attention' | 'invalid';
}
