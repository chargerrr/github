import { useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import HomePage from "@/pages/HomePage";
import AdminPage from "@/pages/AdminPage";
import SettingsPage from "@/pages/SettingsPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      checkAuth(token);
    } else {
      setLoading(false);
    }
  }, []);

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-yellow-400"></div>
      </div>
    );
  }

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage user={user} setUser={setUser} logout={logout} />} />
          <Route
            path="/admin"
            element={user?.is_admin ? <AdminPage user={user} logout={logout} /> : <Navigate to="/" />}
          />
          <Route
            path="/settings"
            element={user?.is_admin ? <SettingsPage user={user} logout={logout} /> : <Navigate to="/" />}
          />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;