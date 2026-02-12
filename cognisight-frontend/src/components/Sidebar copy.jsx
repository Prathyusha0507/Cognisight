import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { ChevronRight, ChevronDown, Folder, Plus, Trash2, FolderOpen, ArrowLeft, Terminal, FolderPlus, FilePlus, ExternalLink, Menu, X } from 'lucide-react';
import { useIDEStore } from '../stores/ideStore';
import { FILETYPES } from '../types/constants';
import './Sidebar.css';

// Helper function builds file tree with stable keys
const buildFileTree = (files, path = '') => {
  const tree = [];
  if (!files || typeof files !== 'object') return tree;

  for (const [name, content] of Object.entries(files)) {
    const fullPath = path ? `${path}/${name}` : name;
    const uniqueKey = `${fullPath}-${typeof content === 'string' ? 'file' : 'folder'}`;

    if (typeof content === 'string') {
      tree.push({ 
        key: uniqueKey,
        name, 
        type: 'file', 
        path: fullPath, 
        content 
      });
    } else if (typeof content === 'object' && content !== null) {
      tree.push({
        key: uniqueKey,
        name,
        type: 'folder',
        path: fullPath,
        children: buildFileTree(content, fullPath)
      });
    }
  }
  return tree;
};

// Get file icon with safety checks
const getFileIcon = (name) => {
  const ext = name.split('.').pop()?.toLowerCase();
  const fileType = FILETYPES?.[ext];
  return fileType ? <span className="file-icon">{fileType.icon}</span> : <span className="file-icon">📄</span>;
};

// Context menu for file/folder operations
const ContextMenu = React.memo(({ item, position, onClose, onDelete }) => {
  if (!position) return null;

  return (
    <div 
      className="context-menu" 
      style={{ top: position.y, left: position.x }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="context-menu__item" onClick={() => { console.log('Rename:', item.path); onClose(); }}>
        ✏️ Rename
      </button>
      <button className="context-menu__item" onClick={() => { onDelete(item.path, item.type); onClose(); }}>
        🗑️ Delete
      </button>
      {item.type === 'folder' && (
        <button className="context-menu__item" onClick={() => { onClose(); }}>
          📂 Open Folder
        </button>
      )}
    </div>
  );
});

ContextMenu.displayName = 'ContextMenu';

// Menu Dropdown Component
const MenuDropdown = React.memo(({ isOpen, onClose, onBackToProjects, onNewFile, onNewFolder, onOpenFolder, onTerminal }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="menu-overlay" onClick={onClose} />
      <div className="menu-dropdown">
        <button className="menu-dropdown__item" onClick={() => { onBackToProjects(); onClose(); }}>
          <ArrowLeft size={16} /> Back to Projects
        </button>
        <div className="menu-dropdown__divider" />
        <button className="menu-dropdown__item" onClick={() => { onNewFile(); onClose(); }}>
          <FilePlus size={16} /> New File
        </button>
        <button className="menu-dropdown__item" onClick={() => { onNewFolder(); onClose(); }}>
          <FolderPlus size={16} /> New Folder
        </button>
        <button className="menu-dropdown__item" onClick={() => { onOpenFolder(); onClose(); }}>
          <ExternalLink size={16} /> Open Folder
        </button>
        <button className="menu-dropdown__item" onClick={() => { onTerminal(); onClose(); }}>
          <Terminal size={16} /> Terminal
        </button>
      </div>
    </>
  );
});

MenuDropdown.displayName = 'MenuDropdown';

// File tree item component with memoization
const FileTreeItem = React.memo(({ item, depth = 0, onFileClick, onFolderToggle, expandedFolders, activeFile, onContextMenu }) => {
  const isExpanded = expandedFolders.has(item.key);
  const isActive = activeFile?.path === item.path;

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(item, { x: e.clientX, y: e.clientY });
  };

  if (item.type === 'file') {
    return (
      <button
        key={item.key}
        className={`file-tree__file ${isActive ? 'file-tree__file--active' : ''}`}
        onClick={() => onFileClick(item.path)}
        onContextMenu={handleContextMenu}
        title={item.name}
      >
        <span className="file-tree__file-icon">{getFileIcon(item.name)}</span>
        <span>{item.name}</span>
      </button>
    );
  }

  return (
    <div key={item.key} className="file-tree__item">
      <button
        className={`file-tree__folder ${isExpanded ? 'expanded' : ''}`}
        onClick={() => onFolderToggle(item.key)}
        onContextMenu={handleContextMenu}
        title={item.name}
      >
        <span className="file-tree__folder-icon">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>
        <span className="file-tree__folder-icon" style={{ color: '#f59e0b' }}>
          {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
        </span>
        <span>{item.name}</span>
      </button>
      {isExpanded && item.children && (
        <div className={`file-tree__item--nested-${Math.min(depth + 1, 3)}`}>
          {item.children.map((child) => (
            <FileTreeItem
              key={child.key}
              item={child}
              depth={depth + 1}
              onFileClick={onFileClick}
              onFolderToggle={onFolderToggle}
              expandedFolders={expandedFolders}
              activeFile={activeFile}
              onContextMenu={onContextMenu}
            />
          ))}
        </div>
      )}
    </div>
  );
});

