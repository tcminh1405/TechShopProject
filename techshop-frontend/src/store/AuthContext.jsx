import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");
    localStorage.removeItem("fullName");
    localStorage.removeItem("phone");
    localStorage.removeItem("address");
    localStorage.removeItem("userId");
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");
    const fullName = localStorage.getItem("fullName");
    const phone = localStorage.getItem("phone");
    const address = localStorage.getItem("address");
    const id = localStorage.getItem("userId");

    if (token && role) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          logout();
        } else {
          // Khôi phục user từ localStorage, không cần gọi API
          setUser({ token, role, email, fullName, phone, address, id: id ? Number(id) : null });
        }
      } catch (err) {
        // Token không đúng định dạng -> Đăng xuất
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    if (!token) return;
    // Set token vào localStorage TRƯỚC
    localStorage.setItem("token", token);
    if (userData?.role) localStorage.setItem("role", userData.role);
    if (userData?.email) localStorage.setItem("email", userData.email);
    if (userData?.fullName) localStorage.setItem("fullName", userData.fullName);
    if (userData?.phone) localStorage.setItem("phone", userData.phone);
    if (userData?.address) localStorage.setItem("address", userData.address);
    if (userData?.id) localStorage.setItem("userId", String(userData.id));
    // Set vào state
    setUser({ token, ...userData });
  };

  const isAuthenticated = !!user?.token;
  const isAdmin = user?.role === "ADMIN";
  const isStaff = user?.role === "STAFF";

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout, isAuthenticated, isAdmin, isStaff, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
