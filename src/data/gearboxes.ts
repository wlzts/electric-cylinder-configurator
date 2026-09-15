import type { Gearbox } from '@/types';

// 演示数据。减速机：中大力德 ZD Leader 精密行星减速机。
// 数据为演示用途，最终以厂家实际规格为准。
export const gearboxes: Gearbox[] = [
  // 适配 40/60 法兰（100W-400W 电机）
  { id: 'GBX-060-R3', brand: '中大力德 ZD', model: 'ZPLF060-3', name: '精密行星减速机 060 法兰', ratio: 3, ratedTorque: 6, maxTorque: 18, backlash: 8, compatibleMotorFlanges: ['60mm', '80mm'], efficiency: 0.97 },
  { id: 'GBX-060-R5', brand: '中大力德 ZD', model: 'ZPLF060-5', name: '精密行星减速机 060 法兰', ratio: 5, ratedTorque: 10, maxTorque: 30, backlash: 8, compatibleMotorFlanges: ['60mm', '80mm'], efficiency: 0.97 },
  { id: 'GBX-060-R10', brand: '中大力德 ZD', model: 'ZPLF060-10', name: '精密行星减速机 060 法兰', ratio: 10, ratedTorque: 20, maxTorque: 60, backlash: 8, compatibleMotorFlanges: ['60mm', '80mm'], efficiency: 0.96 },
  // 适配 80/90 法兰（750W-1.5kW 电机）
  { id: 'GBX-090-R5', brand: '中大力德 ZD', model: 'ZPLF090-5', name: '精密行星减速机 090 法兰', ratio: 5, ratedTorque: 25, maxTorque: 75, backlash: 6, compatibleMotorFlanges: ['80mm', '90mm', '110mm'], efficiency: 0.97 },
  { id: 'GBX-090-R10', brand: '中大力德 ZD', model: 'ZPLF090-10', name: '精密行星减速机 090 法兰', ratio: 10, ratedTorque: 50, maxTorque: 150, backlash: 6, compatibleMotorFlanges: ['80mm', '90mm', '110mm'], efficiency: 0.96 },
  { id: 'GBX-090-R20', brand: '中大力德 ZD', model: 'ZPLF090-20', name: '精密行星减速机 090 法兰', ratio: 20, ratedTorque: 100, maxTorque: 300, backlash: 8, compatibleMotorFlanges: ['80mm', '90mm', '110mm'], efficiency: 0.94 },
  // 适配 110/130 法兰（2kW-3kW 电机）
  { id: 'GBX-120-R10', brand: '中大力德 ZD', model: 'ZPLF120-10', name: '精密行星减速机 120 法兰', ratio: 10, ratedTorque: 100, maxTorque: 300, backlash: 6, compatibleMotorFlanges: ['110mm', '130mm'], efficiency: 0.96 },
  { id: 'GBX-120-R20', brand: '中大力德 ZD', model: 'ZPLF120-20', name: '精密行星减速机 120 法兰', ratio: 20, ratedTorque: 200, maxTorque: 600, backlash: 8, compatibleMotorFlanges: ['110mm', '130mm'], efficiency: 0.94 },
  { id: 'GBX-120-R40', brand: '中大力德 ZD', model: 'ZPLF120-40', name: '精密行星减速机 120 法兰', ratio: 40, ratedTorque: 350, maxTorque: 1050, backlash: 10, compatibleMotorFlanges: ['110mm', '130mm'], efficiency: 0.92 },
];
