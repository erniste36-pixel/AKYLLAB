import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('ilimlab_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email, password) => {
    // Mock login logic
    const registeredUser = localStorage.getItem(`ilimlab_account_${email}`);
    if (registeredUser) {
      const data = JSON.parse(registeredUser);
      if (data.password === password) {
        setUser(data);
        localStorage.setItem('ilimlab_user', JSON.stringify(data));
        return { success: true };
      }
      return { success: false, message: 'Неверный пароль' };
    }
    return { success: false, message: 'Пользователь не найден' };
  };

  const register = (name, email, password) => {
    // Mock register logic
    if (localStorage.getItem(`ilimlab_account_${email}`)) {
      return { success: false, message: 'Пользователь уже существует' };
    }
    const newUser = { name, email, password };
    localStorage.setItem(`ilimlab_account_${email}`, JSON.stringify(newUser));
    setUser({ name, email });
    localStorage.setItem('ilimlab_user', JSON.stringify({ name, email }));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ilimlab_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
