import type { MRMetrics } from '@/types/report';
import type { GitLabMRChange } from '@/types/gitlab';
import { filterChanges } from './exclusions';

export function computeMetrics(changes: GitLabMRChange[]): MRMetrics {
  const filtered = filterChanges(changes);
  const files = new Set<string>();
  const dirs = new Set<string>();

  let additions = 0;
  let deletions = 0;

  for (const change of filtered) {
    const path = change.new_path || change.old_path;
    if (!path) continue;

    files.add(path);

    const dir = path.substring(0, path.lastIndexOf('/')) || '/';
    dirs.add(dir);

    if (change.diff) {
      const lines = change.diff.split('\n');
      for (const line of lines) {
        if (line.startsWith('+') && !line.startsWith('+++')) {
          additions++;
        } else if (line.startsWith('-') && !line.startsWith('---')) {
          deletions++;
        }
      }
    }
  }

  return {
    additions,
    deletions,
    linesChanged: additions + deletions,
    filesChanged: files.size,
    dirsTouched: dirs.size,
  };
}

export function computeScore(metrics: MRMetrics): number {
  const { linesChanged, filesChanged, dirsTouched } = metrics;

  const scoreRaw =
    Math.sqrt(linesChanged) + 2 * Math.log1p(filesChanged) + 3 * Math.log1p(dirsTouched);

  return Math.round(10 * scoreRaw);
}

export function getSizeBand(score: number): 'S' | 'M' | 'L' | 'XL' {
  if (score < 80) return 'S';
  if (score < 141) return 'M';
  if (score < 221) return 'L';
  return 'XL';
}
