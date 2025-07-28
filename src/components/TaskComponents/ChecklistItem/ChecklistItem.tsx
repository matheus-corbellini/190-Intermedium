"use client";

import React from "react";
import "./ChecklistItem.css";
import { useState } from "react";
import { type ChecklistItem, ChecklistItemStatus } from "../../../types/Task";
import { FaCamera, FaWrench } from "react-icons/fa";

interface ChecklistItemProps {
  item: ChecklistItem;
  onUpdate: (updateItem: ChecklistItem) => void;
}

const ChecklistItemComponent: React.FC<ChecklistItemProps> = ({
  item,
  onUpdate,
}) => {
  const [observation, setObservation] = useState(item.observation || "");
  const [photos, setPhotos] = useState<string[]>(item.photos || []);

  const handleStatusChange = (status: ChecklistItemStatus) => {
    const updateItem = {
      ...item,
      status,
      observation:
        status === ChecklistItemStatus.NOT_COMPLIANT ? observation : undefined,
      photos: photos.length > 0 ? photos : undefined,
    };
    onUpdate(updateItem);
  };

  const handleObservationChange = (value: string) => {
    setObservation(value);
    if (item.status === ChecklistItemStatus.NOT_COMPLIANT) {
      onUpdate({
        ...item,
        observation: value,
      });
    }
  };

  const handleAddPhoto = () => {
    const mockPhotoId = `photo_${Date.now()}`;
    const newPhotos = [...photos, mockPhotoId];
    setPhotos(newPhotos);
    onUpdate({
      ...item,
      photos: newPhotos,
    });
  };

  return (
    <div className="checklist-item">
      <div className="item-header">
        <div className="item-question">
          <h4>
            {item.question}
            {item.isEquipment && (
              <span className="equipment-badge">
                <FaWrench style={{ marginRight: 4 }} />
                {item.equipmentName}
              </span>
            )}
          </h4>
        </div>
        <div className="item-status">
          <button
            className={`status-button status-ok ${
              item.status === ChecklistItemStatus.OK ? "active" : ""
            }`}
            onClick={() => handleStatusChange(ChecklistItemStatus.OK)}
          >
            OK
          </button>
          <button
            className={`status-button status-not-compliant ${
              item.status === ChecklistItemStatus.NOT_COMPLIANT ? "active" : ""
            }`}
            onClick={() =>
              handleStatusChange(ChecklistItemStatus.NOT_COMPLIANT)
            }
          >
            Não Conforme
          </button>
        </div>
      </div>

      {item.status === ChecklistItemStatus.NOT_COMPLIANT && (
        <div className="observation-section">
          <label htmlFor={`obs-${item.id}`}>Observação (obrigatória):</label>
          <textarea
            id={`obs-${item.id}`}
            className="observation-textarea"
            value={observation}
            onChange={(e) => handleObservationChange(e.target.value)}
            placeholder="Descreva o problema encontrado..."
            required
          />
        </div>
      )}

      <div className="photo-section">
        <label>Fotos (opcional):</label>
        <button className="photo-button" onClick={handleAddPhoto}>
          <FaCamera />
          Tirar Foto
        </button>
        {photos.length > 0 && (
          <div className="photo-preview">
            {photos.map((photo, index) => (
              <div key={photo} className="photo-item">
                <div className="photo-placeholder">Foto {index + 1}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistItemComponent;
