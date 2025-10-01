"use client";

import React from "react";
import "./TaskDetailsModal.css";
import {
  type Task,
  TaskStatus,
  ChecklistItemStatus,
} from "../../../types/Task";
import {
  FaTimes,
  FaCheck,
  FaTimes as FaX,
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaCamera,
  FaWrench,
  FaClipboardList,
} from "react-icons/fa";

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
}

const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
}) => {
  // Função auxiliar para converter Timestamp para string formatada
  const formatTimestamp = (timestamp: unknown): string => {
    if (typeof timestamp === "object" && timestamp && "toDate" in timestamp) {
      const date = (timestamp as { toDate: () => Date }).toDate();
      return (
        date.toLocaleDateString("pt-BR") +
        " às " +
        date.toLocaleTimeString("pt-BR")
      );
    } else if (typeof timestamp === "string") {
      return timestamp;
    } else {
      const date = new Date(timestamp as string | number | Date);
      return (
        date.toLocaleDateString("pt-BR") +
        " às " +
        date.toLocaleTimeString("pt-BR")
      );
    }
  };
  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "Pendente";
      case TaskStatus.IN_PROGRESS:
        return "Em Andamento";
      case TaskStatus.COMPLETED:
        return "Concluída";
      case TaskStatus.OVERDUE:
        return "Em Atraso";
      default:
        return status;
    }
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

  const getStatusIcon = (status: ChecklistItemStatus) => {
    switch (status) {
      case ChecklistItemStatus.OK:
        return <FaCheck />;
      case ChecklistItemStatus.NOT_COMPLIANT:
        return <FaX />;
      default:
        return "?";
    }
  };

  const getStatusClass = (status: ChecklistItemStatus) => {
    switch (status) {
      case ChecklistItemStatus.OK:
        return "status-ok";
      case ChecklistItemStatus.NOT_COMPLIANT:
        return "status-not-compliant";
      default:
        return "status-pending";
    }
  };

  const getStatusText2 = (status: ChecklistItemStatus) => {
    switch (status) {
      case ChecklistItemStatus.OK:
        return "OK";
      case ChecklistItemStatus.NOT_COMPLIANT:
        return "Não Conforme";
      default:
        return "Pendente";
    }
  };

  return (
    <div className="task-details-overlay" onClick={onClose}>
      <div className="task-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Detalhes da Tarefa</h2>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content">
          <div className="task-details-info">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
          </div>

          <div className="task-meta-grid">
            <div className="meta-item">
              <div className="meta-label">Status</div>
              <div className="meta-value">{getStatusText(task.status)}</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Setor</div>
              <div className="meta-value">
                <FaMapMarkerAlt style={{ marginRight: 5 }} />
                {task.setor}
              </div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Responsável</div>
              <div className="meta-value">
                <FaUser style={{ marginRight: 5 }} />
                {task.assignedTo}
              </div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Horário</div>
              <div className="meta-value">
                <FaClock style={{ marginRight: 5 }} />
                {formatTimestamp(task.scheduledTime)}
              </div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Duração Estimada</div>
              <div className="meta-value">{task.estimatedDuration} min</div>
            </div>
            <div className="meta-item">
              <div className="meta-label">Prioridade</div>
              <div className="meta-value">{getPriorityText(task.priority)}</div>
            </div>
          </div>

          {task.status === TaskStatus.COMPLETED && task.completedAt && (
            <div className="completion-info">
              <h4>Informações de Conclusão</h4>
              <div className="completion-details">
                <div className="completion-item">
                  <strong>Concluída em:</strong>{" "}
                  {formatTimestamp(task.completedAt)}
                </div>
              </div>
            </div>
          )}

          <div className="checklist-section">
            <h4>
              <FaClipboardList />
              Checklist ({task.checklist.length} itens)
            </h4>
            {task.checklist.map((item) => (
              <div key={item.id} className="checklist-item-detail">
                <div className="item-question">
                  {item.question}
                  {item.isEquipment && (
                    <span className="equipment-badge">
                      <FaWrench style={{ marginRight: 4 }} />
                      {item.equipmentName}
                    </span>
                  )}
                </div>
                <div className="item-status-detail">
                  <div className={`status-icon ${getStatusClass(item.status)}`}>
                    {getStatusIcon(item.status)}
                  </div>
                  <span>{getStatusText2(item.status)}</span>
                </div>
                {item.observation && (
                  <div className="item-observation">
                    <strong>Observação:</strong> {item.observation}
                  </div>
                )}
                {item.photos && item.photos.length > 0 && (
                  <div className="item-photos">
                    <strong>
                      <FaCamera style={{ marginRight: 5 }} />
                      Fotos ({item.photos.length}):
                    </strong>
                    <div className="photos-grid">
                      {item.photos.map((photo, index) => (
                        <div key={photo} className="photo-placeholder">
                          Foto {index + 1}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal;
