import React, { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigation } from "../hooks/useNavigation";
import { UserRole } from "../types/User";

import RegisterCard from "../components/RegisterComponents/RegisterCard/RegisterCard";
import Header from "../components/Header/Header";
import RegisterForm from "../components/RegisterComponents/RegisterForm/RegisterForm";
import RegisterFooter from "../components/RegisterComponents/RegisterFooter/RegisterFooter";

import "../components/RegisterComponents/Register.css";

const setores = [
  "Terminal 1",
  "Terminal 2",
  "Terminal 3",
  "Área de Embarque",
  "Área de Desembarque",
  "Estacionamento",
  "Área Administrativa",
  "Pista de Pouso",
];

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: UserRole.ZELADOR,
    setor: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const { goTo } = useNavigation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
      setLoading(false);
      return;
    }

    try {
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
        setor: formData.setor,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      login(newUser);
      goTo("/");
    } catch (error) {
      setError("Erro ao criar usuário. Tente novamente.");
      console.error("Erro ao criar usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToLogin = () => {
    goTo("/login");
  };

  return (
    <div className="register-container">
      <RegisterCard>
        <Header
          title="Criar conta"
          subtitle="Sistema de Limpeza - Aeroporto Internacional"
        />
        <RegisterForm
          name={formData.name}
          email={formData.email}
          password={formData.password}
          confirmPassword={formData.confirmPassword}
          role={formData.role}
          setor={formData.setor}
          setores={setores}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          onGoToLogin={handleGoToLogin}
        />
        <RegisterFooter onLoginClick={handleGoToLogin} />
      </RegisterCard>
    </div>
  );
};

export default Register;
