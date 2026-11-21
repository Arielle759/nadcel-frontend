import { api } from "@/lib/api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

// Lets React components subscribe to login/logout via useSyncExternalStore,
// since writing to localStorage doesn't trigger a re-render on its own.
const authListeners = new Set<() => void>();

function notifyAuthChange(): void {
  authListeners.forEach((listener) => listener());
}

// Événement émis quand la session est effacée hors de ce module (réponse 401
// dans lib/api.ts, qui ne peut pas importer ce fichier sans dépendance circulaire).
export const AUTH_CLEARED_EVENT = "nadcel:auth-cleared";

// Synchronisation entre onglets : la session (jeton + utilisateur) est stockée
// dans le localStorage, commun à tous les onglets du site. Le navigateur émet
// « storage » dans les AUTRES onglets quand une clé change : déconnexion ou
// connexion avec un autre compte dans un onglet => tous les onglets suivent.
function onStorage(event: StorageEvent): void {
  if (event.key === null || event.key === TOKEN_KEY || event.key === USER_KEY) {
    notifyAuthChange();
  }
}

export function subscribeToAuthChanges(listener: () => void): () => void {
  if (authListeners.size === 0 && typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    window.addEventListener(AUTH_CLEARED_EVENT, notifyAuthChange);
  }
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
    if (authListeners.size === 0 && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(AUTH_CLEARED_EVENT, notifyAuthChange);
    }
  };
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
  phone?: string | null;
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
    // Le serveur invalide le jeton (il ne pourra plus servir, même copié).
    // Appel direct, hors du client « api » : sa gestion des 401 effacerait une
    // session ouverte entre-temps. Une erreur réseau n'empêche pas la
    // déconnexion locale ; keepalive laisse partir la requête si la page change.
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: "POST",
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
        keepalive: true,
      }).catch(() => {});
    }
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
  // Le nom affiché dans la barre latérale suit une modification du profil.
  notifyAuthChange();
}

export function hasRole(role: string): boolean {
  return getUser()?.roles?.some((r) => r.name === role) ?? false;
}

// Page d'arrivée après connexion : chaque rôle arrive directement dans son espace
// (le client sur ses rendez-vous).
export const CLIENT_HOME = "/client/appointments";

export function homePathFor(user: AuthUser | null): string {
  const roles = user?.roles?.map((r) => r.name) ?? [];
  if (roles.includes("admin")) return "/admin/dashboard";
  if (roles.includes("gerant")) return "/manager/dashboard";
  return CLIENT_HOME;
}

export function isAuthenticated(): boolean {
  return Boolean(getToken());
}
