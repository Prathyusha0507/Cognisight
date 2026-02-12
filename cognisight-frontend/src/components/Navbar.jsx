import React, { useState } from 'react';
import { Save, Download, Package } from 'lucide-react';
import { NAV_PAGES } from '../types/constants';
import { useIDEStore } from '../stores/ideStore';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import './Navbar.css';

export const Navbar = () => {
  const [activePage, setActivePage] = useState('home');
  // ✅ Get 'files' (which is the whole project tree)
  const { activeFile, saveFile, currentProject } = useIDEStore();

  const handleSave = async () => {
    if (activeFile) {
      await saveFile(activeFile.path, activeFile.content);
      console.log('File saved');
    }
  };

  const handleExportProject = async () => {
    // 1. Get the project files from the store
    const projectFiles = currentProject?.files;

    if (!projectFiles || Object.keys(projectFiles).length === 0) {
      alert("No files found in the project to export.");
      return;
    }

    const zip = new JSZip();
    const projectName = currentProject?.name || 'cognisight-project';

    // 2. Recursive function to traverse nested file objects
    const addFilesToZip = (folder, currentPath, zipFolder) => {
      Object.entries(folder).forEach(([name, content]) => {
        if (typeof content === 'string') {
          // It's a file
          zipFolder.file(name, content);
        } else if (typeof content === 'object' && content !== null) {
          // It's a folder -> create zip folder and recurse
          const newZipFolder = zipFolder.folder(name);
          addFilesToZip(content, `${currentPath}/${name}`, newZipFolder);
        }
      });
    };

    // 3. Start recursion
    try {
      addFilesToZip(projectFiles, '', zip);
      
      // 4. Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${projectName}.zip`);
    } catch (error) {
      console.error("Export Failed:", error);
      alert("Failed to create zip file.");
    }
  };
  

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <div className="navbar__logo-icon">C</div>
        <span>Cognisight</span>
      </div>

      {/* <div className="navbar__nav">
        {NAV_PAGES.map((page) => (
          <button
            key={page.id}
            onClick={() => setActivePage(page.id)}
            className={`navbar__link ${activePage === page.id ? 'navbar__link--active' : ''}`}
          >
            {page.label}
          </button>
        ))}
      </div> */}

      <div className="navbar__actions">
        {currentProject && (
          <div className="navbar__project-name">
            <Package size={14} />
            {currentProject.name}
          </div>
        )}

        <button 
          className={`navbar__btn ${!activeFile ? 'navbar__btn--disabled' : ''}`} 
          onClick={handleSave} 
          disabled={!activeFile}
          title={activeFile ? "Save Current File" : "No file open"}
        >
          <Save size={16} />
          <span>Save</span>
        </button>

        <button 
          className="navbar__btn navbar__btn--primary" 
          onClick={handleExportProject} 
          title="Download Project as ZIP"
        >
          <Download size={16} />
          <span>Export Zip</span>
        </button>
      </div>
    </nav>
  );
};