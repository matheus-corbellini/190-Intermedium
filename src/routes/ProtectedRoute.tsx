"use client";

import React, { useEffect } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigation } from "../hooks/useNavigation";
import { UserRole } from "../types/User";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const { goTo } = useNavigation();

  useEffect(() => {
    if (!user) {
      goTo("/login");
    } else if (
      window.location.pathname === "/dashboard" &&
      user.role !== UserRole.ZELADOR
    ) {
      goTo("/"); // Ou redirecione para a home ou dashboard do perfil correto futuramente
    }
  }, [user, goTo]);

  if (!user) {
    return null;
  }

  if (
    window.location.pathname === "/dashboard" &&
    user.role !== UserRole.ZELADOR
  ) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
