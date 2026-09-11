import type { Encoder, SensorConfig, Accessory, CommunicationProtocol } from '@/types';

// 5 encoder options
export const encoders: Encoder[] = [
  { id: 'ENC-INC', name: 'Incremental', type: 'incremental', resolution: '2500 PPR', pulsesPerRev: 2500, powerOffRetention: false, recommendedFor: 'Cost-sensitive, homing available, standard positioning' },
  { id: 'ENC-17BIT', name: '17-bit Absolute', type: 'absolute', resolution: '17-bit (131,072/rev)', powerOffRetention: true, recommendedFor: 'General absolute positioning, power-off position retention' },
  { id: 'ENC-20BIT', name: '20-bit Absolute', type: 'absolute', resolution: '20-bit (1,048,576/rev)', powerOffRetention: true, recommendedFor: 'High precision, multi-turn, demanding positioning' },
  { id: 'ENC-23BIT', name: '23-bit Absolute', type: 'absolute', resolution: '23-bit (8,388,608/rev)', powerOffRetention: true, recommendedFor: 'Ultra-high precision, semiconductor, metrology' },
  { id: 'ENC-BATTLESS', name: 'Battery-less Absolute', type: 'absolute', resolution: '18-bit', powerOffRetention: true, recommendedFor: 'Maintenance-free absolute position, no battery backup' },
];

// 6 sensor configurations
export const sensors: SensorConfig[] = [
  { id: 'SENS-HOME-NPN-NO', name: 'Home Sensor NPN NO', type: 'home', output: 'NPN', logic: 'NO', description: 'NPN output, normally open home position sensor' },
  { id: 'SENS-HOME-PNP-NO', name: 'Home Sensor PNP NO', type: 'home', output: 'PNP', logic: 'NO', description: 'PNP output, normally open home position sensor' },
  { id: 'SENS-LIMIT-P-NPN-NC', name: 'Positive Limit NPN NC', type: 'positive_limit', output: 'NPN', logic: 'NC', description: 'NPN output, normally closed positive limit switch (safety recommended)' },
  { id: 'SENS-LIMIT-P-PNP-NC', name: 'Positive Limit PNP NC', type: 'positive_limit', output: 'PNP', logic: 'NC', description: 'PNP output, normally closed positive limit switch' },
  { id: 'SENS-LIMIT-N-NPN-NC', name: 'Negative Limit NPN NC', type: 'negative_limit', output: 'NPN', logic: 'NC', description: 'NPN output, normally closed negative limit switch' },
  { id: 'SENS-LIMIT-N-PNP-NC', name: 'Negative Limit PNP NC', type: 'negative_limit', output: 'PNP', logic: 'NC', description: 'PNP output, normally closed negative limit switch' },
];

// 10 accessories
export const accessories: Accessory[] = [
  { id: 'ACC-FRONT-FLANGE', name: 'Front Flange', category: 'mounting', description: 'Front face mounting flange for rigid attachment', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Square' },
  { id: 'ACC-REAR-FLANGE', name: 'Rear Flange', category: 'mounting', description: 'Rear mounting flange for fixed rear support', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Square' },
  { id: 'ACC-TRUNNION', name: 'Trunnion Mount', category: 'mounting', description: 'Pivot trunnion mounting for angular installation', compatibleSeries: ['EC60', 'EC80', 'EC100'], icon: 'RotateCw' },
  { id: 'ACC-CLEVIS', name: 'Clevis Bracket', category: 'mounting', description: 'Rear clevis bracket for pinned mounting', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100'], icon: 'Link' },
  { id: 'ACC-FOOT', name: 'Foot Mount', category: 'mounting', description: 'Side foot mounting brackets for horizontal base mount', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Minus' },
  { id: 'ACC-FLOATING-JOINT', name: 'Floating Joint', category: 'coupling', description: 'Rod-end floating joint to absorb misalignment', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'GitMerge' },
  { id: 'ACC-ROD-END', name: 'Rod End Bearing', category: 'coupling', description: 'Spherical rod end bearing for articulated load connection', compatibleSeries: ['EC60', 'EC80', 'EC100', 'EC120'], icon: 'Circle' },
  { id: 'ACC-BELLOWS', name: 'Bellows Cover', category: 'protection', description: 'Expandable bellows to protect screw/rod from debris', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100'], icon: 'Shield' },
  { id: 'ACC-COVER', name: 'Protective Cover', category: 'protection', description: 'Rigid protective cover for dusty environments', compatibleSeries: ['EC60', 'EC80', 'EC100', 'EC120'], icon: 'ShieldCheck' },
  { id: 'ACC-CABLE-CHAIN', name: 'Cable Chain', category: 'cable', description: 'Energy chain for cable management on moving carriage', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Cable' },
];

// 8 communication protocols
export const protocols: CommunicationProtocol[] = [
  { id: 'PULSE', name: 'Pulse / Direction', code: 'PULSE', description: 'Traditional step & direction pulse train control', deterministic: true },
  { id: 'ANALOG', name: 'Analog', code: 'ANALOG', description: '±10V analog velocity or torque reference', deterministic: false },
  { id: 'MODBUS-RTU', name: 'Modbus RTU', code: 'MB-RTU', description: 'Serial RS-485 Modbus RTU fieldbus', deterministic: false },
  { id: 'MODBUS-TCP', name: 'Modbus TCP', code: 'MB-TCP', description: 'Ethernet Modbus TCP', deterministic: false },
  { id: 'CANOPEN', name: 'CANopen', code: 'CAN', description: 'CANopen fieldbus for motion control', deterministic: true },
  { id: 'ETHERCAT', name: 'EtherCAT', code: 'ECAT', description: 'Real-time EtherCAT, deterministic high-performance motion', deterministic: true },
  { id: 'ETHERNETIP', name: 'EtherNet/IP', code: 'ENIP', description: 'EtherNet/IP CIP motion, Rockwell ecosystem', deterministic: true },
  { id: 'PROFINET', name: 'PROFINET', code: 'PNET', description: 'PROFINET RT/IRT, Siemens ecosystem', deterministic: true },
];
