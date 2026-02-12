import React, { useState } from 'react';
import { useIDEStore } from '../stores/ideStore';
import './Models.css';

export const CreateProjectModal = ({ onClose }) => {
  const [projectType, setProjectType] = useState('react-vite');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const { createProject } = useIDEStore();

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Project name is required');
      return;
    }

    setLoading(true);
    const result = await createProject(name, description, projectType);
    setLoading(false);

    if (result) {
      onClose();
    } else {
      alert('Failed to create project. Please try again.');
    }
  };

  const projectTypes = [
    {
      id: 'react-vite',
      label: 'React + Vite',
      icon: '⚛️',
      desc: 'Fast React development',
    },
    {
      id: 'node-express',
      label: 'Node + Express',
      icon: '🚀',
      desc: 'Backend with Node.js',
    },
    {
      id: 'custom',
      label: 'Empty Project',
      icon: '📦',
      desc: 'Start from scratch',
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-title">
          <span>🚀</span> Create New Project
        </div>

        {/* Modal Content */}
        <div className="modal--scrollable">
          {/* Project Type Selection */}
          <div className="project-types">
            {projectTypes.map((type) => (
              <div
                key={type.id}
                className={`project-type ${
                  projectType === type.id ? 'project-type--active' : ''
                }`}
                onClick={() => setProjectType(type.id)}
              >
                <span className="project-type-icon">{type.icon}</span>
                <h4 className="project-type-label">{type.label}</h4>
                <p className="project-type-desc">{type.desc}</p>
              </div>
            ))}
          </div>

          {/* Project Name Field */}
          <div className="modal-field">
            <label className="modal-label">Project Name</label>
            <input
              type="text"
              className="modal-input"
              placeholder="e.g., my-awesome-app"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Project Description Field */}
          <div className="modal-field">
            <label className="modal-label">Description</label>
            <textarea
              className="modal-input"
              placeholder="What's this project about?"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className="modal-actions">
          <button className="btn--secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn--primary"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
};