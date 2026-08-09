import axios, { AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const apiOrigin = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/api\/?$/, "");

export function assetUrl(path: string | null | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${apiOrigin}${path}`;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

const DEFAULT_STATUS_MESSAGES: Record<number, string> = {
  401: "Votre session a expiré, veuillez vous reconnecter.",
  403: "Vous n'êtes pas autorisé à effectuer cette action.",
  404: "La ressource demandée est introuvable.",
  409: "Cette action n'est plus possible en raison d'un conflit.",
  422: "Les données envoyées sont invalides.",
};

// Precise messages for known conflict/not-found cases, used when the backend
// doesn't send its own `message`. Matched on the request path, since the same
// status code means different things depending on the endpoint.
const SPECIFIC_ERROR_RULES: Array<{
  status: number;
  method?: string;
  urlPattern: RegExp;
  message: string;
}> = [
  {
    status: 409,
    method: "post",
    urlPattern: /\/appointments\/?$/,
    message: "Ce créneau n'est plus disponible, merci d'en choisir un autre.",
  },
  {
    status: 409,
    method: "post",
    urlPattern: /\/reviews\/?$/,
    message: "Un avis a déjà été laissé pour ce rendez-vous.",
  },
  {
    status: 422,
    method: "post",
    urlPattern: /\/reviews\/?$/,
    message: "Ce rendez-vous doit être terminé pour laisser un avis.",
  },
  {
    status: 404,
    urlPattern: /\/salons\/\d+/,
    message: "Salon introuvable.",
  },
];

function resolveErrorMessage(error: AxiosError<ApiErrorBody>): string {
  if (!error.response) {
    return "Impossible de contacter le serveur. Vérifiez votre connexion.";
  }

  const { status, data } = error.response;

  if (data?.message) {
    return data.message;
  }

  const url = error.config?.url ?? "";
  const method = error.config?.method?.toLowerCase();
  const specificRule = SPECIFIC_ERROR_RULES.find(
    (rule) =>
      rule.status === status && (!rule.method || rule.method === method) && rule.urlPattern.test(url)
  );
  if (specificRule) {
    return specificRule.message;
  }

  const firstFieldError = data?.errors && Object.values(data.errors)[0]?.[0];
  if (firstFieldError) {
    return firstFieldError;
  }

  return DEFAULT_STATUS_MESSAGES[status] ?? "Une erreur est survenue, veuillez réessayer.";
}

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorBody>) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // The stored token is invalid/expired. Clear it so the request
      // interceptor stops attaching it to every subsequent call — otherwise
      // even public endpoints (e.g. availability) keep failing with
      // "Unauthenticated." because the backend rejects the bad token before
      // it ever gets to check whether the route requires auth at all.
      // Keys must stay in sync with TOKEN_KEY/USER_KEY in lib/auth.ts.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
    error.message = resolveErrorMessage(error);
    return Promise.reject(error);
  }
);

export function toErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export default api;
