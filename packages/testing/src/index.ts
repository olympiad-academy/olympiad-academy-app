export function starterTestLabel(label: string): string {
  const normalized = label.trim();
  if (normalized.length === 0) throw new Error("Starter test label is required.");
  return `starter:${normalized}`;
}
