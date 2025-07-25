import "./Header.css";
import React from "react";

interface LoginHeaderProps {
  title: string;
  subtitle: string;
}

const LoginHeader: React.FC<LoginHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="login-header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
};

export default LoginHeader;
