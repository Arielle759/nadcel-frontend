import { useSyncExternalStore } from "react";
import { AuthUser, getUser, isAuthenticated, subscribeToAuthChanges } from "@/lib/auth";

// Server render (and the client's first hydration pass) can't know what's in
// localStorage, so both report "logged out" until the client snapshot — taken
// after mount, and again on every login()/logout() — takes over.
export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeToAuthChanges, isAuthenticated, () => false);
}

export function useCurrentUser(): AuthUser | null {
  return useSyncExternalStore(subscribeToAuthChanges, getUser, () => null);
}
