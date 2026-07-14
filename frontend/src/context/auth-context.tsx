"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthState } from "@/types";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("voicecart_token");
    const userJson = localStorage.getItem("voicecart_user");
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        setState({ user, token, isLoading: false, isAuthenticated: true });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      const { data } = await apiClient.post("/auth/login", { email, password });
      const { token, user } = data.data;
      localStorage.setItem("voicecart_token", token);
      localStorage.setItem("voicecart_user", JSON.stringify(user));
      setState({ user, token, isLoading: false, isAuthenticated: true });
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Invalid credentials. Please try again.";
      toast.error(msg);
      return false;
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<boolean> => {
      try {
        const { data } = await apiClient.post("/auth/register", { name, email, password });
        const { token, user } = data.data;
        localStorage.setItem("voicecart_token", token);
        localStorage.setItem("voicecart_user", JSON.stringify(user));
        setState({ user, token, isLoading: false, isAuthenticated: true });
        toast.success(`Welcome to VoiceCart, ${user.name}!`);
        return true;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          "Registration failed. Please try again.";
        toast.error(msg);
        return false;
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem("voicecart_token");
    localStorage.removeItem("voicecart_user");
    setState({ user: null, token: null, isLoading: false, isAuthenticated: false });
    toast.success("Logged out successfully.");
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
