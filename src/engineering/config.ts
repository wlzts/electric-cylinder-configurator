// Engineering settings / thresholds. Kept out of UI so they can be tuned centrally.
// DEMO model — these are simplified constants, not certified engineering values.

export const ENGINEERING_CONFIG = {
  gravity: 9.81, // m/s²
  // Safety factor thresholds (UI color coding)
  safetyFactor: {
    recommended: 2.5, // >= recommended
    acceptable: 1.5, // >= acceptable (yellow), below = risk
  },
  // Screw critical speed safety margin (0.8 means operate at <= 80% of critical)
  criticalSpeedMargin: 0.8,
  // Bearing / nut life constants (simplified L10 model)
  life: {
    ratedLifeMillionRev: 100, // L10 = 100 million revolutions (demo)
    hoursPerYear: 2080,
  },
  // Friction coefficients (demo)
  friction: {
    horizontal: 0.1,
    vertical: 0.02, // gravity dominates; guide friction small
  },
  // Mechanical efficiency by transmission (demo)
  efficiency: {
    ball_screw: 0.9,
    lead_screw: 0.4,
    timing_belt: 0.85,
  },
  // Inertia ratio recommended limit
  inertiaRatioLimit: 5,
} as const;
