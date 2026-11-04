import { useCallback } from "react";
import { api, toErrorMessage } from "@/lib/api";
import { setToken, setUser, type AuthUser } from "@/lib/auth";

export interface ProfileData {
  name: string;
  phone: string | null;
}

export interface PasswordChange {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export function useProfile() {
  const getProfile = useCallback(async (): Promise<AuthUser> => {
    try {
      const { data } = await api.get<AuthUser>("/profile");
      return data;
    } catch (err) {
      throw new Error(toErrorMessage(err, "Impossible de charger votre profil."));
    }
  }, []);

  const updateProfile = useCallback(async (payload: ProfileData): Promise<AuthUser> => {
    try {
      const { data } = await api.patch<AuthUser>("/profile", payload);
      setUser(data);
      return data;
    } catch (err) {
      throw new Error(toErrorMessage(err, "Impossible d'enregistrer vos informations."));
    }
  }, []);

  // Le serveur renvoie un nouveau jeton : l'ancien est révoqué avec l'ancien
  // mot de passe, et les autres appareils sont déconnectés.
  const changePassword = useCallback(async (payload: PasswordChange): Promise<void> => {
    try {
      const { data } = await api.put<{ token: string; user: AuthUser }>("/profile/password", payload);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      throw new Error(toErrorMessage(err, "Impossible de changer le mot de passe."));
    }
  }, []);

  return { getProfile, updateProfile, changePassword };
}
