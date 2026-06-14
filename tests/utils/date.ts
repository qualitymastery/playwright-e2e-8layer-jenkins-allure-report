export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

export function formatDate(date: Date, locale = 'en-US'): string {
  return date.toLocaleDateString(locale);
}
