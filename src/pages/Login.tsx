import React, { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigation } from "../hooks/useNavigation";
import { UserRole } from "../types/User";

import LoginCard from "../components/LoginComponents/LoginCard/LoginCard";
import Header from "../components/Header/Header";
import LoginForm from "../components/LoginComponents/LoginForm/LoginForm";
import LoginFooter from "../components/LoginComponents/LoginFooter/LoginFooter";

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
      const user = await login(email, password);

      // Redireciona para o dashboard correto conforme o perfil
      if (user.role === UserRole.ZELADOR) {
        goTo("/dashboard");
      } else if (user.role === UserRole.ADMIN) {
        // Futuro: goTo("/admin-dashboard");
        setError("Área de admin em desenvolvimento. Fale com o suporte.");
      } else if (user.role === UserRole.GERENTE) {
        goTo("/gerente-dashboard");
      } else {
        setError("Perfil não reconhecido. Fale com o suporte.");
      }
    } catch (error) {
      setError("Erro ao fazer login: " + error);
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
    </LoginCard>
  );
};

export default Login;
