import { useEffect, useState } from 'react';
import type { UserOption } from '@/types/gitlab';

export function useUserSearch() {
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userOptions, setUserOptions] = useState<UserOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userSearchQuery.trim().length < 2) {
      setUserOptions([]);
      setIsLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/users?search=${encodeURIComponent(userSearchQuery.trim())}`);
        if (!response.ok) {
          const errorData = (await response.json()) as { error?: string };
          const errorMessage = errorData.error ?? `Failed to search users: ${response.status} ${response.statusText}`;
          setError(errorMessage);
          setUserOptions([]);
          return;
        }
        const data = (await response.json()) as { users: UserOption[] };
        setUserOptions(data.users);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to search users';
        setError(errorMessage);
        setUserOptions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [userSearchQuery]);

  return {
    userOptions,
    userSearchQuery,
    setUserSearchQuery,
    isLoading,
    error,
  };
}
