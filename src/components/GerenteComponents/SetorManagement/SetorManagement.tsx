import React, { useState } from "react";
import "./SetorManagement.css";
import type { Setor } from "../../../types/Setor";
import { mockSetores } from "../../../data/mockSetores";
import { FaPlus, FaEdit, FaTrash, FaMapMarkerAlt } from "react-icons/fa";

const SetorManagement: React.FC = () => {
  const [setores, setSetores] = useState<Setor[]>(mockSetores);
  const [showForm, setShowForm] = useState(false);
  const [editingSetor, setEditingSetor] = useState<Setor | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
  });

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

  const handleDeleteSetor = (setorId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este setor?")) {
      setSetores((prev) => prev.filter((s) => s.id !== setorId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingSetor) {
      setSetores((prev) =>
        prev.map((s) =>
          s.id === editingSetor.id
            ? { ...s, ...formData, updatedAt: new Date() }
            : s
        )
      );
    } else {
      const newSetor: Setor = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSetores((prev) => [...prev, newSetor]);
    }
    setShowForm(false);
    setFormData({
      name: "",
      description: "",
      location: "",
    });
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

  return (
    <div className="setor-management">
      <div className="setor-management-header">
        <h2>Gerenciar Setores</h2>
        <button className="add-setor-button" onClick={handleAddSetor}>
          <FaPlus />
          Adicionar Setor
        </button>
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
