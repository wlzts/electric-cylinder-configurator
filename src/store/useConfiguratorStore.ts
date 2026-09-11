import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Configuration, ApplicationRequirement } from '@/types';

export const DEFAULT_REQUIREMENTS: ApplicationRequirement = {
  orientation: 'horizontal',
  payload: 20,
  stroke: 500,
  targetSpeed: 300,
  acceleration: 500,
  targetThrust: 500,
  repeatability: 0.02,
  dailyHours: 8,
  cyclesPerMin: 10,
  environment: 'normal',
  controlMode: 'position',
  communication: 'ETHERCAT',
  brakeRequired: false,
};

export const DEFAULT_CONFIG: Configuration = {
  cylinderId: null,
  transmission: null,
  screwId: null,
  beltId: null,
  motorId: null,
  driveId: null,
  encoderId: null,
  brake: false,
  sensors: [],
  accessories: [],
  communicationId: 'ETHERCAT',
  stroke: 500,
};

interface ConfiguratorState {
  requirements: ApplicationRequirement;
  configuration: Configuration;
  currentStep: number;
  advancedMode: boolean;
  compareIds: string[];
  setRequirements: (r: Partial<ApplicationRequirement>) => void;
  setConfiguration: (c: Partial<Configuration>) => void;
  setStep: (step: number) => void;
  toggleAdvanced: () => void;
  resetConfiguration: () => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  applyRecommendation: (config: Configuration) => void;
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set) => ({
      requirements: DEFAULT_REQUIREMENTS,
      configuration: DEFAULT_CONFIG,
      currentStep: 0,
      advancedMode: false,
      compareIds: [],
      setRequirements: (r) =>
        set((state) => ({ requirements: { ...state.requirements, ...r } })),
      setConfiguration: (c) =>
        set((state) => ({ configuration: { ...state.configuration, ...c } })),
      setStep: (step) => set({ currentStep: step }),
      toggleAdvanced: () => set((state) => ({ advancedMode: !state.advancedMode })),
      resetConfiguration: () =>
        set({ configuration: { ...DEFAULT_CONFIG }, currentStep: 0 }),
      toggleCompare: (id) =>
        set((state) => {
          const exists = state.compareIds.includes(id);
          if (exists) return { compareIds: state.compareIds.filter((x) => x !== id) };
          if (state.compareIds.length >= 3) return { compareIds: [...state.compareIds.slice(1), id] };
          return { compareIds: [...state.compareIds, id] };
        }),
      clearCompare: () => set({ compareIds: [] }),
      applyRecommendation: (config) => set({ configuration: config, currentStep: 1 }),
    }),
    {
      name: 'ecc-configurator-v1',
      partialize: (state) => ({
        requirements: state.requirements,
        configuration: state.configuration,
        advancedMode: state.advancedMode,
      }),
    },
  ),
);
