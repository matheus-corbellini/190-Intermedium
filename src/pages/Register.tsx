import React, { useState } from "react";
import { useAuth } from "../hooks/UseAuth";
import { useNavigation } from "../hooks/useNavigation";
import { UserRole } from "../types/User";
import { Footer } from "borderless";

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
    role: "", // começa vazio, usuário escolhe
    setor: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { register } = useAuth();
  const { goTo } = useNavigation();

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
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

    if (!formData.role) {
      setError("Selecione o perfil");
      setLoading(false);
      return;
    }

    try {
      // Converte o valor do select para o enum correto
      const userData = {
        name: formData.name,
        email: formData.email,
        role: formData.role as UserRole, // garante que é do tipo enum
        setor: formData.setor,
      };

      await register(formData.email, formData.password, userData);

      // Redireciona só se for zelador
      if (userData.role === UserRole.ZELADOR) {
        goTo("/dashboard");
      } else if (userData.role === UserRole.GERENTE) {
        goTo("/gerente-dashboard");
      } else {
        // Futuro: redirecionar para outras áreas
        goTo("/");
      }
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
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <div className="register-container">
        <RegisterCard>
          <Header
            title="Criar Conta"
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
          />
          <RegisterFooter onLoginClick={handleGoToLogin} />
        </RegisterCard>
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
        <Footer
          theme="light"
          backgroundColor="transparent"
          useGradient={false}
        />
      </div>
    </div>
  );
};

export default Register;
