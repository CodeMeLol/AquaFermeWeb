import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getSavedAuth() {
  const savedToken = sessionStorage.getItem("token");
  const savedUser = sessionStorage.getItem("user");

  if (!savedToken || !savedUser) {
    return {
      user: null,
      token: null,
    };
  }

  return {
    user: JSON.parse(savedUser),
    token: savedToken,
  };
}

export function AuthProvider({ children }) {
  const savedAuth = getSavedAuth();

  const [user, setUser] = useState(savedAuth.user);
  const [token, setToken] = useState(savedAuth.token);

  async function login(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || data.message || "Identifiants incorrects");
    }

    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    setToken(data.token);
    setUser(data.user);

    return data.user;
  }

  function logout() {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth doit être utilisé dans <AuthProvider>");
  }

  return ctx;
}