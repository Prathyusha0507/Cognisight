import React, { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar copy';
import { CodeEditor as Editor } from '../components/Editor';
import { Terminal } from '../components/Terminal';
import { AIAssistant } from '../components/AIAssistant';
import { ProjectsList } from '../components/ProjectsList';
import { CreateProjectModal } from '../components/CreateProjectModal';
import { useIDEStore } from '../stores/ideStore';
import { useShallow } from 'zustand/shallow';
import '../styels/App.css';

export function IDE() {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    currentProject,
    fetchProjects,
    openEmptyProject,
    restoreCurrentProject
  } = useIDEStore(
    useShallow(state => ({
      currentProject: state.currentProject,
      fetchProjects: state.fetchProjects,
      openEmptyProject: state.openEmptyProject,
      restoreCurrentProject: state.restoreCurrentProject
    }))
  );

  useEffect(() => {
    restoreCurrentProject();
    fetchProjects();
  }, [restoreCurrentProject, fetchProjects]);

  if (!currentProject) {
    return (
      <div className="app">
        <ProjectsList
          onNewProject={() => setShowCreateModal(true)}
          onOpenEmptyProject={openEmptyProject}
        />
        {showCreateModal && (
          <CreateProjectModal onClose={() => setShowCreateModal(false)} />
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Navbar />
      <div className="app-main">
        <Sidebar />
        <div className="app-editor-section">
          <Editor />
          <Terminal />
        </div>
      </div>
      <AIAssistant />
    </div>
  );
}
