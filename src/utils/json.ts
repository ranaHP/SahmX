export function safeParseJson(value: string): { ok: true; data: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, data: JSON.parse(value) };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'Invalid JSON' };
  }
}

export function formatJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function maskSecret(value?: string | number, visible = 5): string {
  if (value === undefined || value === null || value === '') return 'Not available';
  const text = String(value);
  if (text.length <= visible * 2) return '•'.repeat(Math.max(text.length, 8));
  return `${text.slice(0, visible)}${'•'.repeat(12)}${text.slice(-visible)}`;
}

export function secondsToLabel(seconds?: number) {
  if (!seconds) return 'Not supplied';
  const mins = Math.floor(seconds / 60);
  const rem = seconds % 60;
  return mins ? `${mins}m ${rem}s` : `${rem}s`;
}
