"use client";

import React from "react";
import "./TaskExecution.css";
import {
  type Task,
  type ChecklistItem,
  ChecklistItemStatus,
} from "../../../types/Task";
import ChecklistItemComponent from "../ChecklistItem/ChecklistItem";
import { FaArrowLeft } from "react-icons/fa";
import { useState } from "react";

interface TaskExecutionProps {
  task: Task;
  onComplete: (taskId: string, updatedTask: Task) => void;
  onBack: () => void;
}

const TaskExecution: React.FC<TaskExecutionProps> = ({
  task,
  onComplete,
  onBack,
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>(task.checklist);
  const [password, setPassword] = useState("");

  const handleItemUpdate = (itemId: string, updatedItem: ChecklistItem) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === itemId ? updatedItem : item))
    );
  };

  const completedItems = checklist.filter(
    (item) =>
      item.status === ChecklistItemStatus.OK ||
      item.status === ChecklistItemStatus.NOT_COMPLIANT
  ).length;

  const allItemsCompleted = completedItems === checklist.length;
  const canFinish = allItemsCompleted && password.length > 0;

  const handleFinish = () => {
    if (canFinish) {
      const updatedTask = {
        ...task,
        checklist: checklist,
      };
      onComplete(task.id, updatedTask);
    }
  };

  return (
    <div className="task-execution">
      <div className="execution-header">
        <div className="execution-info">
          <h1>{task.title}</h1>
          <p>
            {task.description} • {task.setor}
          </p>
        </div>
        <button className="back-button" onClick={onBack}>
          <FaArrowLeft />
          Voltar
        </button>
      </div>

      <div className="checklist-container">
        <div className="checklist-header">
          <h2>Checklist</h2>
          <div className="progress-info">
            {completedItems}/{checklist.length} concluídos
          </div>
        </div>
        <div className="checklist-items">
          {checklist.map((item) => (
            <ChecklistItemComponent
              key={item.id}
              item={item}
              onUpdate={(updatedItem) => handleItemUpdate(item.id, updatedItem)}
            />
          ))}
        </div>
      </div>

      {allItemsCompleted && (
        <div className="finish-section">
          <h3>Finalizar Tarefa</h3>
          <input
            type="password"
            className="password-input"
            placeholder="Digite sua senha para confirmar"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="finish-button"
            onClick={handleFinish}
            disabled={!canFinish}
          >
            Finalizar Tarefa
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskExecution;
