"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "../../../hooks/UseAuth";
import { useNavigation } from "../../../hooks/useNavigation";
import "./GerenteSidebar.css";
import {
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaBuilding,
  FaTasks,
  FaChartBar,
  FaSignOutAlt,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";

interface GerenteSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const GerenteSidebar: React.FC<GerenteSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { goTo } = useNavigation();

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
      icon: FaTachometerAlt,
    },
    {
      id: "funcionarios",
      label: "Gerenciar Funcionarios",
      icon: FaUsers,
    },
    {
      id: "setores",
      label: "Gerenciar Setores",
      icon: FaBuilding,
    },
    {
      id: "tasks",
      label: "Gerenciar Tarefas",
      icon: FaTasks,
    },
    {
      id: "atribuirTarefas",
      label: "Atribuir Tarefas",
      icon: FaUserCheck,
    },
    {
      id: "reports",
      label: "Relatórios",
      icon: FaChartBar,
    },
  ];

  return (
    <>
      <button
        className={`gerente-sidebar-toggle ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`gerente-sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={() => setIsOpen(false)}
      />

      <div className={`gerente-sidebar-container ${isOpen ? "open" : ""}`}>
        <div className="gerente-sidebar-header">
          <h2>Painel Gerencial</h2>
          <p>
            {user.name} - {user.setor}
          </p>
        </div>

        <nav className="gerente-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`gerente-nav-item ${
                activeSection === item.id ? "active" : ""
              }`}
              onClick={() => handleSectionChange(item.id)}
            >
              <span className="gerente-nav-item-icon">
                <item.icon />
              </span>
              <span className="gerente-nav-item-text">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="gerente-sidebar-footer">
          <button className="gerente-logout-nav-button" onClick={handleLogout}>
            <FaSignOutAlt style={{ marginRight: 12 }} />
            Sair
          </button>
        </div>
      </div>
    </>
  );
};

export default GerenteSidebar;
