import React, { useState, useEffect } from "react";
import "./SetorManagement.css";
import type { Setor } from "../../../types/Setor";
import { setorService } from "../../../services/SetorService";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaSpinner,
  FaRedo,
} from "react-icons/fa";

const SetorManagement: React.FC = () => {
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
  });

  // Carregar dados dos serviços
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const setoresData = await setorService.getAll();
      setSetores(setoresData);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
      setError("Erro ao carregar dados de setores");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSetor = () => {
    setEditingSetor(null);
    setFormData({
      name: "",
      description: "",
      location: "",
    });
    setShowForm(true);
  };

  const handleEditSetor = (setor: Setor) => {
    setEditingSetor(setor);
    setFormData({
      name: setor.name,
      description: setor.description,
      location: setor.location,
    });
    setShowForm(true);
  };

  const handleDeleteSetor = async (setorId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este setor?")) {
      try {
        setLoading(true);
        await setorService.delete(setorId);
        await loadData();
      } catch (error) {
        console.error("Erro ao deletar setor:", error);
        alert("Erro ao deletar setor. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || !formData.location) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);

      if (editingSetor) {
        // Atualizar setor existente
        await setorService.update(editingSetor.id, {
          name: formData.name,
          description: formData.description,
          location: formData.location,
        });
      } else {
        // Criar novo setor
        await setorService.create({
          name: formData.name,
          description: formData.description,
          location: formData.location,
        });
      }

      // Recarregar dados
      await loadData();

      setShowForm(false);
      setFormData({
        name: "",
        description: "",
        location: "",
      });
    } catch (error) {
      console.error("Erro ao salvar setor:", error);
      alert("Erro ao salvar setor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSetor(null);
    setFormData({
      name: "",
      description: "",
      location: "",
    });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (loading && setores.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
          Carregando setores...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="setor-management">
      <div className="setor-management-header">
        <h2>Gerenciar Setores</h2>
        <div className="setor-management-actions">
          <button
            className="refresh-button"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? (
              <>
                <FaSpinner className="spinning" />
                Atualizando...
              </>
            ) : (
              <>
                <FaRedo />
                Atualizar
              </>
            )}
          </button>
          <button className="add-setor-button" onClick={handleAddSetor}>
            <FaPlus />
            Adicionar Setor
          </button>
        </div>
      </div>

      <div className="setores-list">
        {setores.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            Nenhum setor cadastrado.
          </div>
        ) : (
          setores.map((setor) => (
            <div key={setor.id} className="setor-card">
              <div className="setor-card-header">
                <div>
                  <h3>{setor.name}</h3>
                  <p>{setor.description}</p>
                  <div className="setor-location">
                    <FaMapMarkerAlt style={{ marginRight: 5 }} />
                    {setor.location}
                  </div>
                </div>
                <div className="setor-actions">
                  <button
                    className="setor-action-button edit-button"
                    onClick={() => handleEditSetor(setor)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="setor-action-button delete-button"
                    onClick={() => handleDeleteSetor(setor.id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showForm && (
        <div className="setor-form-modal" onClick={handleCancel}>
          <div className="setor-form" onClick={(e) => e.stopPropagation()}>
            <h3>{editingSetor ? "Editar Setor" : "Adicionar Setor"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Nome do Setor</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="location">Localização</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="form-button cancel-button"
                  onClick={handleCancel}
                >
                  Cancelar
                </button>
                <button type="submit" className="form-button save-button">
                  {editingSetor ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SetorManagement;
