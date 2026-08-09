import { useSyncExternalStore } from "react";

function subscribeNoop() {
  return () => {};
}

// Server render (and the client's first hydration pass) must agree, so this
// reports `false` until the client has taken over — only then is it safe to
// compute anything that depends on browser-only state (Date.now(), localStorage, ...).
export function useHasMounted(): boolean {
  return useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
}
