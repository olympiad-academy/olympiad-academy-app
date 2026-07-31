export const starterContractReadiness = Object.freeze({
  generatedFeatureContracts: "schematic-owned",
  starterContracts: "none",
} as const);

export type StarterContractReadiness = typeof starterContractReadiness;
