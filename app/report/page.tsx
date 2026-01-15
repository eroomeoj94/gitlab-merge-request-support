'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { ReportRequest, ReportResponse } from '@/types/report';

type SortField = 'score' | 'mergedAt' | 'title';
type SortDirection = 'asc' | 'desc';

export default function ReportPage() {
  const [scopeType, setScopeType] = useState<'project' | 'group'>('project');
  const [scopeId, setScopeId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [authors, setAuthors] = useState('');
  const [excludeDrafts, setExcludeDrafts] = useState(true);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('score');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const usernames = authors
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (usernames.length === 0) {
      setError('At least one author username is required');
      return;
    }

    if (!scopeId || isNaN(parseInt(scopeId, 10))) {
      setError('Valid scope ID is required');
      return;
    }

    if (!dateFrom || !dateTo) {
      setError('Date range is required');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const request: ReportRequest = {
        scope: {
          type: scopeType,
          id: parseInt(scopeId, 10),
        },
        dateRange: {
          from: dateFrom,
          to: dateTo,
        },
        authors: {
          usernames,
        },
        filters: {
          excludeDrafts,
        },
      };

      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error: string };
        setError(errorData.error || 'Failed to generate report');
        return;
      }

      const data = (await response.json()) as ReportResponse;
      setReport(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMRs = report
    ? [...report.mergeRequests].sort((a, b) => {
        let comparison = 0;
        if (sortField === 'score') {
          comparison = a.score - b.score;
        } else if (sortField === 'mergedAt') {
          comparison =
            new Date(a.mergedAt).getTime() - new Date(b.mergedAt).getTime();
        } else if (sortField === 'title') {
          comparison = a.title.localeCompare(b.title);
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      })
    : [];

  const getBandColor = (band: 'S' | 'M' | 'L' | 'XL') => {
    switch (band) {
      case 'S':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200';
      case 'M':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200';
      case 'L':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-200';
      case 'XL':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-7xl mx-auto px-8 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-semibold text-black dark:text-zinc-50">
          Generate Report
        </h1>

        <form onSubmit={handleSubmit} className="mb-8 space-y-6">
          <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Scope Type
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="project"
                      checked={scopeType === 'project'}
                      onChange={(e) => setScopeType(e.target.value as 'project')}
                      className="mr-2"
                    />
                    Project
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="group"
                      checked={scopeType === 'group'}
                      onChange={(e) => setScopeType(e.target.value as 'group')}
                      className="mr-2"
                    />
                    Group
                  </label>
                </div>
              </div>

              <div>
                <label
                  htmlFor="scopeId"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  {scopeType === 'project' ? 'Project ID' : 'Group ID'}
                </label>
                <input
                  id="scopeId"
                  type="number"
                  value={scopeId}
                  onChange={(e) => setScopeId(e.target.value)}
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="dateFrom"
                    className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    From Date
                  </label>
                  <input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="dateTo"
                    className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                  >
                    To Date
                  </label>
                  <input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="authors"
                  className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Author Usernames (required, comma or newline separated)
                </label>
                <textarea
                  id="authors"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  rows={4}
                  className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
                  placeholder="username1, username2, username3"
                  required
                />
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={excludeDrafts}
                    onChange={(e) => setExcludeDrafts(e.target.checked)}
                    className="mr-2"
                  />
                  Exclude drafts (titles starting with "Draft:" or "WIP:")
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="rounded-md bg-zinc-900 px-6 py-3 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </form>

        {error && (
          <div className="mb-8 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {report && (
          <div className="space-y-8">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">
                Summary
              </h2>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Total MRs</div>
                  <div className="text-2xl font-bold text-black dark:text-zinc-50">
                    {report.totals.mergedMrCount}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    Total Lines Changed
                  </div>
                  <div className="text-2xl font-bold text-black dark:text-zinc-50">
                    {report.totals.totalLinesChanged.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Avg Score</div>
                  <div className="text-2xl font-bold text-black dark:text-zinc-50">
                    {Math.round(report.totals.avgScore)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Median Score</div>
                  <div className="text-2xl font-bold text-black dark:text-zinc-50">
                    {Math.round(report.totals.medianScore)}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">
                By Author
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Author
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        MRs
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Lines Changed
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Avg Score
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Median Score
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Largest MR
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.byAuthor.map((author) => (
                      <tr
                        key={author.username}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="px-4 py-2">
                          <div className="font-medium text-black dark:text-zinc-50">
                            {author.name}
                          </div>
                          <div className="text-sm text-zinc-600 dark:text-zinc-400">
                            @{author.username}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {author.mergedMrCount}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {author.totalLinesChanged.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {Math.round(author.avgScore)}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {Math.round(author.medianScore)}
                        </td>
                        <td className="px-4 py-2">
                          {author.largestMr ? (
                            <a
                              href={author.largestMr.webUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                            >
                              {author.largestMr.title} (Score: {author.largestMr.score})
                            </a>
                          ) : (
                            <span className="text-sm text-zinc-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="mb-4 text-2xl font-semibold text-black dark:text-zinc-50">
                Merge Requests
              </h2>
              <div className="mb-4 flex gap-2">
                <button
                  onClick={() => handleSort('score')}
                  className={`rounded px-3 py-1 text-sm ${
                    sortField === 'score'
                      ? 'bg-zinc-200 dark:bg-zinc-700'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  Sort by Score {sortField === 'score' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('mergedAt')}
                  className={`rounded px-3 py-1 text-sm ${
                    sortField === 'mergedAt'
                      ? 'bg-zinc-200 dark:bg-zinc-700'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  Sort by Date{' '}
                  {sortField === 'mergedAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
                <button
                  onClick={() => handleSort('title')}
                  className={`rounded px-3 py-1 text-sm ${
                    sortField === 'title'
                      ? 'bg-zinc-200 dark:bg-zinc-700'
                      : 'bg-zinc-100 dark:bg-zinc-800'
                  }`}
                >
                  Sort by Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Title
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Author
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Score
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Size
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Lines
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Files
                      </th>
                      <th className="px-4 py-2 text-right text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Dirs
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Merged
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedMRs.map((mr) => (
                      <tr
                        key={`${mr.projectId}-${mr.iid}`}
                        className="border-b border-zinc-100 dark:border-zinc-800"
                      >
                        <td className="px-4 py-2">
                          <a
                            href={mr.webUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-zinc-900 hover:text-zinc-600 dark:text-zinc-100 dark:hover:text-zinc-400"
                          >
                            {mr.title}
                          </a>
                        </td>
                        <td className="px-4 py-2 text-black dark:text-zinc-50">
                          {mr.author.username}
                        </td>
                        <td className="px-4 py-2 text-right font-medium text-black dark:text-zinc-50">
                          {mr.score}
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className={`rounded px-2 py-1 text-xs font-medium ${getBandColor(
                              mr.sizeBand,
                            )}`}
                          >
                            {mr.sizeBand}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {mr.metrics.linesChanged.toLocaleString()}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {mr.metrics.filesChanged}
                        </td>
                        <td className="px-4 py-2 text-right text-black dark:text-zinc-50">
                          {mr.metrics.dirsTouched}
                        </td>
                        <td className="px-4 py-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {new Date(mr.mergedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
