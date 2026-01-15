import type { ReportResponse } from '@/types/report';

export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  if (numbers.length === 1) return numbers[0]!;

  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1]! + sorted[mid]!) / 2;
  }
  return sorted[mid]!;
}

export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return sum / numbers.length;
}

export async function promisePool<T>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = fn(item).then(() => {
      const index = executing.indexOf(promise);
      if (index > -1) {
        executing.splice(index, 1);
      }
    });

    executing.push(promise);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
}

export function groupByAuthor(
  mergeRequests: ReportResponse['mergeRequests'],
): Map<string, ReportResponse['mergeRequests']> {
  const grouped = new Map<string, ReportResponse['mergeRequests']>();

  for (const mr of mergeRequests) {
    const username = mr.author.username;
    const existing = grouped.get(username) ?? [];
    existing.push(mr);
    grouped.set(username, existing);
  }

  return grouped;
}
