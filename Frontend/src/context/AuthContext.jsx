import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ff_token');
    const saved = localStorage.getItem('ff_user');
    if (token && saved) {
      setUser(JSON.parse(saved));
      authAPI.me()
        .then((res) => {
          setUser(res.data);
          localStorage.setItem('ff_user', JSON.stringify(res.data));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (emailOrPhone, password) => {
    const res = await authAPI.login({ emailOrPhone, password });
    const { accessToken, ...userData } = res.data;
    localStorage.setItem('ff_token', accessToken);
    localStorage.setItem('ff_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { accessToken, ...userData } = res.data;
    localStorage.setItem('ff_token', accessToken);
    localStorage.setItem('ff_user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('ff_token');
    localStorage.removeItem('ff_user');
    setUser(null);
  };

  const updateProfile = async (data) => {
    const res = await authAPI.updateProfile(data);
    setUser(res.data);
    localStorage.setItem('ff_user', JSON.stringify(res.data));
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
