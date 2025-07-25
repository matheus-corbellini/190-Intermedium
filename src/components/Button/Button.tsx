import React from "react";
import "./Button.css";

interface ButtonProps {
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "link";
}

const Button: React.FC<ButtonProps> = ({
  loading = false,
  disabled = false,
  type = "button",
  children,
  onClick,
  className = "",
  variant = "default",
}) => (
  <button
    className={
      variant === "link" ? `link-button ${className}` : `button ${className}`
    }
    type={type}
    disabled={disabled || loading}
    onClick={onClick}
  >
    {loading ? "Loading..." : children}
  </button>
);

export default Button;
