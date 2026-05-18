export const SECTION_82_THRESHOLDS = {
  PH: {
    min: 6.0,
    max: 10.0,
    warnMin: 6.5,
    warnMax: 9.5,
    unit: "pH",
    legalRef: "Water Industry Act 1991, s.82(3)(a)",
  },
  COD: {
    max: 500,
    warn: 400,
    unit: "mg/L",
    legalRef: "Water Industry Act 1991, s.82(3)(b)",
  },
  BOD: {
    max: 300,
    warn: 250,
    unit: "mg/L",
    legalRef: "Water Industry Act 1991, s.82(3)(c)",
  },
  TSS: {
    max: 600,
    warn: 500,
    unit: "mg/L",
    legalRef: "Water Industry Act 1991, s.82(3)(d)",
  },
  TEMPERATURE: {
    max: 43,
    warn: 40,
    unit: "°C",
    legalRef: "Water Industry Act 1991, s.82(3)(e)",
  },
  AMMONIA: {
    max: 50,
    warn: 40,
    unit: "mg/L",
    legalRef: "Water Industry Act 1991, s.82(4)",
  },
  HEAVY_METAL_LEAD: {
    max: 0.1,
    warn: 0.08,
    unit: "mg/L",
    legalRef: "Water Industry Act 1991, s.82(5)(a)",
  },
  HEAVY_METAL_MERCURY: {
    max: 0.01,
    warn: 0.008,
    unit: "mg/L",
    legalRef: "Water Industry Act 1991, s.82(5)(b)",
  },
} as const;

export const COMPLIANCE_SCORE_WEIGHTS = {
  PH: 0.2,
  COD: 0.2,
  BOD: 0.15,
  TSS: 0.15,
  TEMPERATURE: 0.1,
  AMMONIA: 0.1,
  HEAVY_METAL_LEAD: 0.05,
  HEAVY_METAL_MERCURY: 0.05,
};
