"use client";

import React from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigation } from "../hooks/useNavigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const {user} = useAuth()
    const {goTo} = useNavigation()

    if(!user){
    goTo("/login");
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;