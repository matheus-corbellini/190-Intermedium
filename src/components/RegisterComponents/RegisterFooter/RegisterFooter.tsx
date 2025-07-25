import React from "react";
import "./RegisterFooter.css";
import Button from "../../Button/Button";

interface RegisterFooterProps {
  onLoginClick: () => void;
}

const RegisterFooter: React.FC<RegisterFooterProps> = ({ onLoginClick }) => {
  return (
    <div className="register-footer">
      <p>Já tem uma conta?</p>
      <Button variant="link" className="link-button" onClick={onLoginClick}>
        Faça login aqui
      </Button>
    </div>
  );
};

export default RegisterFooter;
