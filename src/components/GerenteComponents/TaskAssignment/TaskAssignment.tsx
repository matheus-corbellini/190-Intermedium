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
  const [unassignedTasks, setUnassignedTasks] = useState<Task[]>([]);
  const [zeladores, setZeladores] = useState<Zelador[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);

  const [selectedSetor, setSelectedSetor] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string>("");
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
          taskService.getUnassigned(),
          zeladorService.getAll(),
          setorService.getAll(),
          taskTemplateService.getAll(),
        ]);

      setUnassignedTasks(tasksData);
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

  const filteredTasks = unassignedTasks.filter((task) => {
    const matchesSetor = !selectedSetor || task.setor === selectedSetor;
    const matchesPriority =
      !selectedPriority || task.priority === selectedPriority;
    const matchesSearch =
      !searchTerm ||
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSetor && matchesPriority && matchesSearch;
  });

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

        <div className="filter-actions">
          <button className="filter-button filter-clear" onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="task-stats">
        <div className="stat-card">
          <span className="stat-number">{filteredTasks.length}</span>
          <span className="stat-label">Tarefas Pendentes</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{unassignedTasks.length}</span>
          <span className="stat-label">Total de Tarefas</span>
        </div>
        <div className="stat-card">
          <span className="stat-number">{zeladores.length}</span>
          <span className="stat-label">Zeladores Disponíveis</span>
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
                </div>
              </div>
              <div className="task-actions">
                <button
                  className="btn-assign"
                  onClick={() => handleAssignTask(task)}
                >
                  <FaUser />
                  Atribuir
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
