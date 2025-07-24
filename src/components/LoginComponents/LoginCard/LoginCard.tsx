import React from "react";
import "./LoginCard.css";

interface LoginCardProps {
  children: React.ReactNode;
}

const LoginCard: React.FC<LoginCardProps> = ({ children }) => {
  return (
    <div className="login-container">
      <div className="login-card">{children}</div>
    </div>
  );
};

export default LoginCard;
