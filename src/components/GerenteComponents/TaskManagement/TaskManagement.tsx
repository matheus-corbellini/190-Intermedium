"use client";

import type React from "react";
import { useState, useEffect } from "react";
import "./TaskManagement.css";
import { taskTemplateService } from "../../../services/TaskTemplateService";
import { setorService } from "../../../services/SetorService";
import type {
  TaskTemplate,
  QuestionTemplate,
} from "../../../types/QuestionTemplate";
import type { Setor } from "../../../types/Setor";
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaClock,
  FaQuestionCircle,
  FaSpinner,
  FaRedo,
} from "react-icons/fa";

const TaskManagement: React.FC = () => {
  const [taskTemplates, setTaskTemplates] = useState<TaskTemplate[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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

  // Carregar dados dos serviços
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [templatesData, setoresData] = await Promise.all([
        taskTemplateService.getAll(),
        setorService.getAll(),
      ]);
      setTaskTemplates(templatesData);
      setSetores(setoresData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados de gerenciamento de tarefas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);
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

  const handleDeleteTemplate = async (templateId: string) => {
    if (
      window.confirm("Tem certeza que deseja excluir este modelo de tarefa?")
    ) {
      try {
        setLoading(true);
        await taskTemplateService.delete(templateId);
        await loadData();
      } catch (error) {
        console.error("Erro ao deletar template:", error);
        alert("Erro ao deletar template. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (questions.length === 0) {
      alert("Por favor, adicione pelo menos uma pergunta");
      return;
    }

    try {
      setLoading(true);

      if (editingTemplate) {
        // Atualizar template existente
        await taskTemplateService.update(editingTemplate.id, {
          title: formData.title,
          description: formData.description,
          estimatedDuration: formData.estimatedDuration,
          priority: formData.priority,
          setorId: formData.setorId,
          questions: questions,
        });
      } else {
        // Criar novo template
        await taskTemplateService.create({
          title: formData.title,
          description: formData.description,
          estimatedDuration: formData.estimatedDuration,
          priority: formData.priority,
          setorId: formData.setorId,
          questions: questions,
        });
      }

      // Recarregar dados
      await loadData();

      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        estimatedDuration: 30,
        priority: "medium",
        setorId: "",
      });
      setQuestions([]);
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      alert("Erro ao salvar template. Tente novamente.");
    } finally {
      setLoading(false);
    }
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
    const setor = setores.find((s) => s.id === setorId);
    return setor ? setor.name : "Setor não encontrado";
  };

  if (loading && taskTemplates.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
          Carregando modelos de tarefas...
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
    <div className="task-management">
      <div className="task-management-header">
        <h2>Gerenciar Modelos de Tarefas</h2>
        <div className="task-management-actions">
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
          <button className="add-task-button" onClick={handleAddTemplate}>
            <FaPlus />
            Adicionar Modelo
          </button>
        </div>
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
                  {setores.map((setor) => (
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
