import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaPlus,
  FaSync,
  FaSearch,
  FaBuilding,
  FaExclamationTriangle,
  FaChartLine,
  FaCheckCircle,
  FaUser,
  FaClock,
  FaFileAlt,
  FaClipboardList,
} from "react-icons/fa";
import { taskService } from "../../../services/TaskService";
import { zeladorService } from "../../../services/ZeladorService";
import { setorService } from "../../../services/SetorService";
import { taskTemplateService } from "../../../services/TaskTemplateService";
import type { Task } from "../../../types/Task";
import type { Zelador } from "../../../types/Zelador";
import type { Setor } from "../../../types/Setor";
import type { TaskTemplate } from "../../../types/QuestionTemplate";
import CreateTaskModal from "./CreateTaskModal/CreateTaskModal";
import AssignTaskModal from "./AssignTaskModal/AssignTaskModal";
import "./TaskAssignment.css";

const TaskAssignment: React.FC = () => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [zeladores, setZeladores] = useState<Zelador[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  const [selectedSetor, setSelectedSetor] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [tasksData, zeladoresData, setoresData, templatesData] =
        await Promise.all([
          taskService.getAll(),
          zeladorService.getAll(),
          setorService.getAll(),
          taskTemplateService.getAll(),
        ]);

      setAllTasks(tasksData);
      setZeladores(zeladoresData);
      setSetores(setoresData);
      setTemplates(templatesData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = allTasks.filter((task) => {
    const matchesSetor = !selectedSetor || task.setor === selectedSetor;
    const matchesPriority =
      !selectedPriority || task.priority === selectedPriority;
    const matchesStatus = !selectedStatus || task.status === selectedStatus;
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSetor && matchesPriority && matchesStatus && matchesSearch;
  });

  const unassignedTasks = allTasks.filter((task) => !task.assignedTo);
  const assignedTasks = allTasks.filter((task) => task.assignedTo);

  const handleAssignTask = (task: Task) => {
    setSelectedTask(task);
    setShowAssignModal(true);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowAssignModal(false);
    setSelectedTask(null);
  };

  const handleModalSuccess = () => {
    loadData();
    handleCloseModals();
  };

  const clearFilters = () => {
    setSelectedSetor("");
    setSelectedPriority("");
    setSelectedStatus("");
    setSearchTerm("");
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <FaExclamationTriangle className="priority-icon high" />;
      case "medium":
        return <FaChartLine className="priority-icon medium" />;
      case "low":
        return <FaCheckCircle className="priority-icon low" />;
      default:
        return null;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case "high":
        return "Alta";
      case "medium":
        return "Média";
      case "low":
        return "Baixa";
      default:
        return "";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Pendente";
      case "IN_PROGRESS":
        return "Em Andamento";
      case "COMPLETED":
        return "Concluída";
      case "OVERDUE":
        return "Atrasada";
      default:
        return status;
    }
  };

  const getAssignedZeladorName = (assignedTo: string | undefined) => {
    if (!assignedTo) return null;
    const zelador = zeladores.find((z) => z.email === assignedTo);
    return zelador ? zelador.name : assignedTo;
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm("Tem certeza que deseja deletar esta tarefa?")) {
      await taskService.delete(taskId);
      loadData();
    }
  };

  if (loading) {
    return (
      <div className="task-assignment-loading">
        <div className="loading-spinner"></div>
        <p>Carregando tarefas...</p>
      </div>
    );
  }

  return (
    <div className="task-assignment">
      <div className="task-assignment-header">
        <div className="header-info">
          <h1>
            <FaTasks className="header-icon" />
            Atribuir Tarefas
          </h1>
          <p>Gerencie e atribua tarefas aos funcionários</p>
        </div>

        <div className="header-actions">
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus />
            Nova Tarefa
          </button>
          <button
            className="btn-secondary"
            onClick={loadData}
            disabled={loading}
          >
            <FaSync className={loading ? "spinning" : ""} />
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>
      </div>

      <div className="task-assignment-filters">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar tarefas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>
            <FaBuilding className="filter-label-icon" />
            Setor
          </label>
          <select
            value={selectedSetor}
            onChange={(e) => setSelectedSetor(e.target.value)}
          >
            <option value="">Todos os setores</option>
            {setores.map((setor) => (
              <option key={`setor-${setor.id}`} value={setor.name}>
                {setor.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FaExclamationTriangle className="filter-label-icon" />
            Prioridade
          </label>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
          >
            <option value="">Todas as prioridades</option>
            <option value="high">Alta</option>
            <option value="medium">Média</option>
            <option value="low">Baixa</option>
          </select>
        </div>

        <div className="filter-group">
          <label>
            <FaCheckCircle className="filter-label-icon" />
            Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="PENDING">Pendente</option>
            <option value="IN_PROGRESS">Em Andamento</option>
            <option value="COMPLETED">Concluída</option>
            <option value="OVERDUE">Atrasada</option>
          </select>
        </div>

        <div className="filter-actions">
          <button className="filter-button filter-clear" onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="task-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredTasks.length}</span>
          <span className="stat-label">Tarefas Filtradas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{unassignedTasks.length}</span>
          <span className="stat-label">Não Atribuídas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{assignedTasks.length}</span>
          <span className="stat-label">Atribuídas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{allTasks.length}</span>
          <span className="stat-label">Total de Tarefas</span>
        </div>
      </div>

      <div className="tasks-list">
        {filteredTasks.length === 0 ? (
          <div className="no-tasks">
            <div className="no-tasks-icon">
              <FaClipboardList />
            </div>
            <h3>Nenhuma tarefa encontrada</h3>
            <p>
              {searchTerm || selectedSetor || selectedPriority
                ? "Tente ajustar os filtros de busca"
                : "Não há tarefas aguardando atribuição neste momento"}
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-card">
              <div className="task-info">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {getPriorityIcon(task.priority)}
                    {getPriorityLabel(task.priority)}
                  </span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                  <span className="setor-badge">
                    <FaBuilding />
                    {task.setor}
                  </span>
                  <span className="duration-badge">
                    <FaClock />
                    {task.estimatedDuration} min
                  </span>
                  <span className="checklist-count">
                    <FaFileAlt />
                    {task.checklist.length} itens
                  </span>
                  {task.assignedTo && (
                    <span className="assigned-badge">
                      <FaUser />
                      {getAssignedZeladorName(task.assignedTo)}
                    </span>
                  )}
                  <span
                    className={`status-badge status-${task.status.toLowerCase()}`}
                  >
                    {getStatusLabel(task.status)}
                  </span>
                </div>
              </div>
              <div className="task-actions">
                {task.assignedTo ? (
                  <div className="assigned-info">
                    <span className="assigned-text">
                      Atribuída para: {getAssignedZeladorName(task.assignedTo)}
                    </span>
                    <button
                      className="btn-reassign"
                      onClick={() => handleAssignTask(task)}
                    >
                      <FaUser />
                      Reatribuir
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn-assign"
                    onClick={() => handleAssignTask(task)}
                  >
                    <FaUser />
                    Atribuir
                  </button>
                )}
                <button
                  className="btn-delete"
                  onClick={() => deleteTask(task.id)}
                  style={{ fontWeight: "bold" }}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateTaskModal
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
          setores={setores}
          templates={templates}
        />
      )}

      {showAssignModal && selectedTask && (
        <AssignTaskModal
          task={selectedTask}
          zeladores={zeladores}
          onClose={handleCloseModals}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default TaskAssignment;
