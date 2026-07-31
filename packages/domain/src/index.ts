export interface StarterWorkspaceDescriptor {
  readonly name: string;
  readonly generatedBy: "vibe-engineer";
}

export function describeStarterWorkspace(name: string): StarterWorkspaceDescriptor {
  const normalized = name.trim();
  if (normalized.length === 0) throw new Error("Starter workspace name is required.");
  return Object.freeze({ name: normalized, generatedBy: "vibe-engineer" });
}
