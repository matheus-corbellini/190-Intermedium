import "./RegisterCard.css";
import React from "react";

interface RegisterCardProps {
  children: React.ReactNode;
}

const RegisterCard: React.FC<RegisterCardProps> = ({ children }) => (
  <div className="register-card">{children}</div>
);

export default RegisterCard;
