import { useCallback, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";

// Option d'un service (ex. longueur des tresses) avec son prix et sa durée.
export interface ServiceOption {
  id?: number;
  label: string;
  price: number;
  duration: number;
}

export interface Service {
  id: number;
  salon_id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  // Nom du choix proposé (« Longueur »…) et ses options ; vide = prix unique.
  option_label?: string | null;
  options?: ServiceOption[];
  image: string | null;
  is_active: boolean;
  // Membres de l'équipe qui réalisent la prestation : 0 = aucun créneau possible.
  employees_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceData {
  option_label?: string | null;
  options?: ServiceOption[];
  salon_id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: File | null;
}

export interface UpdateServiceData {
  option_label?: string | null;
  options?: ServiceOption[];
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  image?: File | null;
}

function toServiceFormData(data: {
  salon_id?: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  option_label?: string | null;
  options?: ServiceOption[];
  image?: File | null;
}): FormData {
  const formData = new FormData();
  if (data.salon_id !== undefined) formData.append("salon_id", String(data.salon_id));
  formData.append("name", data.name);
  formData.append("description", data.description);
  formData.append("price", String(data.price));
  formData.append("duration", String(data.duration));
  formData.append("category", data.category);
  if (data.options) {
    formData.append("option_label", data.option_label ?? "");
    formData.append("options", JSON.stringify(data.options.map(({ label, price, duration }) => ({ label, price, duration }))));
  }
  if (data.image) formData.append("image", data.image);
  return formData;
}

function optionFields(option_label?: string | null, options?: ServiceOption[]) {
  if (!options) return {};
  return {
    option_label: option_label || null,
    options: options.map(({ label, price, duration }) => ({ label, price, duration })),
  };
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseServicesResult {
  getServices: (salonId: number | string) => Promise<Service[]>;
  createService: (data: CreateServiceData) => Promise<Service>;
  updateService: (id: number | string, data: UpdateServiceData) => Promise<Service>;
  deleteService: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useServices(): UseServicesResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getServices = useCallback(async (salonId: number | string): Promise<Service[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Service>>("/services", {
        params: { salon_id: salonId, per_page: 100 },
      });
      return data.data;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les services.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: CreateServiceData): Promise<Service> => {
    setLoading(true);
    setError(null);
    try {
      // Photo-less creation keeps sending plain JSON, exactly as before (no
      // `image` key at all — not even `null` — since a `sometimes` validation
      // rule on the backend only skips validation when the key is absent).
      // The shared `api` instance defaults to Content-Type: application/json,
      // which overrides axios's usual FormData auto-detection and makes it
      // JSON.stringify the FormData instead of sending it as multipart —
      // clearing the header here lets the browser set its own boundary.
      const { salon_id, name, description, price, duration, category, option_label, options } = data;
      const { data: service } = data.image
        ? await api.post<Service>("/services", toServiceFormData(data), {
            headers: { "Content-Type": undefined },
          })
        : await api.post<Service>("/services", {
            salon_id,
            name,
            description,
            price,
            duration,
            category,
            ...optionFields(option_label, options),
          });
      return service;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de créer le service.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(
    async (id: number | string, data: UpdateServiceData): Promise<Service> => {
      setLoading(true);
      setError(null);
      try {
        let service: Service;
        if (data.image) {
          // PHP never populates the uploaded-file data on a raw PUT request
          // body, multipart or not — Laravel's documented workaround is to
          // POST with a `_method` override field instead.
          const formData = toServiceFormData(data);
          formData.append("_method", "PUT");
          const { data: updated } = await api.post<Service>(`/services/${id}`, formData, {
            headers: { "Content-Type": undefined },
          });
          service = updated;
        } else {
          const { name, description, price, duration, category, option_label, options } = data;
          const { data: updated } = await api.put<Service>(`/services/${id}`, {
            name,
            description,
            price,
            duration,
            category,
            ...optionFields(option_label, options),
          });
          service = updated;
        }
        return service;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible de mettre à jour le service.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteService = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/services/${id}`);
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de supprimer le service.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { getServices, createService, updateService, deleteService, loading, error };
}
