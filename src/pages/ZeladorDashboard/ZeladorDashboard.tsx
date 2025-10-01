"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { taskService } from "../../services/TaskService";
import { type Task, TaskStatus } from "../../types/Task";
import { UserRole } from "../../types/User";
import Sidebar from "../../components/Sidebar/Sidebar";
import TaskCard from "../../components/TaskComponents/TaskCard/TaskCard";
import TaskExecution from "../../components/TaskComponents/TaskExecution/TaskExecution";
import { FaSpinner, FaRedo } from "react-icons/fa";
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
  const loadData = async () => {
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
  };

  useEffect(() => {
    loadData();
  }, [user]);

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

  const handleTaskStart = async (task: Task) => {
    try {
      setSelectedTask(task);
      await taskService.markAsInProgress(task.id);
      await loadData(); // Recarregar dados
    } catch (error) {
      console.error("Erro ao iniciar tarefa:", error);
      alert("Erro ao iniciar tarefa. Tente novamente.");
    }
  };

  const handleTaskComplete = async (taskId: string, updatedTask: Task) => {
    try {
      await taskService.markAsCompleted(taskId);
      await loadData(); // Recarregar dados
      setSelectedTask(null);
    } catch (error) {
      console.error("Erro ao completar tarefa:", error);
      alert("Erro ao completar tarefa. Tente novamente.");
    }
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

    return (
      <>
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <div className="dashboard-header-info">
            <p>
              {currentTime.toLocaleDateString("pt-BR")} •{" "}
              {currentTime.toLocaleTimeString("pt-BR")}
            </p>
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
          </div>
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
            {tasks.length === 0 ? (
              <div
                style={{ padding: "40px", textAlign: "center", color: "#666" }}
              >
                Nenhuma tarefa encontrada para hoje.
              </div>
            ) : (
              tasks.map((task) => (
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
