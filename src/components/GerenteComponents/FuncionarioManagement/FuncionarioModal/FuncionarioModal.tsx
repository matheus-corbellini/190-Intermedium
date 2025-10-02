import React, { useState, useEffect } from "react";
import { zeladorService } from "../../../../services/ZeladorService";
import { setorService } from "../../../../services/SetorService";
import type { Zelador } from "../../../../types/Zelador";
import type { Setor } from "../../../../types/Setor";
import {
  FaTimes,
  FaUser,
  FaEnvelope,
  FaLock,
  FaBuilding,
  FaSpinner,
  FaCheck,
} from "react-icons/fa";
import "./FuncionarioModal.css";

interface FuncionarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (zelador: Zelador) => void;
  zelador?: Zelador | null;
}

const FuncionarioModal: React.FC<FuncionarioModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  zelador = null,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    setor: "",
  });
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = !!zelador;

  // Carregar setores ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      loadSetores();
      if (zelador) {
        // Modo edição - preencher formulário
        setFormData({
          name: zelador.name,
          email: zelador.email,
          password: "", // Senha não é mostrada na edição
          setor: zelador.setor || "",
        });
      } else {
        // Modo criação - limpar formulário
        setFormData({
          name: "",
          email: "",
          password: "",
          setor: "",
        });
      }
      setError(null);
      setSuccess(false);
    }
  }, [isOpen, zelador]);

  const loadSetores = async () => {
    try {
      const setoresData = await setorService.getAll();
      setSetores(setoresData);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Limpar erro quando usuário começar a digitar
    if (error) setError(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email é obrigatório");
      return false;
    }
    if (!isEditMode && !formData.password.trim()) {
      setError("Senha é obrigatória");
      return false;
    }
    if (isEditMode && formData.password && formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (!isEditMode && formData.password.length < 6) {
      setError("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    if (!formData.setor) {
      setError("Setor é obrigatório");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      if (isEditMode && zelador) {
        // Modo edição
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          setor: formData.setor,
        };

        // Só incluir senha se foi preenchida
        if (formData.password) {
          updateData.password = formData.password;
        }

        const updatedZelador = await zeladorService.update(
          zelador.id,
          updateData
        );
        setSuccess(true);

        setTimeout(() => {
          onSuccess(updatedZelador);
          onClose();
        }, 1500);
      } else {
        // Modo criação
        const newZelador = await zeladorService.create({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          setor: formData.setor,
        });
        setSuccess(true);

        setTimeout(() => {
          onSuccess(newZelador);
          onClose();
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao salvar funcionário:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao salvar funcionário"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="funcionario-modal-overlay" onClick={handleClose}>
      <div className="funcionario-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="funcionario-modal-header">
          <h2>
            {isEditMode ? (
              <>
                <FaUser />
                Editar Funcionário
              </>
            ) : (
              <>
                <FaUser />
                Novo Funcionário
              </>
            )}
          </h2>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="funcionario-form">
          {/* Nome */}
          <div className="form-group">
            <label htmlFor="name">
              <FaUser />
              Nome Completo *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Digite o nome completo"
              disabled={loading}
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope />
              Email *
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Digite o email"
              disabled={loading}
              required
            />
          </div>

          {/* Senha */}
          <div className="form-group">
            <label htmlFor="password">
              <FaLock />
              Senha {isEditMode ? "(deixe em branco para manter a atual)" : "*"}
            </label>
            <input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              placeholder={
                isEditMode ? "Digite nova senha (opcional)" : "Digite a senha"
              }
              disabled={loading}
              required={!isEditMode}
              minLength={6}
            />
          </div>

          {/* Setor */}
          <div className="form-group">
            <label htmlFor="setor">
              <FaBuilding />
              Setor *
            </label>
            <select
              id="setor"
              value={formData.setor}
              onChange={(e) => handleInputChange("setor", e.target.value)}
              disabled={loading}
              required
            >
              <option value="">Selecione um setor</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.name}>
                  {setor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Message */}
          {error && (
            <div className="form-error">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="form-success">
              <FaCheck className="success-icon" />
              {isEditMode
                ? "Funcionário atualizado com sucesso!"
                : "Funcionário criado com sucesso!"}
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button type="submit" className="save-button" disabled={loading}>
              {loading ? (
                <>
                  <FaSpinner className="spinning" />
                  {isEditMode ? "Atualizando..." : "Criando..."}
                </>
              ) : (
                <>
                  <FaCheck />
                  {isEditMode ? "Atualizar" : "Criar"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FuncionarioModal;
