import React, { useState, useEffect } from "react";
import { zeladorService } from "../../../../services/ZeladorService";
import type { Zelador } from "../../../../types/Zelador";
import type { Task, TaskStatus } from "../../../../types/Task";
import {
  FaTimes,
  FaTasks,
  FaUser,
  FaBuilding,
  FaCalendarAlt,
  FaClock,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import "./ZeladorTasksModal.css";

interface ZeladorTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  zelador: Zelador | null;
}

const ZeladorTasksModal: React.FC<ZeladorTasksModalProps> = ({
  isOpen,
  onClose,
  zelador,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "">("");

  // Carregar tarefas quando o modal abrir
  useEffect(() => {
    const loadTasks = async () => {
      if (!zelador) return;

      setLoading(true);
      setError(null);
      try {
        const tasksData = await zeladorService.getTasks(zelador.email);
        setTasks(tasksData);
      } catch (error) {
        console.error("Erro ao carregar tarefas:", error);
        setError("Erro ao carregar tarefas do funcionário");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && zelador) {
      loadTasks();
    }
  }, [isOpen, zelador]);

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...tasks];

      if (searchTerm) {
        filtered = filtered.filter(
          (task) =>
            task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (statusFilter) {
        filtered = filtered.filter((task) => task.status === statusFilter);
      }

      setFilteredTasks(filtered);
    };

    applyFilters();
  }, [tasks, searchTerm, statusFilter]);

  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case "PENDING":
        return { label: "Pendente", color: "#f59e0b", icon: FaClock };
      case "IN_PROGRESS":
        return { label: "Em Andamento", color: "#3b82f6", icon: FaClock };
      case "COMPLETED":
        return { label: "Concluída", color: "#10b981", icon: FaCheckCircle };
      case "OVERDUE":
        return {
          label: "Em Atraso",
          color: "#ef4444",
          icon: FaExclamationTriangle,
        };
      default:
        return { label: "Desconhecido", color: "#6b7280", icon: FaClock };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#f59e0b";
      case "low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const handleClose = () => {
    if (!loading) {
      setSearchTerm("");
      setStatusFilter("");
      onClose();
    }
  };

  if (!isOpen || !zelador) return null;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED").length;
  const pendingTasks = tasks.filter((t) => t.status === "PENDING").length;
  const overdueTasks = tasks.filter((t) => t.status === "OVERDUE").length;

  return (
    <div className="zelador-tasks-modal-overlay" onClick={handleClose}>
      <div className="zelador-tasks-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="zelador-tasks-header">
          <div className="zelador-info">
            <h2>
              <FaTasks />
              Tarefas do Funcionário
            </h2>
            <div className="zelador-details">
              <div className="zelador-name">
                <FaUser />
                {zelador.name}
              </div>
              {zelador.setor && (
                <div className="zelador-setor">
                  <FaBuilding />
                  {zelador.setor}
                </div>
              )}
            </div>
          </div>
          <button
            className="close-button"
            onClick={handleClose}
            disabled={loading}
          >
            <FaTimes />
          </button>
        </div>

        {/* Estatísticas */}
        <div className="tasks-stats">
          <div className="stat-card total">
            <div className="stat-number">{totalTasks}</div>
            <div className="stat-label">Total</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-number">{pendingTasks}</div>
            <div className="stat-label">Pendentes</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-number">{completedTasks}</div>
            <div className="stat-label">Concluídas</div>
          </div>
          <div className="stat-card overdue">
            <div className="stat-number">{overdueTasks}</div>
            <div className="stat-label">Atrasadas</div>
          </div>
        </div>

        {/* Filtros */}
        <div className="tasks-filters">
          <div className="filters-row">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Buscar tarefas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={loading}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TaskStatus | "")
              }
              disabled={loading}
            >
              <option value="">Todos os status</option>
              <option value="PENDING">Pendente</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluída</option>
              <option value="OVERDUE">Em Atraso</option>
            </select>
            <button
              className="clear-filters-button"
              onClick={clearFilters}
              disabled={loading}
            >
              <FaFilter />
              Limpar
            </button>
          </div>
        </div>

        {/* Lista de Tarefas */}
        <div className="tasks-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner">
                <FaSpinner className="spinning" />
                Carregando tarefas...
              </div>
            </div>
          ) : error ? (
            <div className="error-container">
              <div className="error-message">{error}</div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state">
              <FaTasks className="empty-icon" />
              <h3>Nenhuma tarefa encontrada</h3>
              <p>
                {searchTerm || statusFilter
                  ? "Tente ajustar os filtros de busca"
                  : "Este funcionário não possui tarefas atribuídas"}
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {filteredTasks.map((task) => {
                const status = getStatusInfo(task.status);
                const StatusIcon = status.icon;

                return (
                  <div key={task.id} className="task-card">
                    <div className="task-header">
                      <div className="task-title-section">
                        <h3 className="task-title">{task.title}</h3>
                        <div className="task-meta">
                          <span className="task-setor">{task.setor}</span>
                          <span
                            className="task-priority"
                            style={{ color: getPriorityColor(task.priority) }}
                          >
                            {task.priority.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="task-status">
                        <span
                          className="status-badge"
                          style={{ backgroundColor: status.color }}
                        >
                          <StatusIcon />
                          {status.label}
                        </span>
                      </div>
                    </div>

                    <div className="task-description">
                      <p>{task.description}</p>
                    </div>

                    <div className="task-details">
                      <div className="task-detail-item">
                        <FaCalendarAlt />
                        <span>Criada: {formatDate(task.createdAt)}</span>
                      </div>
                      <div className="task-detail-item">
                        <FaClock />
                        <span>Agendada: {task.scheduledTime}</span>
                      </div>
                      <div className="task-detail-item">
                        <FaClock />
                        <span>Duração: {task.estimatedDuration}min</span>
                      </div>
                      {task.completedAt && (
                        <div className="task-detail-item">
                          <FaCheckCircle />
                          <span>Concluída: {formatDate(task.completedAt)}</span>
                        </div>
                      )}
                    </div>

                    <div className="task-checklist">
                      <div className="checklist-header">
                        <span>Checklist ({task.checklist.length} itens)</span>
                        <span className="checklist-progress">
                          {
                            task.checklist.filter(
                              (item) => item.status === "OK"
                            ).length
                          }
                          /{task.checklist.length} concluídos
                        </span>
                      </div>
                      <div className="checklist-items">
                        {task.checklist.slice(0, 3).map(
                          (
                            item: any, // eslint-disable-line @typescript-eslint/no-explicit-any
                            index: number
                          ) => (
                            <div key={index} className="checklist-item">
                              <span className="checklist-question">
                                {item.question.length > 50
                                  ? `${item.question.substring(0, 50)}...`
                                  : item.question}
                              </span>
                              <span
                                className={`checklist-status ${item.status.toLowerCase()}`}
                              >
                                {item.status}
                              </span>
                            </div>
                          )
                        )}
                        {task.checklist.length > 3 && (
                          <div className="checklist-more">
                            +{task.checklist.length - 3} itens
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="task-actions">
                      <button
                        className="view-details-button"
                        onClick={() => {
                          // TODO: Implementar visualização de detalhes da tarefa
                          alert(`Ver detalhes da tarefa: ${task.title}`);
                        }}
                      >
                        <FaEye />
                        Ver Detalhes
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="tasks-footer">
          <div className="tasks-count">
            {filteredTasks.length} tarefa(s) encontrada(s)
          </div>
          <button
            className="close-modal-button"
            onClick={handleClose}
            disabled={loading}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZeladorTasksModal;
