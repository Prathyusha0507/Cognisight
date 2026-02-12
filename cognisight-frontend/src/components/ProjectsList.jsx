import React from 'react';
import { useIDEStore } from '../stores/ideStore';
import { Trash2 } from 'lucide-react';
import './ProjectsList.css';

export const ProjectsList = ({ onNewProject}) => {
  const { projects, setCurrentProject, deleteProject,fetchProjectById } = useIDEStore();

  const handleDelete = async (projectId, e) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProject(projectId);
    }
  };

  const getProjectIcon = (type) => {
    const icons = {
      'react-vite': '⚛️',
      'node-express': '🚀',
      'spring': '🍃',
      'custom': '📦',
      'react': '⚛️',
    };
    return icons[type] || '📦';
  };

  return (
    <div className="projects-list">
      <div className="projects-list__header">
        <h1 className="projects-list__title">💻 Cognisight IDE</h1>
        <p className="projects-list__subtitle">AI supported Development Environment</p>
      </div>

      <div className="projects-list__actions">
        <button className="btn btn--primary btn--large" onClick={onNewProject}>
          + New Project
        </button>
        
      </div>

      {projects.length > 0 && (
        <div className="projects-list__container">
          <h2 className="projects-list__section-title">Recent Projects</h2>
          <div className="projects-list__grid">
            {projects.map((project) => (
              <div
                key={project.id}
                className="project-card"
                onClick={async () => {
    const fullProject = await fetchProjectById(project.id);
    if (fullProject) {
      setCurrentProject(fullProject);
    }
  }}
              >
                <div className="project-card__header">
                  <div className="project-card__icon">
                    {getProjectIcon(project.type)}
                  </div>
                  <button
                    className="project-card__delete-btn"
                    onClick={(e) => handleDelete(project.id, e)}
                    title="Delete Project"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="project-card__content">
                  <h3 className="project-card__name">{project.name}</h3>
                  <p className="project-card__type">{project.type}</p>
                  
                  {project.description && (
                    <p className="project-card__description">{project.description}</p>
                  )}

                  <div className="project-card__meta">
                    <div className="project-card__progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-bar__fill"
                          style={{ width: `${project.progress || 0}%` }}
                        />
                      </div>
                      <span className="progress-text">{project.progress || 0}%</span>
                    </div>

                    {project.createdAt && (
                      <span className="project-card__date">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="project-card__footer">
                  <span className="project-card__badge">{project.type}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {projects.length === 0 && (
        <div className="projects-list__empty">
          <div className="projects-list__empty-icon">📁</div>
          <h2>No Projects Yet</h2>
          <p>Create your first project to get started with CodeFlow IDE</p>
      
            
           
      
        </div>
      )}
    </div>
  );
};