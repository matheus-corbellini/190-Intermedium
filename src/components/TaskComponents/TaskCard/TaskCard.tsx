"use client";

import React from "react";
import "./TaskCard.css";
import {
  type Task,
  TaskStatus,
  ChecklistItemStatus,
} from "../../../types/Task";
import { FaClock, FaHourglass, FaMapMarkerAlt } from "react-icons/fa";

interface TaskCardProps {
  task: Task;
  onStart: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onStart }) => {
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
        return "Em atraso";
      default:
        return status;
    }
  };

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "status-pending";
      case TaskStatus.IN_PROGRESS:
        return "status-in-progress";
      case TaskStatus.COMPLETED:
        return "status-completed";
      case TaskStatus.OVERDUE:
        return "status-overdue";
      default:
        return "status-pending";
    }
  };

  const getPriorityClass = (priority: string) => {
    return `priority-${priority.toLowerCase()}`;
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

  const completedItems = task.checklist.filter(
    (item) =>
      item.status === ChecklistItemStatus.OK ||
      item.status === ChecklistItemStatus.NOT_COMPLIANT
  ).length;

  const progressPercentage =
    task.checklist.length > 0
      ? (completedItems / task.checklist.length) * 100
      : 0;

  const canStart =
    task.status === TaskStatus.PENDING || task.status === TaskStatus.OVERDUE;

  return (
    <div className="task-card">
      <div className="task-header">
        <div className="task-info">
          <h3>
            {task.title}
            <span
              className={`priority-badge ${getPriorityClass(task.priority)}`}
            >
              {getPriorityText(task.priority)}
            </span>
          </h3>
          <p>{task.description}</p>
          <div className="task-meta">
            <div className="task-setor">
              <FaMapMarkerAlt style={{ marginRight: 5 }} />
              {task.setor}
            </div>
            <div className="task-time">
              <FaClock />
              {formatTimestamp(task.scheduledTime)}
            </div>
            <div className="task-duration">
              <FaHourglass />
              {task.estimatedDuration}min
            </div>
          </div>
        </div>
        <div className="task-status">
          <span className={`status-badge ${getStatusClass(task.status)}`}>
            {getStatusText(task.status)}
          </span>
        </div>
      </div>

      {task.status !== TaskStatus.COMPLETED && (
        <div className="checklist-progress">
          Progresso: {completedItems}/{task.checklist.length} itens
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {canStart && (
        <div className="task-actions">
          <button className="start-button" onClick={onStart}>
            {task.status === TaskStatus.OVERDUE
              ? "Iniciar (Atrasada)"
              : "Iniciar Tarefa"}
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
