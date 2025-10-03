import React, { useState } from "react";
import {
  FaTimes,
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaBuilding,
  FaExclamationTriangle,
  FaChartLine,
  FaCheckCircle,
  FaFileAlt,
  FaCheck,
  FaUserCheck,
} from "react-icons/fa";
import { taskService } from "../../../../services/TaskService";
import type { Task } from "../../../../types/Task";
import type { Zelador } from "../../../../types/Zelador";
import "./AssignTaskModal.css";

interface AssignTaskModalProps {
  task: Task;
  zeladores: Zelador[];
  onClose: () => void;
  onSuccess: () => void;
}

const AssignTaskModal: React.FC<AssignTaskModalProps> = ({
  task,
  zeladores,
  onClose,
  onSuccess,
}) => {
  const [selectedZelador, setSelectedZelador] = useState<string>("");
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [scheduledTime, setScheduledTime] = useState<string>("");
  const [observations, setObservations] = useState<string>("");
  const [loading, setLoading] = useState(false);

  // Filter zeladores by task setor
  const filteredZeladores = zeladores.filter(
    (zelador) => zelador.setor === task.setor && zelador.isActive
  );

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedZelador) {
      alert("Selecione um zelador para atribuir a tarefa");
      return;
    }

    try {
      setLoading(true);

      // Find zelador email
      const zelador = filteredZeladores.find((z) => z.id === selectedZelador);
      if (!zelador) {
        throw new Error("Zelador não encontrado");
      }

      // Assign task to zelador
      await taskService.assignTask(task.id, zelador.id);

      alert(
        `Tarefa "${task.title}" atribuída com sucesso para ${zelador.name}!`
      );
      onSuccess();
    } catch (error) {
      console.error("Erro ao atribuir tarefa:", error);
      alert("Erro ao atribuir tarefa");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="assign-task-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <h2>
            <FaUserCheck className="header-icon" />
            Atribuir Tarefa
          </h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Task Info */}
        <div className="task-info-section">
          <h3>Informações da Tarefa</h3>
          <div className="task-card">
            <div className="task-header">
              <h4>{task.title}</h4>
              <span className={`priority-badge priority-${task.priority}`}>
                {getPriorityIcon(task.priority)}
                {getPriorityLabel(task.priority)}
              </span>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-meta">
              <span className="task-meta-item">
                <FaBuilding />
                {task.setor}
              </span>
              <span className="task-meta-item">
                <FaClock />
                {task.estimatedDuration} min
              </span>
              <span className="task-meta-item">
                <FaFileAlt />
                {task.checklist.length} itens
              </span>
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleSubmit} className="assignment-form">
          <div className="form-section">
            <h3>Atribuição</h3>

            <div className="form-group">
              <label>
                <FaUser className="label-icon" />
                Zelador Responsável *
              </label>
              {filteredZeladores.length > 0 ? (
                <select
                  value={selectedZelador}
                  onChange={(e) => setSelectedZelador(e.target.value)}
                  required
                >
                  <option value="">Selecione um zelador</option>
                  {filteredZeladores.map((zelador) => (
                    <option key={`zelador-${zelador.id}`} value={zelador.id}>
                      {zelador.name} - {zelador.email}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="no-zeladores">
                  <FaUser className="no-zeladores-icon" />
                  <p>Nenhum zelador ativo disponível para este setor</p>
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>
                  <FaCalendarAlt className="label-icon" />
                  Data de Execução
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="form-group">
                <label>
                  <FaClock className="label-icon" />
                  Horário de Execução
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>
                <FaFileAlt className="label-icon" />
                Observações
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Adicione observações especiais para esta tarefa..."
                rows={3}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || filteredZeladores.length === 0}
            >
              <FaCheck />
              {loading ? "Atribuindo..." : "Atribuir Tarefa"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignTaskModal;
