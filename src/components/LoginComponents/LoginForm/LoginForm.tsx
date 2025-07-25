import "./LoginForm.css";
import React, { useState } from "react";
import Button from "../../Button/Button";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  error?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading = false,
  error = "",
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      <div className="input-with-icon-login">
        <span className="input-icon">
          <FaEnvelope />
        </span>
        <input
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Email"
          required
        />
      </div>
      <div className="input-with-icon-login">
        <span className="input-icon">
          <FaLock />
        </span>
        <input
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Senha"
          required
        />
        <button
          type="button"
          className="eye-button"
          onClick={() => setShowPassword((v) => !v)}
          tabIndex={-1}
        >
          {showPassword ? <FaEye /> : <FaEyeSlash />}
        </button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Button
        className="login-button"
        loading={loading}
        disabled={loading}
        type="submit"
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
};

export default LoginForm;