FileTreeItem.displayName = 'FileTreeItem';

// Main Sidebar component with proper state management
function Sidebar() {
  const {
    currentProject,
    activeFile,
    openFile,
    progress,
    createFile,
    createFolder,
    deleteFile,
    deleteFolder,
    setCurrentProject,
    createTerminal,
  } = useIDEStore();

  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [contextMenu, setContextMenu] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Rebuild file tree whenever currentProject or its files changes
  const fileTree = useMemo(() => {
    // defensive checks
    if (!currentProject?.files) return [];
    return buildFileTree(currentProject.files);
  }, [currentProject?.files, currentProject?.id]);

  // Reset expanded folders when project changes
  useEffect(() => {
    setExpandedFolders(new Set());
  }, [currentProject?.id]);

  const handleFileClick = useCallback(
    (filePath) => {
      openFile(filePath);
    },
    [openFile]
  );

  const handleFolderToggle = useCallback((key) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  const handleBackToProjects = useCallback(() => {
    setCurrentProject(null);
    setExpandedFolders(new Set());
  }, [setCurrentProject]);

  const handleCreateFile = useCallback(async () => {
    const fileName = prompt('Enter file name: (e.g. src/App.jsx)');
    if (fileName?.trim()) {
      await createFile(fileName.trim(), '// New file\\n');
    }
  }, [createFile]);

  const handleCreateFolder = useCallback(async () => {
    const folderName = prompt('Enter folder name: (e.g. src/components)');
    if (folderName?.trim()) {
      await createFolder(folderName.trim());
    }
  }, [createFolder]);

  const handleDelete = useCallback(async (path, type) => {
    if (window.confirm(`Are you sure you want to delete "${path}"?`)) {
      if (type === 'file') {
        await deleteFile(path);
      } else {
        await deleteFolder(path);
      }
    }
  }, [deleteFile, deleteFolder]);

  const handleContextMenu = useCallback((item, position) => {
    setContextMenu({ item, position });
  }, []);

  const handleOpenTerminal = useCallback(() => {
    createTerminal();
  }, [createTerminal]);

  const handleOpenFolder = useCallback(() => {
    alert('Open folder functionality - integrate with backend explorer if needed');
  }, []);

  if (!currentProject) {
    return (
      <aside className="sidebar">
        <div className="sidebar__progress">
          <div className="sidebar__progress-label">Project Progress</div>
          <div className="sidebar__progress-bar">
            <div className="sidebar__progress-fill" style={{ width: '0%' }}></div>
          </div>
          <div className="sidebar__progress-text">No project loaded</div>
        </div>
        <div className="sidebar__actions">
          <p className="sidebar__empty">Select or create a project to get started</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar">
      {/* Header with Menu Button */}
      <div className="sidebar__header">
        <h3 className="sidebar__project-name">{currentProject.name}</h3>
        <button 
          className="sidebar__menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Menu"
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Menu Dropdown */}
      <MenuDropdown
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onBackToProjects={handleBackToProjects}
        onNewFile={handleCreateFile}
        onNewFolder={handleCreateFolder}
        onOpenFolder={handleOpenFolder}
        onTerminal={handleOpenTerminal}
      />

      {/* Progress Section */}
      <div className="sidebar__progress">
        <div className="sidebar__progress-label">Progress</div>
        <div className="sidebar__progress-bar">
          <div 
            className="sidebar__progress-fill" 
            style={{ width: `${Math.min(progress, 100)}%` }}
          ></div>
        </div>
        <div className="sidebar__progress-text">{progress}%</div>
      </div>

      {/* Files Section */}
      <div className="sidebar__files">
        <div className="sidebar__files-label">📁 Files</div>
        {fileTree.length === 0 ? (
          <p className="sidebar__empty">No files in project</p>
        ) : (
          fileTree.map((item) => (
            <FileTreeItem
              key={item.key}
              item={item}
              depth={0}
              onFileClick={handleFileClick}
              onFolderToggle={handleFolderToggle}
              expandedFolders={expandedFolders}
              activeFile={activeFile}
              onContextMenu={handleContextMenu}
            />
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          item={contextMenu.item}
          position={contextMenu.position}
          onClose={() => setContextMenu(null)}
          onDelete={handleDelete}
        />
      )}
    </aside>
  );
}

export { Sidebar };
export default Sidebar;
