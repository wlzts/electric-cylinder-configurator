import type { Encoder, SensorConfig, Accessory, CommunicationProtocol } from '@/types';

// 5 encoder options
export const encoders: Encoder[] = [
  { id: 'ENC-INC', name: '增量式编码器', type: 'incremental', resolution: '2500 PPR', pulsesPerRev: 2500, powerOffRetention: false, recommendedFor: '成本敏感、需回零、标准定位' },
  { id: 'ENC-17BIT', name: '17位绝对值编码器', type: 'absolute', resolution: '17位（131,072/转）', powerOffRetention: true, recommendedFor: '通用绝对值定位、断电位置保持' },
  { id: 'ENC-20BIT', name: '20位绝对值编码器', type: 'absolute', resolution: '20位（1,048,576/转）', powerOffRetention: true, recommendedFor: '高精度、多圈、要求苛刻的定位' },
  { id: 'ENC-23BIT', name: '23位绝对值编码器', type: 'absolute', resolution: '23位（8,388,608/转）', powerOffRetention: true, recommendedFor: '超高精度、半导体、计量' },
  { id: 'ENC-BATTLESS', name: '无电池绝对值编码器', type: 'absolute', resolution: '18位', powerOffRetention: true, recommendedFor: '免维护绝对值位置、无需电池备份' },
];

// 6 sensor configurations
export const sensors: SensorConfig[] = [
  { id: 'SENS-HOME-NPN-NO', name: '原点传感器 NPN 常开', type: 'home', output: 'NPN', logic: 'NO', description: 'NPN 输出，常开原点位置传感器' },
  { id: 'SENS-HOME-PNP-NO', name: '原点传感器 PNP 常开', type: 'home', output: 'PNP', logic: 'NO', description: 'PNP 输出，常开原点位置传感器' },
  { id: 'SENS-LIMIT-P-NPN-NC', name: '正限位 NPN 常闭', type: 'positive_limit', output: 'NPN', logic: 'NC', description: 'NPN 输出，常闭正限位开关（安全推荐）' },
  { id: 'SENS-LIMIT-P-PNP-NC', name: '正限位 PNP 常闭', type: 'positive_limit', output: 'PNP', logic: 'NC', description: 'PNP 输出，常闭正限位开关' },
  { id: 'SENS-LIMIT-N-NPN-NC', name: '负限位 NPN 常闭', type: 'negative_limit', output: 'NPN', logic: 'NC', description: 'NPN 输出，常闭负限位开关' },
  { id: 'SENS-LIMIT-N-PNP-NC', name: '负限位 PNP 常闭', type: 'negative_limit', output: 'PNP', logic: 'NC', description: 'PNP 输出，常闭负限位开关' },
];

// 10 accessories
export const accessories: Accessory[] = [
  { id: 'ACC-FRONT-FLANGE', name: '前法兰', category: 'mounting', description: '前端面安装法兰，刚性连接', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Square' },
  { id: 'ACC-REAR-FLANGE', name: '后法兰', category: 'mounting', description: '后端安装法兰，后部固定支撑', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Square' },
  { id: 'ACC-TRUNNION', name: '双耳轴铰支', category: 'mounting', description: '摆动铰支安装，角度安装', compatibleSeries: ['EC60', 'EC80', 'EC100'], icon: 'RotateCw' },
  { id: 'ACC-CLEVIS', name: '单耳铰座', category: 'mounting', description: '后部单耳铰座，销接安装', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100'], icon: 'Link' },
  { id: 'ACC-FOOT', name: '底座脚座', category: 'mounting', description: '侧面脚座安装，水平底座固定', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Minus' },
  { id: 'ACC-FLOATING-JOINT', name: '浮动接头', category: 'coupling', description: '杆端浮动接头，吸收偏差', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'GitMerge' },
  { id: 'ACC-ROD-END', name: '鱼眼杆端关节轴承', category: 'coupling', description: '球面杆端关节轴承，铰接负载连接', compatibleSeries: ['EC60', 'EC80', 'EC100', 'EC120'], icon: 'Circle' },
  { id: 'ACC-BELLOWS', name: '伸缩防护罩', category: 'protection', description: '伸缩风琴罩，保护丝杠/活塞杆免受碎屑', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100'], icon: 'Shield' },
  { id: 'ACC-COVER', name: '刚性防护罩', category: 'protection', description: '刚性防护罩，适用于多尘环境', compatibleSeries: ['EC60', 'EC80', 'EC100', 'EC120'], icon: 'ShieldCheck' },
  { id: 'ACC-CABLE-CHAIN', name: '拖链', category: 'cable', description: '能量拖链，随动线缆管理', compatibleSeries: ['EC40', 'EC60', 'EC80', 'EC100', 'EC120'], icon: 'Cable' },
];

// 8 communication protocols
export const protocols: CommunicationProtocol[] = [
  { id: 'PULSE', name: '脉冲 / 方向', code: 'PULSE', description: '传统脉冲方向控制', deterministic: true },
  { id: 'ANALOG', name: '模拟量', code: 'ANALOG', description: '±10V 模拟速度或转矩指令', deterministic: false },
  { id: 'MODBUS-RTU', name: 'Modbus RTU', code: 'MB-RTU', description: 'RS-485 串行 Modbus RTU 总线', deterministic: false },
  { id: 'MODBUS-TCP', name: 'Modbus TCP', code: 'MB-TCP', description: '以太网 Modbus TCP', deterministic: false },
  { id: 'CANOPEN', name: 'CANopen', code: 'CAN', description: 'CANopen 运动控制总线', deterministic: true },
  { id: 'ETHERCAT', name: 'EtherCAT', code: 'ECAT', description: '实时 EtherCAT，确定性高性能运动', deterministic: true },
  { id: 'ETHERNETIP', name: 'EtherNet/IP', code: 'ENIP', description: 'EtherNet/IP CIP 运动，罗克韦尔生态', deterministic: true },
  { id: 'PROFINET', name: 'PROFINET', code: 'PNET', description: 'PROFINET RT/IRT，西门子生态', deterministic: true },
];
