import type { Timestamp } from "firebase/firestore";
import React, { useState, useEffect, useCallback } from "react";
import { taskService } from "../../../services/TaskService";
import {
  type Task,
  TaskStatus,
  ChecklistItemStatus,
} from "../../../types/Task";
import { useAuth } from "../../../hooks/UseAuth";
import {
  FaHistory,
  FaCheckCircle,
  FaImage,
  FaFileAlt,
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import "./TaskHistory.css";

const TaskHistory: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [search, setSearch] = useState("");
  const [periodFilter, setPeriodFilter] = useState(7);
  const [setorFilter, setSetorFilter] = useState("ALL");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allTasks = await taskService.getByZelador(user?.email || "");
      const completedTasks = allTasks.filter(
        (task) => task.status === TaskStatus.COMPLETED
      );

      completedTasks.sort((a, b) => {
        if (!a.completedAt || !b.completedAt) return 0;
        return b.completedAt.toMillis() - a.completedAt.toMillis();
      });

      setTasks(completedTasks);
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      setError("Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredTasks = tasks.filter((task) => {
    if (!task.completedAt) return false;

    const completedDate = task.completedAt.toDate();
    const daysAgo = new Date(currentTime);
    daysAgo.setDate(daysAgo.getDate() - periodFilter);

    if (completedDate < daysAgo) return false;
    if (setorFilter !== "ALL" && task.setor !== setorFilter) return false;
    if (search && !task.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  const uniqueSetores = Array.from(
    new Set(tasks.map((task) => task.setor))
  ).sort();

  const hasIssues = (task: Task): boolean => {
    return task.checklist.some(
      (item) => item.status === ChecklistItemStatus.NOT_COMPLIANT
    );
  };

  const getPhotoCount = (task: Task): number => {
    return task.checklist.flatMap((item) => item.photos || []).length;
  };

  // Contar observações da tarefa
  const getObservationCount = (task: Task): number => {
    return task.checklist.filter((item) => item.observation).length;
  };

  // Formatar data para exibição
  const formatDate = (timestamp: Timestamp | undefined): string => {
    if (!timestamp) return "Data não disponível";
    return timestamp.toDate().toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleOpenDetails = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseDetails = () => {
    setSelectedTask(null);
  };

  return (
    <>
      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}

      <div className="dashboard-header">
        <div className="header-info">
          <div className="header-title-section">
            <FaHistory className="header-icon-history" />
            <div>
              <h1>Histórico de Tarefas</h1>
              <p>
                Ultima {periodFilter} dias • {filteredTasks.length} tarefa(s)
                completada(s)
              </p>
            </div>
          </div>
          <div className="header-time">
            <FaCalendarAlt />
            <span>{currentTime.toLocaleDateString("pt-BR")}</span>
          </div>
        </div>
      </div>

      <div className="history-section">
        <div className="history-controls">
          <input
            className="history-search"
            type="text"
            placeholder="Pesquisar por tarefa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="history-filter"
            value={periodFilter}
            onChange={(e) => setPeriodFilter(Number(e.target.value))}
          >
            <option value={7}>Últimos 7 dias</option>
            <option value={14}>Últimos 15 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>

          <select
            className="history-filter"
            value={setorFilter}
            onChange={(e) => setSetorFilter(e.target.value)}
          >
            <option value="ALL">Todos os setores</option>
            {uniqueSetores.map((setor) => (
              <option key={setor} value={setor}>
                {setor}
              </option>
            ))}
          </select>

          <button
            className="refresh-button-modern"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        {loading && tasks.length === 0 ? (
          <div className="loading-container">
            <div className="loading-spinner">Carregando histórico...</div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <FaCheckCircle className="empty-icon" />
            <h3>Nenhuma tarefa encontrada</h3>
            <p>
              {search
                ? "Tente ajustar os filtros de busca"
                : "Voce nao tem tarefas completadas neste periodo"}
            </p>
          </div>
        ) : (
          <div className="history-grid">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className={`history-card ${
                  hasIssues(task) ? "has-issues" : ""
                }`}
                onClick={() => handleOpenDetails(task)}
              >
                <div className="card-header">
                  <div
                    className={`status-badge ${
                      hasIssues(task) ? "status-issue" : "status-success"
                    }`}
                  >
                    {hasIssues(task) ? (
                      <>
                        <FaExclamationCircle /> Concluida com observações
                      </>
                    ) : (
                      <>
                        <FaCheckCircle /> Concluida
                      </>
                    )}
                  </div>
                  <span className={`priority-badge priority-${task.priority}`}>
                    {task.priority === "high"
                      ? "ALTA"
                      : task.priority === "medium"
                      ? "MEDIA"
                      : "BAIXA"}
                  </span>
                </div>

                <div className="card-body">
                  <h3 className="card-title">{task.title}</h3>
                  <p className="card-description">{task.description}</p>
                </div>

                <div className="card-meta">
                  <div className="meta-item">
                    <FaCalendarAlt />
                    <span>Concluida: {formatDate(task.completedAt)}</span>
                  </div>
                  <div className="meta-item">
                    <span className="setor-badge">{task.setor}</span>
                  </div>
                </div>

                <div className="card-indicators">
                  {getPhotoCount(task) > 0 && (
                    <div className="indicator">
                      <FaImage />
                      <span>{getPhotoCount(task)} foto(s)</span>
                    </div>
                  )}
                  {getObservationCount(task) > 0 && (
                    <div className="indicator">
                      <FaFileAlt />
                      <span>{getObservationCount(task)} observação(es)</span>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button className="detials-button">
                    Ver Detalhes Completos
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={handleCloseDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-section">
                <h2>{selectedTask.title}</h2>
                <p>
                  {selectedTask.setor} • Concluida em{" "}
                  {formatDate(selectedTask.completedAt)}
                </p>
              </div>
              <button className="modal-close" onClick={handleCloseDetails}>
                x
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-section">
                <h3 className="section-title">
                  <FaCheckCircle /> Informações Gerais
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <strong>Descrição:</strong>
                    <p>{selectedTask.description}</p>
                  </div>
                  <div className="info-item">
                    <strong>Prioridade:</strong>
                    <span
                      className={`priority-badge priority-${selectedTask.priority}`}
                    >
                      {selectedTask.priority === "high"
                        ? "ALTA"
                        : selectedTask.priority === "medium"
                        ? "MÉDIA"
                        : "BAIXA"}
                    </span>
                  </div>
                  <div className="info-item">
                    <strong>Duração Estimada:</strong>
                    <p>{selectedTask.estimatedDuration} minutos</p>
                  </div>
                  <div className="info-item">
                    <strong>Agendada para:</strong>
                    <p>{selectedTask.scheduledTime}</p>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3 className="section-title">
                  <FaCheckCircle /> Checklist de Execução
                </h3>
                <div className="checklist-container">
                  {selectedTask.checklist.map((item, index) => (
                    <div
                      key={index}
                      className={`checklist-item-detail status-${item.status.toLowerCase()}`}
                    >
                      <div className="item-header">
                        <span className="item-number">{index + 1}</span>
                        <h4 className="item-question">{item.question}</h4>
                        <span
                          className={`item-status-badge ${item.status.toLowerCase()}`}
                        >
                          {item.status === ChecklistItemStatus.OK && "✓ OK"}
                          {item.status === ChecklistItemStatus.NOT_COMPLIANT &&
                            "✗ Não conforme"}
                          {item.status === ChecklistItemStatus.PENDING &&
                            "⏳ Pendente"}
                        </span>
                      </div>

                      {item.observation && (
                        <div className="item-observation">
                          <FaFileAlt />
                          <div>
                            <strong>Observação:</strong>
                            <p>{item.observation}</p>
                          </div>
                        </div>
                      )}

                      {item.photos && item.photos.length > 0 && (
                        <div className="item-photos">
                          <FaImage />
                          <div className="photos-grid">
                            {item.photos.map((photo, photoIndex) => (
                              <div key={photoIndex} className="photo-item">
                                <img
                                  src={photo}
                                  alt={`Foto ${photoIndex + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {item.isEquipment && (
                        <div className="item-equipment">
                          <strong>Equipamento:</strong> {item.equipmentName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {getPhotoCount(selectedTask) > 0 && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <FaImage /> Galeria de Fotos ({getPhotoCount(selectedTask)})
                  </h3>
                  <div className="photo-gallery">
                    {selectedTask.checklist
                      .flatMap((item) => item.photos || [])
                      .map((photo, index) => (
                        <div key={index} className="gallery-item">
                          <img src={photo} alt={`Foto ${index + 1}`} />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {getObservationCount(selectedTask) > 0 && (
                <div className="modal-section">
                  <h3 className="section-title">
                    <FaFileAlt /> Observações (
                    {getObservationCount(selectedTask)})
                  </h3>
                  <div className="observations-list">
                    {selectedTask.checklist
                      .filter((item) => item.observation)
                      .map((item, index) => (
                        <div key={index} className="observation-item">
                          <strong>
                            {index + 1}. {item.question}
                          </strong>
                          <p>{item.observation}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="close-button" onClick={handleCloseDetails}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskHistory;
