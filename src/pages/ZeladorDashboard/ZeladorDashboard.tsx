"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { mockTasks } from "../../data/mockTasks";
import { type Task, TaskStatus } from "../../types/Task";
import Sidebar from "../../components/Sidebar/Sidebar";
import TaskCard from "../../components/TaskComponents/TaskCard/TaskCard";
import TaskExecution from "../../components/TaskComponents/TaskExecution/TaskExecution";
import "./ZeladorDashboard.css";

const ZeladorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { goTo } = useNavigation();
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState("dashboard");

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

  const userTasks = tasks.filter((task) => task.assignedTo === user.email);

  const stats = {
    pending: userTasks.filter((t) => t.status === TaskStatus.PENDING).length,
    completed: userTasks.filter((t) => t.status === TaskStatus.COMPLETED)
      .length,
    overdue: userTasks.filter((t) => t.status === TaskStatus.OVERDUE).length,
    total: userTasks.length,
  };

  const handleTaskStart = (task: Task) => {
    setSelectedTask(task);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id ? { ...t, status: TaskStatus.IN_PROGRESS } : t
      )
    );
  };

  const handleTaskComplete = (taskId: string, updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...updatedTask,
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

  const renderDashboardContent = () => {
    return (
      <>
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>
            {currentTime.toLocaleDateString("pt-BR")} •{" "}
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
      </>
    );
  };

  const renderTasksContent = () => {
    const pendingTasks = userTasks.filter(
      (t) => t.status === TaskStatus.PENDING || t.status === TaskStatus.OVERDUE
    );

    return (
      <>
        <div className="dashboard-header">
          <h1>Minhas Tarefas</h1>
          <p>Tarefas pendentes e em atraso</p>
        </div>

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tarefas Pendentes ({pendingTasks.length})</h2>
            <div className="current-time">
              Atualizado: {currentTime.toLocaleTimeString("pt-BR")}
            </div>
          </div>
          <div className="tasks-list">
            {pendingTasks.length === 0 ? (
              <div
                style={{ padding: "40px", textAlign: "center", color: "#666" }}
              >
                Parabéns! Todas as tarefas foram concluídas.
              </div>
            ) : (
              pendingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={() => handleTaskStart(task)}
                />
              ))
            )}
          </div>
        </div>
      </>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "tasks":
        return renderTasksContent();
      case "reports":
        return (
          <div className="section-content">
            <h2>Relatórios</h2>
            <p>Visualize estatísticas e relatórios de desempenho</p>
            <span className="coming-soon">Em breve</span>
          </div>
        );
      case "history":
        return (
          <div className="section-content">
            <h2>Histórico</h2>
            <p>Consulte o histórico de tarefas realizadas</p>
            <span className="coming-soon">Em breve</span>
          </div>
        );
      case "profile":
        return (
          <div className="section-content">
            <h2>Meu Perfil</h2>
            <p>Gerencie suas informações pessoais</p>
            <span className="coming-soon">Em breve</span>
          </div>
        );
      case "settings":
        return (
          <div className="section-content">
            <h2>Configurações</h2>
            <p>Ajuste as configurações do sistema</p>
            <span className="coming-soon">Em breve</span>
          </div>
        );
      default:
        return renderDashboardContent();
    }
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
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="dashboard-main">{renderSectionContent()}</div>
      </div>
    </div>
  );
};

export default ZeladorDashboard;
