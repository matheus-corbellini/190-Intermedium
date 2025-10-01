"use client";

import type React from "react";
import { useState, useMemo, useEffect } from "react";
import { taskService } from "../../../services/TaskService";
import type { Task } from "../../../types/Task";
import { setorService } from "../../../services/SetorService";
import type { Setor } from "../../../types/Setor";
import { TaskStatus, ChecklistItemStatus } from "../../../types/Task";
import Button from "../../Button/Button";
import {
  FaDownload,
  FaChartLine,
  FaUserCheck,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaRedo,
} from "react-icons/fa";
import "./ReportsSection.css";

const ReportsSection: React.FC = () => {
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });
  const [selectedSetor, setSelectedSetor] = useState("");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tasksData, setoresData] = await Promise.all([
        taskService.getAll(),
        setorService.getAll(),
      ]);
      setTasks(tasksData);
      setSetores(setoresData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar tarefas por intervalo de datas e setor
  const filteredTasks = useMemo(() => {
    let filtered = [...tasks];

    if (dateRange.from) {
      const fromDate = new Date(dateRange.from);
      filtered = filtered.filter((task) => {
        const taskDate =
          typeof task.createdAt === "object" && "toDate" in task.createdAt
            ? task.createdAt.toDate()
            : new Date(task.createdAt);
        return taskDate >= fromDate;
      });
    }

    if (dateRange.to) {
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((task) => {
        const taskDate =
          typeof task.createdAt === "object" && "toDate" in task.createdAt
            ? task.createdAt.toDate()
            : new Date(task.createdAt);
        return taskDate <= toDate;
      });
    }

    if (selectedSetor) {
      filtered = filtered.filter((task) => task.setor === selectedSetor);
    }

    return filtered;
  }, [dateRange, selectedSetor, tasks]);

  // Métricas por Zelador
  const zeladorMetrics = useMemo(() => {
    const zeladores = [...new Set(filteredTasks.map((t) => t.assignedTo))];
    return zeladores.map((zelador) => {
      const zeladorTasks = filteredTasks.filter(
        (t) => t.assignedTo === zelador
      );
      const completed = zeladorTasks.filter(
        (t) => t.status === TaskStatus.COMPLETED
      ).length;
      const total = zeladorTasks.length;
      const completionRate = total > 0 ? (completed / total) * 100 : 0;

      // Calcular tempo médio de conclusão
      const completedTasks = zeladorTasks.filter(
        (t) => t.status === TaskStatus.COMPLETED && t.completedAt
      );
      const avgCompletionTime =
        completedTasks.length > 0
          ? completedTasks.reduce((sum, task) => {
              const duration =
                task.completedAt && task.createdAt
                  ? (() => {
                      const completedDate =
                        typeof task.completedAt === "object" &&
                        "toDate" in task.completedAt
                          ? task.completedAt.toDate()
                          : new Date(task.completedAt);
                      const createdDate =
                        typeof task.createdAt === "object" &&
                        "toDate" in task.createdAt
                          ? task.createdAt.toDate()
                          : new Date(task.createdAt);
                      return (
                        (completedDate.getTime() - createdDate.getTime()) /
                        (1000 * 60 * 60)
                      );
                    })()
                  : 0;
              return sum + duration;
            }, 0) / completedTasks.length
          : 0;

      return {
        name: zelador,
        total,
        completed,
        completionRate,
        avgCompletionTime,
      };
    });
  }, [filteredTasks]);

  // Métricas por Setor
  const setorMetrics = useMemo(() => {
    return setores.map((setor) => {
      const setorTasks = filteredTasks.filter((t) => t.setor === setor.name);
      const completed = setorTasks.filter(
        (t) => t.status === TaskStatus.COMPLETED
      ).length;
      const total = setorTasks.length;

      // Calcular tempo médio por setor
      const completedTasks = setorTasks.filter(
        (t) => t.status === TaskStatus.COMPLETED && t.completedAt
      );
      const avgTime =
        completedTasks.length > 0
          ? completedTasks.reduce((sum, task) => {
              const duration =
                task.completedAt && task.createdAt
                  ? (() => {
                      const completedDate =
                        typeof task.completedAt === "object" &&
                        "toDate" in task.completedAt
                          ? task.completedAt.toDate()
                          : new Date(task.completedAt);
                      const createdDate =
                        typeof task.createdAt === "object" &&
                        "toDate" in task.createdAt
                          ? task.createdAt.toDate()
                          : new Date(task.createdAt);
                      return (
                        (completedDate.getTime() - createdDate.getTime()) /
                        (1000 * 60 * 60)
                      );
                    })()
                  : 0;
              return sum + duration;
            }, 0) / completedTasks.length
          : 0;

      return {
        name: setor.name,
        total,
        completed,
        completionRate: total > 0 ? (completed / total) * 100 : 0,
        avgTime,
      };
    });
  }, [filteredTasks, setores]);

  // Taxa de conformidade de checklist
  const checklistCompliance = useMemo(() => {
    const allChecklistItems = filteredTasks
      .filter((t) => t.status === TaskStatus.COMPLETED)
      .flatMap((t) => t.checklist);

    const total = allChecklistItems.length;
    const ok = allChecklistItems.filter(
      (item) => item.status === ChecklistItemStatus.OK
    ).length;
    const notCompliant = allChecklistItems.filter(
      (item) => item.status === ChecklistItemStatus.NOT_COMPLIANT
    ).length;

    return {
      total,
      ok,
      notCompliant,
      complianceRate: total > 0 ? (ok / total) * 100 : 0,
    };
  }, [filteredTasks]);

  // Distribuição por prioridade
  const priorityDistribution = useMemo(() => {
    const high = filteredTasks.filter((t) => t.priority === "high").length;
    const medium = filteredTasks.filter((t) => t.priority === "medium").length;
    const low = filteredTasks.filter((t) => t.priority === "low").length;

    return { high, medium, low };
  }, [filteredTasks]);

  // Estatísticas gerais
  const generalStats = useMemo(() => {
    const completed = filteredTasks.filter(
      (t) => t.status === TaskStatus.COMPLETED
    ).length;
    const overdue = filteredTasks.filter(
      (t) => t.status === TaskStatus.OVERDUE
    ).length;
    const inProgress = filteredTasks.filter(
      (t) => t.status === TaskStatus.IN_PROGRESS
    ).length;

    return {
      total: filteredTasks.length,
      completed,
      overdue,
      inProgress,
      completionRate:
        filteredTasks.length > 0 ? (completed / filteredTasks.length) * 100 : 0,
    };
  }, [filteredTasks]);

  const handleExport = () => {
    const reportData = {
      period: {
        from: dateRange.from || "Início",
        to: dateRange.to || "Hoje",
      },
      setor: selectedSetor || "Todos",
      generalStats,
      zeladorMetrics,
      setorMetrics,
      checklistCompliance,
      priorityDistribution,
      generatedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(reportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner">
            <FaSpinner className="spinning" />
            Carregando...
          </div>
        </div>
      )}
      {error && (
        <div className="error-container">
          <div className="error-message">{error}</div>
        </div>
      )}
      <div className="reports-section">
        <div className="reports-header">
          <h1>Relatórios Analíticos</h1>
          <p>Análise detalhada de desempenho e produtividade</p>
          <div className="reports-header-buttons">
            <Button onClick={loadData} disabled={loading}>
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
            </Button>
          </div>
          <Button onClick={handleExport}>
            <FaDownload style={{ marginRight: 8 }} />
            Exportar Relatório
          </Button>
        </div>

        {/* Filtros */}
        <div className="reports-filters">
          <div className="filter-group">
            <label>Data Inicial</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
          </div>
          <div className="filter-group">
            <label>Data Final</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>
          <div className="filter-group">
            <label>Setor</label>
            <select
              value={selectedSetor}
              onChange={(e) => setSelectedSetor(e.target.value)}
            >
              <option value="">Todos os setores</option>
              {setores.map((setor) => (
                <option key={setor.id} value={setor.name}>
                  {setor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Estatísticas Gerais */}
        <div className="reports-overview">
          <div className="overview-card">
            <div className="overview-icon overview-icon-primary">
              <FaChartLine />
            </div>
            <div className="overview-content">
              <div className="overview-value">{generalStats.total}</div>
              <div className="overview-label">Total de Tarefas</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon overview-icon-success">
              <FaCheckCircle />
            </div>
            <div className="overview-content">
              <div className="overview-value">
                {generalStats.completionRate.toFixed(1)}%
              </div>
              <div className="overview-label">Taxa de Conclusão</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon overview-icon-warning">
              <FaClock />
            </div>
            <div className="overview-content">
              <div className="overview-value">{generalStats.inProgress}</div>
              <div className="overview-label">Em Andamento</div>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon overview-icon-danger">
              <FaExclamationTriangle />
            </div>
            <div className="overview-content">
              <div className="overview-value">{generalStats.overdue}</div>
              <div className="overview-label">Em Atraso</div>
            </div>
          </div>
        </div>

        {/* Métricas por Zelador */}
        <div className="reports-section-block">
          <h2>
            <FaUserCheck style={{ marginRight: 8 }} />
            Desempenho por Zelador
          </h2>
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Zelador</th>
                  <th>Total de Tarefas</th>
                  <th>Concluídas</th>
                  <th>Taxa de Conclusão</th>
                  <th>Tempo Médio (h)</th>
                </tr>
              </thead>
              <tbody>
                {zeladorMetrics.map((metric) => (
                  <tr key={metric.name}>
                    <td className="table-cell-bold">{metric.name}</td>
                    <td>{metric.total}</td>
                    <td>{metric.completed}</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${metric.completionRate}%`,
                              backgroundColor:
                                metric.completionRate >= 80
                                  ? "#10b981"
                                  : metric.completionRate >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="progress-text">
                          {metric.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>{metric.avgCompletionTime.toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Métricas por Setor */}
        <div className="reports-section-block">
          <h2>
            <FaChartLine style={{ marginRight: 8 }} />
            Análise por Setor
          </h2>
          <div className="reports-table">
            <table>
              <thead>
                <tr>
                  <th>Setor</th>
                  <th>Total de Tarefas</th>
                  <th>Concluídas</th>
                  <th>Taxa de Conclusão</th>
                  <th>Tempo Médio (h)</th>
                </tr>
              </thead>
              <tbody>
                {setorMetrics.map((metric) => (
                  <tr key={metric.name}>
                    <td className="table-cell-bold">{metric.name}</td>
                    <td>{metric.total}</td>
                    <td>{metric.completed}</td>
                    <td>
                      <div className="progress-cell">
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${metric.completionRate}%`,
                              backgroundColor:
                                metric.completionRate >= 80
                                  ? "#10b981"
                                  : metric.completionRate >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                        <span className="progress-text">
                          {metric.completionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td>{metric.avgTime.toFixed(1)}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Grid de métricas adicionais */}
        <div className="reports-grid">
          {/* Conformidade de Checklist */}
          <div className="report-card">
            <h3>Conformidade de Checklist</h3>
            <div className="report-card-content">
              <div className="compliance-stats">
                <div className="compliance-item compliance-ok">
                  <div className="compliance-value">
                    {checklistCompliance.ok}
                  </div>
                  <div className="compliance-label">Conformes</div>
                </div>
                <div className="compliance-item compliance-not">
                  <div className="compliance-value">
                    {checklistCompliance.notCompliant}
                  </div>
                  <div className="compliance-label">Não Conformes</div>
                </div>
              </div>
              <div className="compliance-rate">
                <div className="progress-bar large">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${checklistCompliance.complianceRate}%`,
                      backgroundColor:
                        checklistCompliance.complianceRate >= 90
                          ? "#10b981"
                          : checklistCompliance.complianceRate >= 70
                          ? "#f59e0b"
                          : "#ef4444",
                    }}
                  />
                </div>
                <p className="compliance-rate-text">
                  Taxa de Conformidade:{" "}
                  <strong>
                    {checklistCompliance.complianceRate.toFixed(1)}%
                  </strong>
                </p>
              </div>
            </div>
          </div>

          {/* Distribuição por Prioridade */}
          <div className="report-card">
            <h3>Distribuição por Prioridade</h3>
            <div className="report-card-content">
              <div className="priority-chart">
                <div className="priority-item priority-high">
                  <div className="priority-bar-container">
                    <div
                      className="priority-bar"
                      style={{
                        width: `${
                          (priorityDistribution.high / filteredTasks.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="priority-info">
                    <span className="priority-label">Alta</span>
                    <span className="priority-value">
                      {priorityDistribution.high}
                    </span>
                  </div>
                </div>
                <div className="priority-item priority-medium">
                  <div className="priority-bar-container">
                    <div
                      className="priority-bar"
                      style={{
                        width: `${
                          (priorityDistribution.medium / filteredTasks.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="priority-info">
                    <span className="priority-label">Média</span>
                    <span className="priority-value">
                      {priorityDistribution.medium}
                    </span>
                  </div>
                </div>
                <div className="priority-item priority-low">
                  <div className="priority-bar-container">
                    <div
                      className="priority-bar"
                      style={{
                        width: `${
                          (priorityDistribution.low / filteredTasks.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <div className="priority-info">
                    <span className="priority-label">Baixa</span>
                    <span className="priority-value">
                      {priorityDistribution.low}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReportsSection;
