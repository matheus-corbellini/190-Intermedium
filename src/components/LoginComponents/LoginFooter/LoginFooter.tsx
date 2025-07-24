import "./LoginFooter.css";
import React from "react";

interface LoginFooterProps {
  onRegisterClick: () => void;
}

const LoginFooter: React.FC<LoginFooterProps> = ({ onRegisterClick }) => (
  <div className="login-footer">
    <p>
      Não tem uma conta?{" "}
      <button type="button" className="link-button" onClick={onRegisterClick}>
        Cadastre-se
      </button>
    </p>
  </div>
);

export default LoginFooter;
