"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  username: string | null;
  setUsername: (name: string) => void;
  avatar: string | null;
  setAvatar: (url: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ username, setUsername, avatar, setAvatar }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be inside UserProvider");
  return context;
};