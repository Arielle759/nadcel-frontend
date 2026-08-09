import { useCallback, useState } from "react";
import { api, toErrorMessage } from "@/lib/api";
import { Service } from "@/hooks/useServices";

export interface EmployeeUser {
  id: number;
  name: string;
  email: string;
}

export interface Employee {
  id: number;
  user_id: number;
  salon_id: number;
  name: string;
  phone: string;
  user: EmployeeUser;
  services: Service[];
}

export interface CreateEmployeeData {
  salon_id: number;
  name: string;
  phone: string;
  email: string;
}

export interface UpdateEmployeeData {
  name: string;
  phone: string;
  service_ids?: number[];
}

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
}

interface UseEmployeesResult {
  getEmployees: (salonId: number | string) => Promise<Employee[]>;
  createEmployee: (data: CreateEmployeeData) => Promise<Employee>;
  updateEmployee: (id: number | string, data: UpdateEmployeeData) => Promise<Employee>;
  deleteEmployee: (id: number | string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function useEmployees(): UseEmployeesResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getEmployees = useCallback(async (salonId: number | string): Promise<Employee[]> => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<PaginatedResponse<Employee>>("/employees", {
        params: { salon_id: salonId },
      });
      // Defensive filter: the backend is expected to scope results to
      // salon_id already, but we can't currently verify that from here, so
      // we re-filter client-side to avoid leaking employees across salons.
      return data.data.filter((employee) => Number(employee.salon_id) === Number(salonId));
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de charger les employés.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = useCallback(async (data: CreateEmployeeData): Promise<Employee> => {
    setLoading(true);
    setError(null);
    try {
      const { data: employee } = await api.post<Employee>("/employees", data);
      return employee;
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de créer l'employé.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateEmployee = useCallback(
    async (id: number | string, data: UpdateEmployeeData): Promise<Employee> => {
      setLoading(true);
      setError(null);
      try {
        const { data: employee } = await api.put<Employee>(`/employees/${id}`, data);
        return employee;
      } catch (err) {
        const message = toErrorMessage(err, "Impossible de mettre à jour l'employé.");
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const deleteEmployee = useCallback(async (id: number | string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/employees/${id}`);
    } catch (err) {
      const message = toErrorMessage(err, "Impossible de supprimer l'employé.");
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { getEmployees, createEmployee, updateEmployee, deleteEmployee, loading, error };
}
