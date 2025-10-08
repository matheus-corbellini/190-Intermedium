"use client";

import React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/UseAuth";
import "./Sidebar.css";
import { useNavigation } from "../../hooks/useNavigation";
import { taskService } from "../../services/TaskService";
import { TaskStatus } from "../../types/Task";
import {
  FaBars,
  FaTimes,
  FaTasks,
  FaClipboardList,
  FaChartBar,
  FaHistory,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaExclamationTriangle,
} from "react-icons/fa";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (seciton: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingTasks, setPendingTasks] = useState(0);
  const [overdueTasks, setOverdueTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const { user, logout } = useAuth();
  const { goTo } = useNavigation();

  // Carregar tarefas reais do usuário
  useEffect(() => {
    if (!user) return;

    const loadTaskStats = async () => {
      try {
        const userTasks = await taskService.getByZelador(user.email);
        setPendingTasks(
          userTasks.filter((t) => t.status === TaskStatus.PENDING).length
        );
        setOverdueTasks(
          userTasks.filter((t) => t.status === TaskStatus.OVERDUE).length
        );
        setCompletedTasks(
          userTasks.filter((t) => t.status === TaskStatus.COMPLETED).length
        );
      } catch (error) {
        console.error("Erro ao carregar estatísticas:", error);
      }
    };

    loadTaskStats();
  }, [user]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    goTo("/login");
  };

  const handleSectionChange = (section: string) => {
    onSectionChange(section);
    setIsOpen(false);
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: FaTasks,
      badge: pendingTasks > 0 ? pendingTasks : null,
      badgeType: "pending",
    },
    {
      id: "tasks",
      label: "Minhas Tarefas",
      icon: FaClipboardList,
      badge: overdueTasks > 0 ? overdueTasks : null,
      badgeType: "overdue",
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FaChartBar,
      badge: completedTasks > 0 ? completedTasks : null,
      badgeType: "completed",
    },
    {
      id: "history",
      label: "Histórico",
      icon: FaHistory,
    },
    {
      id: "profile",
      label: "Meu Perfil",
      icon: FaUser,
    },
    {
      id: "settings",
      label: "Configurações",
      icon: FaCog,
    },
  ];

  return (
    <>
      <button
        className={`sidebar-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <h2>Olá, {user.name}!</h2>
          <p>{user.setor}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleSectionChange(item.id)}
            >
              <span className="nav-item-icon">
                <item.icon />
              </span>
              <span className="nav-item-text">{item.label}</span>
              {item.badge && (
                <span className={`nav-item-badge ${item.badgeType}`}>
                  {item.badge}
                  {item.badgeType === "overdue" && (
                    <FaExclamationTriangle style={{ marginLeft: 4 }} />
                  )}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-nav-button" onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: 12 }} />
            Sair
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
