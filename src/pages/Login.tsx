import React, { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigation } from "../hooks/useNavigation";
import { UserRole } from "../types/User";

import LoginCard from "../components/LoginComponents/LoginCard/LoginCard";
import Header from "../components/Header/Header";
import LoginForm from "../components/LoginComponents/LoginForm/LoginForm";
import ErrorMessage from "../components/LoginComponents/ErrorMessage/ErrorMessage";
import LoginFooter from "../components/LoginComponents/LoginFooter/LoginFooter";
import DemoAccounts from "../components/LoginComponents/DemoAccounts/DemoAccounts";
import Button from "../components/Button/Button";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const { goTo } = useNavigation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (email && password) {
        const mockUser = {
          id: "1",
          name: email.split("@")[0],
          email,
          role: email.includes("admin")
            ? UserRole.ADMIN
            : email.includes("gerente")
            ? UserRole.GERENTE
            : UserRole.ZELADOR,
          setor: "Terminal 1",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        login(mockUser);
        goTo("/");
      } else {
        setError("Por favor, preencha todos os campos");
      }
    } catch (error) {
      setError("Erro ao fazer login" + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginCard>
      <Header
        title="Sistema de limpeza e manutenção"
        subtitle="Aeroporto Internacional"
      />
      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
      <LoginFooter onRegisterClick={() => goTo("/register")} />
      <DemoAccounts />
    </LoginCard>
  );
};

export default Login;
