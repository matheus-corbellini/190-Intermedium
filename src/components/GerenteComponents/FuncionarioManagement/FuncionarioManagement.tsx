import React, { useState, useEffect } from "react";
import { zeladorService } from "../../../services/ZeladorService";
import { setorService } from "../../../services/SetorService";
import type { Zelador } from "../../../types/Zelador";
import type { Setor } from "../../../types/Setor";
import {
  FaPlus,
  FaSearch,
  FaSpinner,
  FaRedo,
  FaUsers,
  FaBuilding,
  FaEdit,
  FaTrash,
  FaEye,
} from "react-icons/fa";
import FuncionarioModal from "./FuncionarioModal/FuncionarioModal";
import ZeladorTasksModal from "./ZeladorTasksModal/ZeladorTasksModal";
import "./FuncionarioManagement.css";

const FuncionarioManagement: React.FC = () => {
  const [zeladores, setZeladores] = useState<Zelador[]>([]);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [filteredZeladores, setFilteredZeladores] = useState<Zelador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSetor, setSelectedSetor] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [selectedZelador, setSelectedZelador] = useState<Zelador | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    const applyFilters = () => {
      let filtered = [...zeladores];

      if (searchTerm) {
        filtered = filtered.filter(
          (zelador) =>
            zelador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            zelador.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedSetor) {
        filtered = filtered.filter(
          (zelador) => zelador.setor === selectedSetor
        );
      }

      setFilteredZeladores(filtered);
    };

    applyFilters();
  }, [searchTerm, selectedSetor, zeladores]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [zeladoresData, setoresData] = await Promise.all([
        zeladorService.getAll(),
        setorService.getAll(),
      ]);
      setZeladores(zeladoresData);
      setSetores(setoresData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError("Erro ao carregar dados de funcionários");
    } finally {
      setLoading(false);
    }
  };

  const refreshZeladores = async () => {
    try {
      const zeladoresData = await zeladorService.getAll();
      setZeladores(zeladoresData);
    } catch (error) {
      console.error("Erro ao atualizar zeladores:", error);
    }
  };

  const handleCreateZelador = () => {
    setSelectedZelador(null);
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleEditZelador = (zelador: Zelador) => {
    setSelectedZelador(zelador);
    setIsEditMode(true);
    setShowModal(true);
  };

  const handleViewTasks = (zelador: Zelador) => {
    setSelectedZelador(zelador);
    setShowTasksModal(true);
  };

  const handleDeleteZelador = async (zelador: Zelador) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o funcionário "${zelador.name}"?`
      )
    ) {
      try {
        await zeladorService.delete(zelador.id);
        setZeladores((prev) => prev.filter((z) => z.id !== zelador.id));
      } catch (error) {
        console.error("Erro ao deletar funcionário:", error);
        alert(
          error instanceof Error ? error.message : "Erro ao deletar funcionário"
        );
      }
    }
  };

  const handleModalSuccess = () => {
    refreshZeladores();
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedZelador(null);
    setIsEditMode(false);
  };

  const handleCloseTasksModal = () => {
    setShowTasksModal(false);
    setSelectedZelador(null);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedSetor("");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <FaSpinner className="spinning" />
          Carregando funcionários...
        </div>
      </div>
    );
  }

  return (
    <div className="funcionario-management">
      <div className="funcionario-management-header">
        <div className="funcionario-header-info">
          <h1>
            <FaUsers /> Gerenciar Funcionários
          </h1>
          <p>Gerencie zeladores e suas tarefas atribuídas</p>
        </div>
        <div className="funcionario-header-actions">
          <button
            className="refresh-button"
            onClick={loadData}
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
          <button
            className="add-funcionario-button"
            onClick={handleCreateZelador}
          >
            <FaPlus />
            Novo Funcionário
          </button>
        </div>
      </div>

      <div className="funcionario-filters">
        <div className="filters-grid">
          <div className="filter-group">
            <label>Buscar Funcionário</label>
            <div className="search-input-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar por nome ou email"
              />
            </div>
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
        <div className="filter-actions">
          <button className="filter-button filter-clear" onClick={clearFilters}>
            Limpar Filtros
          </button>
        </div>
      </div>

      <div className="funcionario-stats">
        <div className="stat-card stat-total">
          <div className="stat-number">{filteredZeladores.length}</div>
          <div className="stat-label">Total de Zeladores</div>
        </div>
        <div className="stat-card stat-with-tasks">
          <div className="stat-number">
            {filteredZeladores.filter((z) => (z.totalTasks || 0) > 0).length}
          </div>
          <div className="stat-label">Com Tarefas</div>
        </div>
        <div className="stat-card stat-available">
          <div className="stat-number">
            {filteredZeladores.filter((z) => (z.totalTasks || 0) === 0).length}
          </div>
          <div className="stat-label">Disponíveis</div>
        </div>
      </div>

      <div className="funcionarios-section">
        <div className="funcionarios-header">
          <div className="header-title">
            <h2>Funcionários</h2>
            <div className="funcionarios-count">
              {filteredZeladores.length} funcionários(s) encontrado(s)
            </div>
          </div>
        </div>

        {error && (
          <div className="error-container">
            <div className="error-message">{error}</div>
          </div>
        )}

        <div className="funcionarios-grid">
          {filteredZeladores.length === 0 ? (
            <div className="empty-state">
              <FaUsers className="empty-icon" />
              <h3>Nenhum funcionário encontrado</h3>
              <p>
                {searchTerm || selectedSetor
                  ? "Tente ajustar os filtros de busca"
                  : "Comece adicionando um novo funcionário"}
              </p>
              {!searchTerm && !selectedSetor && (
                <button
                  className="add-funcionario-button"
                  onClick={handleCreateZelador}
                >
                  <FaPlus />
                  Adicionar Primeiro Funcionário
                </button>
              )}
            </div>
          ) : (
            filteredZeladores.map((zelador) => (
              <div key={zelador.id} className="funcionario-card">
                <div className="funcionario-card-header">
                  <div className="funcionario-avatar">
                    {zelador.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="funcionario-info">
                    <h3>{zelador.name}</h3>
                    <p className="funcionario-email">{zelador.email}</p>
                    {zelador.setor && (
                      <div className="funcionario-setor">
                        <FaBuilding />
                        {zelador.setor}
                      </div>
                    )}
                    {/* Status de ativação */}
                    <div className="funcionario-status">
                      {(() => {
                        if (zelador.needsAccountCreation) {
                          return (
                            <span className="status-pending">
                              ⏳ Aguardando ativação
                            </span>
                          );
                        } else if (zelador.isActive) {
                          return (
                            <span className="status-active">✅ Ativo</span>
                          );
                        } else {
                          return (
                            <span className="status-inactive">❌ Inativo</span>
                          );
                        }
                      })()}
                    </div>
                  </div>
                </div>

                <div className="funcionario-stats">
                  <div className="stat-item">
                    <span className="stat-value">
                      {zelador.totalTasks || 0}
                    </span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-item pending">
                    <span className="stat-value">
                      {zelador.pendingTasks || 0}
                    </span>
                    <span className="stat-label">Pendentes</span>
                  </div>
                  <div className="stat-item completed">
                    <span className="stat-value">
                      {zelador.completedTasks || 0}
                    </span>
                    <span className="stat-label">Concluídas</span>
                  </div>
                  <div className="stat-item overdue">
                    <span className="stat-value">
                      {zelador.overdueTasks || 0}
                    </span>
                    <span className="stat-label">Atrasadas</span>
                  </div>
                </div>

                <div className="funcionario-actions">
                  <button
                    className="action-button view-tasks"
                    onClick={() => handleViewTasks(zelador)}
                    title="Ver tarefas"
                  >
                    <FaEye />
                    Ver Tarefas
                  </button>
                  <button
                    className="action-button edit"
                    onClick={() => handleEditZelador(zelador)}
                    title="Editar funcionário"
                  >
                    <FaEdit />
                    Editar
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteZelador(zelador)}
                    title="Excluir funcionário"
                  >
                    <FaTrash />
                    Excluir
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Funcionário */}
      <FuncionarioModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSuccess={handleModalSuccess}
        zelador={isEditMode ? selectedZelador : null}
      />

      {/* Modal de Tarefas do Zelador */}
      <ZeladorTasksModal
        isOpen={showTasksModal}
        onClose={handleCloseTasksModal}
        zelador={selectedZelador}
      />
    </div>
  );
};

export default FuncionarioManagement;
