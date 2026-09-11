import type { BallScrew, LeadScrew } from '@/types';

// DEMO engineering data. 12 ball screw combinations.
export const ballScrews: BallScrew[] = [
  { id: 'BS16-05', model: 'BS16-05', diameter: 16, lead: 5, accuracy: 'C5', preload: 'standard', maxRPM: 5000, dynamicLoad: 8200, staticLoad: 13100, maxStroke: 600, compatibleSeries: ['EC40', 'EC60'] },
  { id: 'BS16-10', model: 'BS16-10', diameter: 16, lead: 10, accuracy: 'C5', preload: 'standard', maxRPM: 4500, dynamicLoad: 8200, staticLoad: 13100, maxStroke: 500, compatibleSeries: ['EC40', 'EC60'] },
  { id: 'BS20-05', model: 'BS20-05', diameter: 20, lead: 5, accuracy: 'C5', preload: 'standard', maxRPM: 4500, dynamicLoad: 12400, staticLoad: 19300, maxStroke: 800, compatibleSeries: ['EC40', 'EC60', 'EC80'] },
  { id: 'BS20-10', model: 'BS20-10', diameter: 20, lead: 10, accuracy: 'C5', preload: 'standard', maxRPM: 4000, dynamicLoad: 12400, staticLoad: 19300, maxStroke: 700, compatibleSeries: ['EC40', 'EC60', 'EC80'] },
  { id: 'BS20-20', model: 'BS20-20', diameter: 20, lead: 20, accuracy: 'C7', preload: 'light', maxRPM: 3500, dynamicLoad: 12400, staticLoad: 19300, maxStroke: 600, compatibleSeries: ['EC60', 'EC80'] },
  { id: 'BS25-05', model: 'BS25-05', diameter: 25, lead: 5, accuracy: 'C3', preload: 'heavy', maxRPM: 4000, dynamicLoad: 17800, staticLoad: 28500, maxStroke: 1200, compatibleSeries: ['EC60', 'EC80', 'EC100'] },
  { id: 'BS25-10', model: 'BS25-10', diameter: 25, lead: 10, accuracy: 'C5', preload: 'standard', maxRPM: 3600, dynamicLoad: 17800, staticLoad: 28500, maxStroke: 1000, compatibleSeries: ['EC60', 'EC80', 'EC100'] },
  { id: 'BS25-20', model: 'BS25-20', diameter: 25, lead: 20, accuracy: 'C5', preload: 'standard', maxRPM: 3200, dynamicLoad: 17800, staticLoad: 28500, maxStroke: 900, compatibleSeries: ['EC80', 'EC100'] },
  { id: 'BS32-10', model: 'BS32-10', diameter: 32, lead: 10, accuracy: 'C5', preload: 'standard', maxRPM: 3000, dynamicLoad: 29500, staticLoad: 47000, maxStroke: 1500, compatibleSeries: ['EC80', 'EC100', 'EC120'] },
  { id: 'BS32-20', model: 'BS32-20', diameter: 32, lead: 20, accuracy: 'C5', preload: 'standard', maxRPM: 2800, dynamicLoad: 29500, staticLoad: 47000, maxStroke: 1400, compatibleSeries: ['EC80', 'EC100', 'EC120'] },
  { id: 'BS40-10', model: 'BS40-10', diameter: 40, lead: 10, accuracy: 'C3', preload: 'heavy', maxRPM: 2500, dynamicLoad: 44000, staticLoad: 71500, maxStroke: 2000, compatibleSeries: ['EC100', 'EC120'] },
  { id: 'BS40-20', model: 'BS40-20', diameter: 40, lead: 20, accuracy: 'C5', preload: 'standard', maxRPM: 2200, dynamicLoad: 44000, staticLoad: 71500, maxStroke: 1800, compatibleSeries: ['EC100', 'EC120'] },
];

export const leadScrews: LeadScrew[] = [
  { id: 'LS16-04', model: 'LS16-04', diameter: 16, lead: 4, accuracy: 'C7', efficiency: 0.35, maxRPM: 3000, maxAxialLoad: 2000, maxStroke: 500, compatibleSeries: ['EC40', 'EC60'] },
  { id: 'LS16-08', model: 'LS16-08', diameter: 16, lead: 8, accuracy: 'C7', efficiency: 0.45, maxRPM: 2800, maxAxialLoad: 1800, maxStroke: 450, compatibleSeries: ['EC40', 'EC60'] },
  { id: 'LS20-05', model: 'LS20-05', diameter: 20, lead: 5, accuracy: 'C7', efficiency: 0.38, maxRPM: 2500, maxAxialLoad: 3500, maxStroke: 700, compatibleSeries: ['EC40', 'EC60', 'EC80'] },
  { id: 'LS20-10', model: 'LS20-10', diameter: 20, lead: 10, accuracy: 'C10', efficiency: 0.5, maxRPM: 2200, maxAxialLoad: 3000, maxStroke: 600, compatibleSeries: ['EC60', 'EC80'] },
];
