export function isToday(date: Date | string | null): boolean {
  const today = new Date();

  if (!date) return false;
  const lastUpdatedParsed = typeof date === 'string' ? new Date(date) : date;

  return (
    lastUpdatedParsed.getDate() === today.getDate() &&
    lastUpdatedParsed.getMonth() === today.getMonth() &&
    lastUpdatedParsed.getFullYear() === today.getFullYear()
  );
}
