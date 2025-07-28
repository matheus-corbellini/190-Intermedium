"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { mockTasks } from "../../data/mockTasks";
import { type Task, TaskStatus } from "../../types/Task";
import TaskCard from "../../components/TaskComponents/TaskCard/TaskCard";
import TaskExecution from "../../components/TaskComponents/TaskExecution/TaskExecution";
import "./ZeladorDashboard.css";

const ZeladorDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const { goTo } = useNavigation();
  const [task, setTask] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user) {
    goTo("/login");
    return null;
  }

  const userTasks = task.filter((task) => task.assignedTo === user.email);

  const stats = {
    pending: userTasks.filter((t) => t.status === TaskStatus.PENDING).length,
    completed: userTasks.filter((t) => t.status === TaskStatus.COMPLETED)
      .length,
    overdue: userTasks.filter((t) => t.status === TaskStatus.OVERDUE).length,
    total: userTasks.length,
  };

  const handleTaskStart = (task: Task) => {
    setSelectedTask(task);
    setTask((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? {
              ...t,
              status: TaskStatus.IN_PROGRESS,
            }
          : t
      )
    );
  };

  const handleTaskComplete = (taskId: string, updateTask: Task) => {
    setTask((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...updateTask,
              status: TaskStatus.COMPLETED,
              completedAt: new Date(),
            }
          : t
      )
    );
    setSelectedTask(null);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
  };

  const handleLogout = () => {
    logout();
    goTo("/login");
  };

  if (selectedTask) {
    return (
      <TaskExecution
        task={selectedTask}
        onComplete={handleTaskComplete}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <div className="zelador-dashboard">
      <button className="logout-button" onClick={handleLogout}>
        Sair
      </button>

      <div className="dashboard-header">
        <h1>Olá, {user.name}!</h1>
        <p>
          Setor: {user.setor} • {currentTime.toLocaleDateString("pt-BR")} •{" "}
          {currentTime.toLocaleTimeString("pt-BR")}
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card stat-pending">
          <div className="stat-number">{stats.pending}</div>
          <div className="stat-label">Pendentes</div>
        </div>
        <div className="stat-card stat-completed">
          <div className="stat-number">{stats.completed}</div>
          <div className="stat-label">Concluídas</div>
        </div>
        <div className="stat-card stat-overdue">
          <div className="stat-number">{stats.overdue}</div>
          <div className="stat-label">Em Atraso</div>
        </div>
        <div className="stat-card stat-total">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">Total</div>
        </div>
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h2>Tarefas do Dia</h2>
          <div className="current-time">
            Atualizado: {currentTime.toLocaleTimeString("pt-BR")}
          </div>
        </div>
        <div className="tasks-list">
          {userTasks.length === 0 ? (
            <div
              style={{ padding: "40px", textAlign: "center", color: "#666" }}
            >
              Nenhuma tarefa encontrada para hoje.
            </div>
          ) : (
            userTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStart={() => handleTaskStart(task)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ZeladorDashboard;
