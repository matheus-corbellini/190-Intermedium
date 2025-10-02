"use client";

import type React from "react";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../hooks/UseAuth";
import { useNavigation } from "../../hooks/useNavigation";
import { taskService } from "../../services/TaskService";
import { setorService } from "../../services/SetorService";
import { type Task, TaskStatus } from "../../types/Task";
import { UserRole } from "../../types/User";
import { FaRedo, FaSpinner } from "react-icons/fa";
import GerenteSidebar from "../../components/GerenteComponents/GerenteSidebar/GerenteSidebar";
import GerenteTaskCard from "../../components/GerenteComponents/GerenteTaskCard/GerenteTaskCard";
import TaskDetailsModal from "../../components/GerenteComponents/TaskDetailsModal/TaskDetailsModal";
import SetorManagement from "../../components/GerenteComponents/SetorManagement/SetorManagement";
import TaskManagement from "../../components/GerenteComponents/TaskManagement/TaskManagement";
import ReportsSection from "../../components/GerenteComponents/ReportsSection/ReportsSection";
import "./GerenteDashboard.css";
import type { Setor } from "../../types/Setor";
import FuncionarioManagement from "../../components/GerenteComponents/FuncionarioManagement/FuncionarioManagement";

const GerenteDashboard: React.FC = () => {
  const { user } = useAuth();
  const { goTo } = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeSection, setActiveSection] = useState("dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Filtros
  const [filters, setFilters] = useState({
    setor: "",
    zelador: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasks, setoresData] = await Promise.all([
        taskService.getAll(),
        setorService.getAll(),
      ]);
      setTasks(tasks);
      setSetores(setoresData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const applyFilters = useCallback(() => {
    let filtered = [...tasks];

    if (filters.setor) {
      filtered = filtered.filter((task) => task.setor === filters.setor);
    }

    if (filters.zelador) {
      filtered = filtered.filter((task) => task.assignedTo === filters.zelador);
    }

    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter((task) => task.createdAt.toDate() >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((task) => task.createdAt.toDate() <= toDate);
    }

    setFilteredTasks(filtered);
  }, [filters, tasks]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  if (!user || user.role !== UserRole.GERENTE) {
    goTo("/login");
    return null;
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      setor: "",
      zelador: "",
      status: "",
      dateFrom: "",
      dateTo: "",
    });
  };

  const stats = {
    pending: filteredTasks.filter((t) => t.status === TaskStatus.PENDING)
      .length,
    completed: filteredTasks.filter((t) => t.status === TaskStatus.COMPLETED)
      .length,
    overdue: filteredTasks.filter((t) => t.status === TaskStatus.OVERDUE)
      .length,
    total: filteredTasks.length,
  };

  const uniqueZeladores = [...new Set(tasks.map((task) => task.assignedTo))];

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">Carregando...</div>
        </div>
      );
    }
    return (
      <>
        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        )}
        <div className="dashboard-header">
          <div>
            <h1>Dashboard Gerencial</h1>
            <p>
              {currentTime.toLocaleDateString("pt-BR")} •{" "}
              {currentTime.toLocaleTimeString("pt-BR")}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              className="refresh-button"
              onClick={refreshData}
              disabled={loading}
              title="Atualizar dados"
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

        <div className="filters-section">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Setor</label>
              <select
                value={filters.setor}
                onChange={(e) => handleFilterChange("setor", e.target.value)}
              >
                <option value="">Todos os setores</option>
                {setores.map((setor) => (
                  <option key={setor.id} value={setor.name}>
                    {setor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Zelador</label>
              <select
                value={filters.zelador}
                onChange={(e) => handleFilterChange("zelador", e.target.value)}
              >
                <option value="">Todos os zeladores</option>
                {uniqueZeladores.map((zelador) => (
                  <option key={zelador} value={zelador}>
                    {zelador}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              >
                <option value="">Todos os status</option>
                <option value={TaskStatus.PENDING}>Pendente</option>
                <option value={TaskStatus.IN_PROGRESS}>Em Andamento</option>
                <option value={TaskStatus.COMPLETED}>Concluída</option>
                <option value={TaskStatus.OVERDUE}>Em Atraso</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Data Inicial</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Data Final</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              />
            </div>
          </div>
          <div className="filter-actions">
            <button
              className="filter-button filter-clear"
              onClick={clearFilters}
            >
              Limpar Filtros
            </button>
            <button
              className="filter-button filter-refresh"
              onClick={refreshData}
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

        <div className="tasks-section">
          <div className="tasks-header">
            <h2>Tarefas</h2>
            <div className="tasks-count">
              {filteredTasks.length} tarefa(s) encontrada(s)
            </div>
          </div>
          <div className="tasks-list">
            {filteredTasks.length === 0 ? (
              <div
                style={{ padding: "40px", textAlign: "center", color: "#666" }}
              >
                Nenhuma tarefa encontrada com os filtros aplicados.
              </div>
            ) : (
              filteredTasks.map((task) => (
                <GerenteTaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setSelectedTask(task)}
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
      case "funcionarios":
        return <FuncionarioManagement />;
      case "setores":
        return <SetorManagement />;
      case "tasks":
        return <TaskManagement />;
      case "reports":
        return <ReportsSection />;
      default:
        return renderDashboardContent();
    }
  };

  return (
    <div className="gerente-dashboard">
      <GerenteSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      <div className="dashboard-content">
        <div className="dashboard-main">{renderSectionContent()}</div>
      </div>

      {selectedTask && (
        <TaskDetailsModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
};

export default GerenteDashboard;
