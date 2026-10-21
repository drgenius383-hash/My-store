// Small fetch wrapper for the admin panel. Reloads the page if the admin
// session has expired so the login form appears again.
export async function adminFetch<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') window.location.reload();
    throw new Error('Your admin session expired. Please log in again.');
  }

  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((json as { error?: string }).error ?? 'Request failed.');
  }
  return json as T;
}
