// Dummy auth to make build pass
export function useAuth() {
  return { user: null, loading: false };
}
export const useUser = useAuth;
