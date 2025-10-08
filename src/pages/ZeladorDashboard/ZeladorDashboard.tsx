"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { taskService } from "../../services/TaskService";
import { type Task, TaskStatus } from "../../types/Task";
import { UserRole } from "../../types/User";
import Sidebar from "../../components/Sidebar/Sidebar";
import TaskCard from "../../components/TaskComponents/TaskCard/TaskCard";
import TaskExecution from "../../components/TaskComponents/TaskExecution/TaskExecution";
import {
  FaSpinner,
  FaRedo,
  FaTasks,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import OwnTasks from "./OwnTasks/OwnTasks";
import TaskHistory from "./TaskHistory/TaskHistory";
import "./ZeladorDashboard.css";

const ZeladorDashboard: React.FC = () => {
  const { user } = useAuth();
  const { goTo } = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState("dashboard");

  // Carregar dados dos serviços
  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getByZelador(user.email);
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setError("Erro ao carregar suas tarefas");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!user || user.role !== UserRole.ZELADOR) {
    goTo("/login");
    return null;
  }

  const stats = {
    pending: tasks.filter((t) => t.status === TaskStatus.PENDING).length,
    completed: tasks.filter((t) => t.status === TaskStatus.COMPLETED).length,
    overdue: tasks.filter((t) => t.status === TaskStatus.OVERDUE).length,
    total: tasks.length,
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleTaskStart = async (task: Task) => {
    try {
      await taskService.markAsInProgress(task.id);
      await loadData(); // Recarregar dados
      setSelectedTask(task); // Abrir a tarefa para execução
    } catch (error) {
      console.error("Erro ao iniciar tarefa:", error);
      alert("Erro ao iniciar tarefa. Tente novamente.");
    }
  };

  const handleTaskComplete = async (taskId: string) => {
    try {
      await taskService.markAsCompleted(taskId);
      await loadData(); // Recarregar dados
      setSelectedTask(null);
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
      alert("Erro ao completar tarefa. Tente novamente.");
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTaskCompleteWrapper = (taskId: string, _updatedTask: Task) => {
    handleTaskComplete(taskId);
  };

  const handleBackToList = () => {
    setSelectedTask(null);
  };

  const renderDashboardContent = () => {
    if (loading && tasks.length === 0) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSpinner className="spinning" />
            Carregando suas tarefas...
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

    const inProgressTasks = tasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS
    );
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING);
    const overdueTasks = tasks.filter((t) => t.status === TaskStatus.OVERDUE);

    return (
      <>
        <div className="dashboard-header-modern">
          <div className="header-content">
            <div className="header-title">
              <FaTasks className="header-icon" />
              <div>
                <h1>Dashboard</h1>
                <p className="header-subtitle">
                  Bem-vindo de volta, {user?.name}!
                </p>
              </div>
            </div>
            <div className="header-actions">
              <div className="current-datetime">
                <p className="date">
                  {currentTime.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                  })}
                </p>
                <p className="time">
                  {currentTime.toLocaleTimeString("pt-BR")}
                </p>
              </div>
              <button
                className="refresh-button-modern"
                onClick={loadData}
                disabled={loading}
              >
                <FaRedo className={loading ? "spinning" : ""} />
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>
        </div>

        <div className="dashboard-stats-modern">
          <div className="stat-card-modern stat-pending">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.pending}</div>
              <div className="stat-label">Pendentes</div>
            </div>
          </div>
          <div className="stat-card-modern stat-in-progress">
            <div className="stat-icon">
              <FaSpinner />
            </div>
            <div className="stat-content">
              <div className="stat-number">
                {
                  tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS)
                    .length
                }
              </div>
              <div className="stat-label">Em Andamento</div>
            </div>
          </div>
          <div className="stat-card-modern stat-completed">
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.completed}</div>
              <div className="stat-label">Concluídas</div>
            </div>
          </div>
          <div className="stat-card-modern stat-overdue">
            <div className="stat-icon">
              <FaExclamationTriangle />
            </div>
            <div className="stat-content">
              <div className="stat-number">{stats.overdue}</div>
              <div className="stat-label">Em Atraso</div>
            </div>
          </div>
        </div>

        {/* Tarefas em Andamento */}
        {inProgressTasks.length > 0 && (
          <div className="tasks-section-modern">
            <div className="section-header">
              <h2>
                <FaSpinner /> Tarefas em Andamento
              </h2>
              <span className="task-count">{inProgressTasks.length}</span>
            </div>
            <div className="tasks-grid">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card-modern in-progress"
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCard task={task} onStart={() => handleTaskStart(task)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarefas em Atraso */}
        {overdueTasks.length > 0 && (
          <div className="tasks-section-modern">
            <div className="section-header">
              <h2>
                <FaExclamationTriangle /> Tarefas em Atraso
              </h2>
              <span className="task-count urgent">{overdueTasks.length}</span>
            </div>
            <div className="tasks-grid">
              {overdueTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card-modern overdue"
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCard task={task} onStart={() => handleTaskStart(task)} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarefas Pendentes */}
        <div className="tasks-section-modern">
          <div className="section-header">
            <h2>
              <FaClock /> Tarefas Pendentes
            </h2>
            <span className="task-count">{pendingTasks.length}</span>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="empty-state">
              <FaCheckCircle className="empty-icon" />
              <h3>Nenhuma tarefa pendente</h3>
              <p>Parabéns! Você está em dia com suas tarefas.</p>
            </div>
          ) : (
            <div className="tasks-grid">
              {pendingTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card-modern"
                  onClick={() => handleTaskClick(task)}
                >
                  <TaskCard task={task} onStart={() => handleTaskStart(task)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderSectionContent = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboardContent();
      case "tasks":
        return <OwnTasks />;
      case "reports":
        return (
          <div className="section-content">
            <h2>Relatórios</h2>
            <p>Visualize estatísticas e relatórios de desempenho</p>
            <span className="coming-soon">Em breve</span>
          </div>
        );
      case "history":
        return <TaskHistory />;
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

  return (
    <div className="zelador-dashboard">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="dashboard-main">{renderSectionContent()}</div>
      </div>

      {selectedTask && (
        <div className="exec-modal-overlay" role="dialog" aria-modal="true">
          <div className="exec-modal">
            <div className="exec-modal-header">
              <div className="exec-modal-titles">
                <h2>{selectedTask.title}</h2>
                <p>
                  {selectedTask.setor} • {selectedTask.priority.toUpperCase()}
                </p>
              </div>
              <button
                className="exec-close"
                onClick={handleBackToList}
                aria-label="Fechar"
              >
                ×
              </button>
            </div>
            <div className="exec-modal-body">
              <TaskExecution
                task={selectedTask}
                onComplete={handleTaskCompleteWrapper}
                onBack={handleBackToList}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZeladorDashboard;
