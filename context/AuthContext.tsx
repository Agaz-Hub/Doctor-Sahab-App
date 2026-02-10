import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

interface User {
  _id: string;
  name: string;
  email: string;
  image?: string;
  address?: { line1?: string; line2?: string };
  gender?: string;
  dob?: string;
  phone?: number;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  loading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem("userToken");
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile(storedToken);
      }
    } catch (err) {
      console.error("Error loading auth:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async (authToken: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/get-profile`, {
        headers: { token: authToken },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      } else {
        // Token is invalid, clear it
        await AsyncStorage.removeItem("userToken");
        setToken(null);
        setUser(null);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        await AsyncStorage.setItem("userToken", data.token);
        setToken(data.token);
        await fetchProfile(data.token);
        return { success: true };
      }
      return { success: false, message: data.message || "Login failed" };
    } catch (err) {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/user/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (data.success && data.token) {
        await AsyncStorage.setItem("userToken", data.token);
        setToken(data.token);
        await fetchProfile(data.token);
        return { success: true };
      }
      return { success: false, message: data.message || "Registration failed" };
    } catch (err) {
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem("userToken");
    setToken(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
