import React, { useState } from "react";
import {
  FaTimes,
  FaSave,
  FaFileAlt,
  FaBuilding,
  FaClock,
  FaExclamationTriangle,
  FaChartLine,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import { taskService } from "../../../../services/TaskService";
import type { TaskTemplate } from "../../../../types/QuestionTemplate";
import type { Setor } from "../../../../types/Setor";
import type { CreateTaskData } from "../../../../types/Task";
import { ChecklistItemStatus } from "../../../../types/Task";
import "./CreateTaskModal.css";

interface CreateTaskModalProps {
  onClose: () => void;
  onSuccess: () => void;
  setores: Setor[];
  templates: TaskTemplate[];
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  onClose,
  onSuccess,
  setores,
  templates,
}) => {
  const [step, setStep] = useState<"template" | "details">("template");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<CreateTaskData>({
    title: "",
    description: "",
    setor: "",
    scheduledTime: "",
    estimatedDuration: 30,
    priority: "medium",
    checklist: [],
  });

  const filteredTemplates = templates.filter(
    (template) => !formData.setor || template.setorId === formData.setor
  );

  const handleTemplateSelect = (template: TaskTemplate) => {
    setFormData((prev) => ({
      ...prev,
      title: template.title,
      description: template.description,
      estimatedDuration: template.estimatedDuration,
      priority: template.priority,
      setor: template.setorId,
      checklist: template.questions.map((q) => ({
        question: q.question,
        status: ChecklistItemStatus.PENDING,
        isEquipment: q.isEquipment,
        equipmentName: q.equipmentName,
      })),
    }));
    setStep("details");
  };

  const handleCreateManual = () => {
    setFormData((prev) => ({
      ...prev,
      title: "",
      description: "",
      checklist: [],
    }));
    setStep("details");
  };

  const handleInputChange = (
    field: keyof CreateTaskData,
    value: string | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.setor) {
      alert("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    try {
      setLoading(true);
      await taskService.create(formData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erro ao criar tarefa:", error);
      alert("Erro ao criar tarefa. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <FaExclamationTriangle className="priority-icon high" />;
      case "medium":
        return <FaChartLine className="priority-icon medium" />;
      case "low":
        return <FaCheckCircle className="priority-icon low" />;
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="create-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <FaFileAlt className="header-icon" />
            Criar Nova Tarefa
          </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="step-indicator">
          <div className={`step ${step === "template" ? "active" : ""}`}>
            <span className="step-number">1</span>
            <span className="step-label">Template</span>
          </div>
          <div className="step-line"></div>
          <div className={`step ${step === "details" ? "active" : ""}`}>
            <span className="step-number">2</span>
            <span className="step-label">Detalhes</span>
          </div>
        </div>

        <div className="modal-content">
          {step === "template" && (
            <div className="templates-section">
              <div className="templates-header">
                <h3>Selecione um template</h3>
                <p>
                  Escolha um template existente ou crie uma nova tarefa
                  manualmente
                </p>
              </div>

              <div className="manual-creation">
                <button
                  type="button"
                  className="btn-manual"
                  onClick={handleCreateManual}
                >
                  <FaFileAlt />
                  Criar Tarefa Manual
                </button>
              </div>

              {filteredTemplates.length > 0 && (
                <div className="templates-section">
                  <h4>Templates disponíveis</h4>
                  <div className="templates-grid">
                    {filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="template-card"
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <div className="template-header">
                          <h5>{template.title}</h5>
                          <span
                            className={`priority-badge priority-${template.priority}`}
                          >
                            {getPriorityIcon(template.priority)}
                            {getPriorityLabel(template.priority)}
                          </span>
                        </div>
                        <p className="template-description">
                          {template.description}
                        </p>
                        <div className="template-meta">
                          <span className="template-duration">
                            <FaClock />
                            {template.estimatedDuration} min
                          </span>
                          <span className="template-questions">
                            <FaInfoCircle />
                            {template.questions.length} itens
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {filteredTemplates.length === 0 && (
                <div className="no-templates">
                  <FaInfoCircle className="no-templates-icon" />
                  <p>Nenhum template disponível para o setor selecionado</p>
                </div>
              )}
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit} className="task-details-form">
              <div className="form-section">
                <h3>Detalhes da Tarefa</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FaFileAlt className="label-icon" />
                      Titulo *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Digite o titulo da tarefa"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaBuilding className="label-icon" />
                      Setor *
                    </label>
                    <select
                      value={formData.setor}
                      onChange={(e) =>
                        handleInputChange("setor", e.target.value)
                      }
                      required
                    >
                      <option value="">Selecione um setor</option>
                      {setores.map((setor) => (
                        <option
                          key={`setor-create-${setor.id}`}
                          value={setor.name}
                        >
                          {setor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FaInfoCircle className="label-icon" />
                    Descrição
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Descreva os detalhes da tarefa"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>
                      <FaClock className="label-icon" />
                      Duração Estimada (min)
                    </label>
                    <input
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) =>
                        handleInputChange(
                          "estimatedDuration",
                          parseInt(e.target.value) || 30
                        )
                      }
                      min="1"
                      max="480"
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      <FaClock className="label-icon" />
                      Horário Agendado
                    </label>
                    <input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) =>
                        handleInputChange("scheduledTime", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <FaExclamationTriangle className="label-icon" />
                    Prioridade
                  </label>
                  <div className="priority-options">
                    {["low", "medium", "high"].map((priority) => (
                      <label key={priority} className="priority-option">
                        <input
                          type="radio"
                          name="priority"
                          value={priority}
                          checked={formData.priority === priority}
                          onChange={(e) =>
                            handleInputChange("priority", e.target.value)
                          }
                        />
                        <span className={`priority-radio priority-${priority}`}>
                          {getPriorityIcon(priority)}
                          {getPriorityLabel(priority)}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label>
                    <FaInfoCircle className="label-icon" />
                    Checklist ({formData.checklist.length} itens)
                  </label>
                  {formData.checklist.length > 0 ? (
                    <div className="checklist-preview">
                      {formData.checklist.map((item, index) => (
                        <div key={index} className="checklist-item">
                          <FaCheckCircle className="checklist-icon" />
                          <span>{item.question}</span>
                          {item.isEquipment && (
                            <span className="equipment-badge">
                              <FaInfoCircle />
                              Equipamento
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-checklist">
                      <FaInfoCircle className="no-checklist-icon" />
                      <p>
                        Nenhum item no checklist. Crie uma tarefa manual ou
                        selecione um template.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setStep("template")}
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  <FaSave />
                  {loading ? "Criando..." : "Criar Tarefa"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;
