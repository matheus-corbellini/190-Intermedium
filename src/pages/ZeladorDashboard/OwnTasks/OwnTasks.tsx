import React, { useState, useEffect } from "react";
import { type Task, TaskStatus } from "../../../types/Task";
import TaskCard from "../../../components/TaskComponents/TaskCard/TaskCard";
import { taskService } from "../../../services/TaskService";
import { useAuth } from "../../../hooks/UseAuth";
import TaskDetailsModal from "../../../components/GerenteComponents/TaskDetailsModal/TaskDetailsModal";
import "./OwnTasks.css";

const OwnTasks: React.FC = () => {
  const { user } = useAuth();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"ALL" | TaskStatus>("ALL");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"priority" | "title" | "none">("none");

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getByZelador(user?.email || "");
      setTasks(tasksData);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setError("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  });

  const handleTaskStart = async (task: Task) => {
    try {
      await taskService.markAsInProgress(task.id);
      await loadData();
      setSelectedTask(task);
    } catch (error) {
      console.error("Erro ao iniciar tarefa:", error);
      alert("Erro ao iniciar tarefa. Tente novamente.");
    }
  };

  const visisbleTask = tasks
    .filter((t) => (statusFilter === "ALL" ? true : t.status === statusFilter))
    .filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "priority") {
        const order = ["ALTA", "MÉDIA", "BAIXA"];
        return (
          order.indexOf(a.priority.toUpperCase()) -
          order.indexOf(b.priority.toUpperCase())
        );
      }

      if (sortBy === "title") return a.title.localeCompare(b.title);
      return 0;
    });

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  return (
    <>
      {!loading && error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="dashboard-header">
        <h1>Minhas Tarefas</h1>
        <p>Visualize todas as suas tarefas</p>
      </div>

      <div className="tasks-section">
        <div className="tasks-header">
          <h2>Tarefas ({visisbleTask.length})</h2>
          <div className="tasks-controls">
            <input
              className="tasks-search"
              type="text"
              placeholder="Pesquisar por tarefa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="tasks-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as TaskStatus | "ALL")
              }
            >
              <option value="ALL">Todos os status</option>
              <option value={TaskStatus.PENDING}>Pendente</option>
              <option value={TaskStatus.IN_PROGRESS}>Em Andamento</option>
              <option value={TaskStatus.COMPLETED}>Concluída</option>
              <option value={TaskStatus.OVERDUE}>Em Atraso</option>
            </select>
            <select
              className="tasks-sort"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "priority" | "title" | "none")
              }
            >
              <option value="none">Sem ordenação</option>
              <option value="priority">Prioridade</option>
              <option value="title">Título (A-Z)</option>
            </select>
            <button className="refresh-button-modern" onClick={loadData}>
              {loading ? "Atualizando..." : "Atualizar"}
              <div className="current-time">
                Atualizado: {currentTime.toLocaleTimeString("pt-BR")}
              </div>
            </button>
          </div>
        </div>
        <div className="tasks-list">
          {visisbleTask.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma tarefa encontrada</h3>
              <p>Ajuste seus filtros ou tente novamente.</p>
            </div>
          ) : (
            visisbleTask.map((task) => (
              <div
                key={task.id}
                className={`task-card-modern ${
                  task.status === TaskStatus.IN_PROGRESS ? "in-progress" : ""
                } ${task.status === TaskStatus.OVERDUE ? "overdue" : ""}`}
                onClick={() => handleOpenDetails(task)}
              >
                {loading && (
                  <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Carregando tarefas...</p>
                  </div>
                )}
                <TaskCard
                  key={task.id}
                  task={task}
                  onStart={(e?: React.MouseEvent) => {
                    if (e) e.stopPropagation();
                    handleTaskStart(task);
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskStart(task);
                      }}
                    >
                      Iniciar
                    </button>;
                  }}
                />
              </div>
            ))
          )}
        </div>
      </div>
      {selectedTask && (
        <div
          className="task-details-modal-overlay"
          onClick={handleCloseDetails}
        >
          <div
            className="task-details-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <TaskDetailsModal
              task={selectedTask}
              onClose={handleCloseDetails}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default OwnTasks;
