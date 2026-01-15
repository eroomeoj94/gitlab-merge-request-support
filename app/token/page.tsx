'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { SaveTokenResponse } from '@/types/report';

export default function TokenPage() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SaveTokenResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!token.trim()) {
      setError('Token is required');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          const errorData = (await response.json()) as SaveTokenResponse;
          setError(errorData.ok === false ? errorData.error : `Error: ${response.status}`);
        } else {
          const text = await response.text();
          setError(`Server error: ${response.status} ${response.statusText}`);
        }
        return;
      }

      const data = (await response.json()) as SaveTokenResponse;

      if (data.ok) {
        setResult(data);
        setToken('');
      } else {
        setError(data.error);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('Invalid response from server. Please check the API route is working.');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to save token');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      await fetch('/api/token', {
        method: 'DELETE',
      });

      setResult({ ok: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-2xl px-8 py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            ← Back to Home
          </Link>
        </div>

        <h1 className="mb-6 text-3xl font-semibold text-black dark:text-zinc-50">
          Manage GitLab Token
        </h1>

        <div className="space-y-6 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div>
            <label
              htmlFor="token"
              className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
            >
              Personal Access Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your GitLab Personal Access Token"
              className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder-zinc-400"
              disabled={loading}
            />
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              Your token is stored securely server-side and never sent back to the client.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleSave}
              disabled={loading || !token.trim()}
              className="rounded-md bg-zinc-900 px-4 py-2 text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {loading ? 'Saving...' : 'Save Token'}
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="rounded-md border border-zinc-300 bg-white px-4 py-2 text-zinc-900 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
            >
              {loading ? 'Deleting...' : 'Delete Token'}
            </button>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          {result && result.ok && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200">
              <p className="font-medium">Token saved successfully!</p>
              {'user' in result && (
                <div className="mt-2">
                  <p>User: {result.user.name} (@{result.user.username})</p>
                  <p>Expires: {new Date(result.expiresAt).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
