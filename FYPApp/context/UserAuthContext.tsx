import React, { createContext, useState, useContext, ReactNode } from 'react';

type UserAuthContextType = {
  isLoggedIn: boolean;
  user: { username: string } | null;
  login: (username: string) => void;
  logout: () => void;
};

const UserAuthContext = createContext<UserAuthContextType | undefined>(undefined);

export const UserAuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [user, setUser] = useState<{ username: string } | null>(null);

  const login = (username: string) => {
    setUser({ username });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <UserAuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
      {children}
    </UserAuthContext.Provider>
  );
};

export const useUserAuth = (): UserAuthContextType => {
  const context = useContext(UserAuthContext);
  if (!context) {
    throw new Error('useUserAuth must be used within a UserAuthProvider');
  }
  return context;
};
