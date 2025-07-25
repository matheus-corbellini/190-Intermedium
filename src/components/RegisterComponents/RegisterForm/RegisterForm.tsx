import "./RegisterForm.css";
import React, { useState } from "react";
import Button from "../../Button/Button";
import {
  FaBroom,
  FaUserTie,
  FaUserShield,
  FaBuilding,
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Select from "react-select";

interface RegisterFooterProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  setor: string;
  setores: string[];
  onChange: (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
      | { target: { name: string; value: string } }
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string;
}

const roleOptions = [
  {
    value: "zelador",
    label: (
      <span>
        <FaBroom style={{ marginRight: 8 }} />
        Zelador
      </span>
    ),
  },
  {
    value: "gerente",
    label: (
      <span>
        <FaUserTie style={{ marginRight: 8 }} />
        Gerente
      </span>
    ),
  },
  {
    value: "admin",
    label: (
      <span>
        <FaUserShield style={{ marginRight: 8 }} />
        Administrador
      </span>
    ),
  },
];

const getSetorOptions = (setores: string[]) =>
  setores.map((setor) => ({
    value: setor,
    label: (
      <span>
        <FaBuilding style={{ marginRight: 8 }} />
        {setor}
      </span>
    ),
  }));

const customStyles = {
  control: (provided: any) => ({
    ...provided,
    borderRadius: 8,
    borderColor: "#e1e5e9",
    boxShadow: "none",
    minHeight: 48,
    fontSize: 16,
    background: "#f8f9fa",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
    fontSize: 16,
    backgroundColor: state.isSelected ? "#667eea22" : "white",
    color: "#333",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    display: "flex",
    alignItems: "center",
  }),
};

const RegisterForm: React.FC<RegisterFooterProps> = ({
  name,
  email,
  password,
  confirmPassword,
  role,
  setor,
  setores,
  onChange,
  onSubmit,
  loading,
  error,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <form className="register-form" onSubmit={onSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">Nome Completo</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <FaUser />
            </span>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              placeholder="Digite seu nome completo"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <FaEnvelope />
            </span>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="seu.email@exemplo.com"
              required
            />
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group half">
          <label htmlFor="role">Função</label>
          <Select
            inputId="role"
            name="role"
            options={roleOptions}
            value={roleOptions.find((option) => option.value === role) || null}
            onChange={(option) =>
              onChange({
                target: {
                  name: "role",
                  value: option ? (option as any).value : "",
                },
              })
            }
            styles={customStyles}
            isSearchable={false}
            placeholder="Selecione a função"
          />
        </div>

        <div className="form-group half">
          <label htmlFor="setor">Setor</label>
          <Select
            inputId="setor"
            name="setor"
            options={getSetorOptions(setores)}
            value={
              getSetorOptions(setores).find(
                (option) => option.value === setor
              ) || null
            }
            onChange={(option) =>
              onChange({
                target: {
                  name: "setor",
                  value: option ? (option as any).value : "",
                },
              })
            }
            styles={customStyles}
            isSearchable={false}
            placeholder="Selecione um setor"
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              placeholder="Minimo de 6 caracteres"
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
        </div>
        <div className="form-group half">
          <label htmlFor="confirmPassword">Confirmar Senha</label>
          <div className="input-with-icon">
            <span className="input-icon">
              <FaLock />
            </span>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={onChange}
              placeholder="Confirme sua senha"
              required
            />
            <button
              type="button"
              className="eye-button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Button loading={loading} disabled={loading} type="submit">
        {loading ? "Criando conta..." : "Criar conta"}
      </Button>
    </form>
  );
};

export default RegisterForm;
