"use client";

import React from "react";
import {
  type Task,
  TaskStatus,
  ChecklistItemStatus,
} from "../../../types/Task";
import {
  FaClock,
  FaUser,
  FaMapMarkerAlt,
  FaCamera,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./GerenteTaskCard.css";

interface GerenteTaskCardProps {
  task: Task;
  onClick: () => void;
}

const GerenteTaskCard: React.FC<GerenteTaskCardProps> = ({ task, onClick }) => {
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

  const getStatusClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "gerente-status-pending";
      case TaskStatus.IN_PROGRESS:
        return "gerente-status-in-progress";
      case TaskStatus.COMPLETED:
        return "gerente-status-completed";
      case TaskStatus.OVERDUE:
        return "gerente-status-overdue";
      default:
        return "gerente-status-pending";
    }
  };

  const getPriorityClass = (priority: string) => {
    return `gerente-priority-${priority.toLowerCase()}`;
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

  const totalPhotos = task.checklist.reduce(
    (acc, item) => acc + (item.photos?.length || 0),
    0
  );

  const issuesCount = task.checklist.filter(
    (item) => item.status === ChecklistItemStatus.NOT_COMPLIANT
  ).length;
  return (
    <div className="gerente-task-card" onClick={onClick}>
      <div className="gerente-task-header">
        <div className="gerente-task-info">
          <h3>
            {task.title}
            <span
              className={`gerente-priority-badge ${getPriorityClass(
                task.priority
              )}`}
            >
              {getPriorityText(task.priority)}
            </span>
          </h3>
          <p>{task.description}</p>
          <div className="gerente-task-meta">
            <div className="gerente-task-setor">
              <FaMapMarkerAlt style={{ marginRight: 5 }} />
              {task.setor}
            </div>
            <div className="gerente-task-assignee">
              <FaUser />
              {task.assignedTo}
            </div>
            <div className="gerente-task-time">
              <FaClock />
              {task.scheduledTime}
            </div>
          </div>
        </div>
        <div className="gerente-task-status">
          <span
            className={`gerente-status-badge ${getStatusClass(task.status)}`}
          >
            {getStatusText(task.status)}
          </span>
        </div>
      </div>

      <div className="gerente-task-progress">
        <div className="gerente-progress-text">
          Progresso: {completedItems}/{task.checklist.length} itens
        </div>
        <div className="gerente-progress-bar">
          <div
            className="gerente-progress-fill"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {(totalPhotos > 0 || issuesCount > 0) && (
        <div className="gerente-task-evidence">
          {totalPhotos > 0 && (
            <div className="gerente-evidence-item gerente-evidence-photos">
              <FaCamera />
              {totalPhotos} foto(s)
            </div>
          )}
          {issuesCount > 0 && (
            <div className="gerente-evidence-item gerente-evidence-issues">
              <FaExclamationTriangle />
              {issuesCount} não conformidade(s)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GerenteTaskCard;
