import { minimatch } from 'minimatch';
import type { GitLabMRChange } from '@/types/gitlab';

const EXCLUSION_PATTERNS = [
  // Lockfiles
  'package-lock.json',
  'yarn.lock',
  'pnpm-lock.yaml',
  // Snapshots
  '**/*.snap',
  // Build outputs
  'dist/**',
  'build/**',
  '.next/**',
  // Vendor
  'vendor/**',
  // Minified files
  '**/*.min.*',
  // Generated files
  '**/*generated*',
  '**/*.gen.*',
];

export function isExcluded(filePath: string): boolean {
  return EXCLUSION_PATTERNS.some((pattern) => minimatch(filePath, pattern));
}

export function filterChanges(changes: GitLabMRChange[]): GitLabMRChange[] {
  return changes.filter((change) => {
    const path = change.new_path || change.old_path;
    return path && !isExcluded(path);
  });
}
