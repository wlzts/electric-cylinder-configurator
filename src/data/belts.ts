import type { TimingBelt } from '@/types';

// DEMO engineering data. 8 timing belt combinations.
export const timingBelts: TimingBelt[] = [
  { id: 'TB-HTD5M-15', series: 'HTD', pitch: '5M', pitchMm: 5, width: 15, material: 'Rubber', cord: 'Fiberglass', maxSpeed: 3000, ratedLoad: 180, compatibleSeries: ['EC40', 'EC60'] },
  { id: 'TB-HTD5M-20', series: 'HTD', pitch: '5M', pitchMm: 5, width: 20, material: 'Rubber', cord: 'Fiberglass', maxSpeed: 3000, ratedLoad: 240, compatibleSeries: ['EC40', 'EC60', 'EC80'] },
  { id: 'TB-HTD8M-20', series: 'HTD', pitch: '8M', pitchMm: 8, width: 20, material: 'Rubber', cord: 'Steel', maxSpeed: 4000, ratedLoad: 420, compatibleSeries: ['EC60', 'EC80'] },
  { id: 'TB-HTD8M-30', series: 'HTD', pitch: '8M', pitchMm: 8, width: 30, material: 'Rubber', cord: 'Steel', maxSpeed: 4000, ratedLoad: 650, compatibleSeries: ['EC60', 'EC80', 'EC100'] },
  { id: 'TB-GT3-15', series: 'GT', pitch: '3GT', pitchMm: 3, width: 15, material: 'Rubber', cord: 'Steel', maxSpeed: 2500, ratedLoad: 140, compatibleSeries: ['EC40', 'EC60'] },
  { id: 'TB-AT5-20', series: 'AT', pitch: 'AT5', pitchMm: 5, width: 20, material: 'PU', cord: 'Steel', maxSpeed: 3500, ratedLoad: 280, compatibleSeries: ['EC40', 'EC60', 'EC80'] },
  { id: 'TB-AT10-25', series: 'AT', pitch: 'AT10', pitchMm: 10, width: 25, material: 'PU', cord: 'Aramid', maxSpeed: 5000, ratedLoad: 520, compatibleSeries: ['EC80', 'EC100'] },
  { id: 'TB-AT10-40', series: 'AT', pitch: 'AT10', pitchMm: 10, width: 40, material: 'PU', cord: 'Aramid', maxSpeed: 5000, ratedLoad: 850, compatibleSeries: ['EC80', 'EC100', 'EC120'] },
];
