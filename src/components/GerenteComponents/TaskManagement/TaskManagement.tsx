"use client";

import type React from "react";
import { useState } from "react";
import "./TaskManagement.css";
import { mockTaskTemplates } from "../../../data/mockTaskTemplates";
import { mockSetores } from "../../../data/mockSetores";
import type {
  TaskTemplate,
  QuestionTemplate,
} from "../../../types/QuestionTemplate";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaQuestionCircle,
} from "react-icons/fa";

const TaskManagement: React.FC = () => {
  const [taskTemplates, setTaskTemplates] =
    useState<TaskTemplate[]>(mockTaskTemplates);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<TaskTemplate | null>(
    null
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    estimatedDuration: 30,
    priority: "medium" as "low" | "medium" | "high",
    setorId: "",
  });
  const [questions, setQuestions] = useState<QuestionTemplate[]>([]);

  const handleAddTemplate = () => {
    setEditingTemplate(null);
    setFormData({
      title: "",
      description: "",
      estimatedDuration: 30,
      priority: "medium",
      setorId: "",
    });
    setQuestions([]);
    setShowForm(true);
  };

  const handleEditTemplate = (template: TaskTemplate) => {
    setEditingTemplate(template);
    setFormData({
      title: template.title,
      description: template.description,
      estimatedDuration: template.estimatedDuration,
      priority: template.priority,
      setorId: template.setorId,
    });
    setQuestions([...template.questions]);
    setShowForm(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (
      window.confirm("Tem certeza que deseja excluir este modelo de tarefa?")
    ) {
      setTaskTemplates((prev) => prev.filter((t) => t.id !== templateId));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTemplate) {
      // Editar template existente
      setTaskTemplates((prev) =>
        prev.map((t) =>
          t.id === editingTemplate.id
            ? { ...t, ...formData, questions, updatedAt: new Date() }
            : t
        )
      );
    } else {
      // Adicionar novo template
      const newTemplate: TaskTemplate = {
        id: Date.now().toString(),
        ...formData,
        questions,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTaskTemplates((prev) => [...prev, newTemplate]);
    }

    setShowForm(false);
    setFormData({
      title: "",
      description: "",
      estimatedDuration: 30,
      priority: "medium",
      setorId: "",
    });
    setQuestions([]);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setFormData({
      title: "",
      description: "",
      estimatedDuration: 30,
      priority: "medium",
      setorId: "",
    });
    setQuestions([]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "estimatedDuration" ? Number.parseInt(value) : value,
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion: QuestionTemplate = {
      id: Date.now().toString(),
      question: "",
      isEquipment: false,
      equipmentName: "",
      isRequired: true,
      category: "Geral",
    };
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const handleQuestionChange = (
    questionId: string,
    field: string,
    value: string | boolean
  ) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, [field]: value } : q))
    );
  };

  const handleRemoveQuestion = (questionId: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return priority;
    }
  };

  const getSetorName = (setorId: string) => {
    const setor = mockSetores.find((s) => s.id === setorId);
    return setor ? setor.name : "Setor não encontrado";
  };

  return (
    <div className="task-management">
      <div className="task-management-header">
        <h2>Gerenciar Modelos de Tarefas</h2>
        <button className="add-task-button" onClick={handleAddTemplate}>
          <FaPlus />
          Adicionar Modelo
        </button>
      </div>

      <div className="task-templates-list">
        {taskTemplates.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            Nenhum modelo de tarefa cadastrado.
          </div>
        ) : (
          taskTemplates.map((template) => (
            <div key={template.id} className="task-template-card">
              <div className="task-template-header">
                <div className="task-template-info">
                  <h3>{template.title}</h3>
                  <p>{template.description}</p>
                  <div className="task-template-meta">
                    <div className="template-duration">
                      <FaClock style={{ marginRight: 5 }} />
                      {template.estimatedDuration} min
                    </div>
                    <div className={`template-priority ${template.priority}`}>
                      {getPriorityText(template.priority)}
                    </div>
                    <div className="template-questions-count">
                      <FaQuestionCircle style={{ marginRight: 5 }} />
                      {template.questions.length} pergunta(s)
                    </div>
                    <div style={{ color: "#10b981", fontWeight: 600 }}>
                      {getSetorName(template.setorId)}
                    </div>
                  </div>
                </div>
                <div className="task-template-actions">
                  <button
                    className="template-action-button edit-template-button"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="template-action-button delete-template-button"
                    onClick={() => handleDeleteTemplate(template.id)}
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
        <div className="task-form-modal" onClick={handleCancel}>
          <div className="task-form" onClick={(e) => e.stopPropagation()}>
            <h3>
              {editingTemplate
                ? "Editar Modelo de Tarefa"
                : "Adicionar Modelo de Tarefa"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Título da Tarefa</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
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

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="estimatedDuration">
                    Duração Estimada (min)
                  </label>
                  <input
                    type="number"
                    id="estimatedDuration"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="priority">Prioridade</label>
                  <select
                    id="priority"
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="setorId">Setor</label>
                <select
                  id="setorId"
                  name="setorId"
                  value={formData.setorId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione um setor</option>
                  {mockSetores.map((setor) => (
                    <option key={setor.id} value={setor.id}>
                      {setor.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="questions-section">
                <h4>Perguntas do Checklist</h4>
                {questions.map((question) => (
                  <div key={question.id} className="question-item">
                    <div className="question-header">
                      <div className="question-text">
                        {question.question || "Nova pergunta"}
                      </div>
                      <button
                        type="button"
                        className="remove-question-button"
                        onClick={() => handleRemoveQuestion(question.id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="question-form">
                      <input
                        type="text"
                        placeholder="Digite a pergunta"
                        value={question.question}
                        onChange={(e) =>
                          handleQuestionChange(
                            question.id,
                            "question",
                            e.target.value
                          )
                        }
                        required
                      />
                      <div className="question-options">
                        <div className="checkbox-group">
                          <input
                            type="checkbox"
                            id={`equipment-${question.id}`}
                            checked={question.isEquipment}
                            onChange={(e) =>
                              handleQuestionChange(
                                question.id,
                                "isEquipment",
                                e.target.checked
                              )
                            }
                          />
                          <label htmlFor={`equipment-${question.id}`}>
                            É equipamento?
                          </label>
                        </div>
                        {question.isEquipment && (
                          <input
                            type="text"
                            placeholder="Nome do equipamento"
                            value={question.equipmentName || ""}
                            onChange={(e) =>
                              handleQuestionChange(
                                question.id,
                                "equipmentName",
                                e.target.value
                              )
                            }
                          />
                        )}
                        <input
                          type="text"
                          placeholder="Categoria"
                          value={question.category}
                          onChange={(e) =>
                            handleQuestionChange(
                              question.id,
                              "category",
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="add-question-button"
                  onClick={handleAddQuestion}
                >
                  <FaPlus style={{ marginRight: 5 }} />
                  Adicionar Pergunta
                </button>
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
                  {editingTemplate ? "Salvar" : "Adicionar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
