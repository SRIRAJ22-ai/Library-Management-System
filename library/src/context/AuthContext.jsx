import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Matches the 'userInfo' key used in your api.js interceptor
    const savedData = localStorage.getItem("userInfo");

    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setToken(parsedData.token);
        setUser(parsedData);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        localStorage.removeItem("userInfo");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData) => {
    // Save everything in one object to keep api.js happy
    localStorage.setItem("userInfo", JSON.stringify(userData));
    setToken(userData.token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isLoggedIn: !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
