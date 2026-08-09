import { api } from "@/lib/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Lets React components subscribe to login/logout via useSyncExternalStore,
// since writing to localStorage doesn't trigger a re-render on its own.
const authListeners = new Set<() => void>();

function notifyAuthChange(): void {
  authListeners.forEach((listener) => listener());
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  authListeners.add(listener);
  return () => authListeners.delete(listener);
}

export interface AuthRole {
  id: number;
  name: string;
  guard_name: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  roles: AuthRole[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/login", credentials);
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function register(payload: RegisterData): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/auth/register", payload);
  setToken(data.token);
  setUser(data.user);
  return data;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
  notifyAuthChange();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(TOKEN_KEY, token);
  }
  notifyAuthChange();
}

// getUser() is used as a useSyncExternalStore getSnapshot — it must return a
// referentially stable value when nothing changed, or React sees a "new"
// snapshot on every render and loops forever ("Maximum update depth
// exceeded"). Cache the parsed object and only re-parse when the raw
// localStorage string actually differs from last time.
let cachedUserRaw: string | null = null;
let cachedUser: AuthUser | null = null;

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (raw === cachedUserRaw) {
    return cachedUser;
  }
  cachedUserRaw = raw;
  if (!raw) {
    cachedUser = null;
    return null;
  }
  try {
    cachedUser = JSON.parse(raw) as AuthUser;
  } catch {
    cachedUser = null;
  }
  return cachedUser;
}

export function setUser(user: AuthUser): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function hasRole(role: string): boolean {
  return getUser()?.roles?.some((r) => r.name === role) ?? false;
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
