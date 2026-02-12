import React, { useCallback, useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { useIDEStore } from '../stores/ideStore';
import './Editor.css';

// Syntax Highlighting Imports
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup'; // HTML

export const CodeEditor = () => {
  const { openFiles, activeFile, updateFileContent, closeFile, saveFile, setActiveFile } = useIDEStore();
  const [editorContent, setEditorContent] = useState('');
  
  // Ref for syncing scroll with line numbers
  const gutterRef = useRef(null);

  useEffect(() => {
    if (activeFile) {
      setEditorContent(activeFile.content);
    }
  }, [activeFile?.path]);

  const handleEditorChange = (newContent) => {
    setEditorContent(newContent);
    if (activeFile) {
      updateFileContent(activeFile.path, newContent);
    }
  };

  const handleSave = useCallback((e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (activeFile) {
        saveFile(activeFile.path, editorContent);
      }
    }
  }, [activeFile, editorContent, saveFile]);

  // ✅ SCROLL FIX: Handle scroll on the container div
  const handleScroll = (e) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleTabClick = (file) => setActiveFile(file);
  
  const handleCloseTab = (e, filePath) => {
    e.stopPropagation();
    closeFile(filePath);
  };

  const getLanguage = (path) => {
    if (!path) return languages.js;
    if (path.endsWith('.py')) return languages.python;
    if (path.endsWith('.css')) return languages.css;
    if (path.endsWith('.html')) return languages.markup;
    return languages.js;
  };

  const lineNumbers = editorContent.split('\n').map((_, i) => i + 1);

  if (!activeFile || openFiles.length === 0) {
    return (
      <div className="editor">
        <div className="editor-empty">
          <div className="editor-empty-icon">📝</div>
          <h2>No File Open</h2>
          <p>Select a file from the sidebar to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor">
      {/* Tabs */}
      <div className="editor-tabs">
        {openFiles.map((file) => (
          <div
            key={file.path}
            className={`editor-tab ${activeFile?.path === file.path ? 'editor-tab--active' : ''}`}
            onClick={() => handleTabClick(file)}
            title={file.path}
          >
            <span className="editor-tab-name">
              {file.path.split('/').pop()}
            </span>
            {file.unsaved && <span className="editor-tab-unsaved">●</span>}
            <button
              className="editor-tab-close"
              onClick={(e) => handleCloseTab(e, file.path)}
              title="Close file"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="editor-content">
        {/* Line Number Gutter */}
        <div className="editor-gutter" ref={gutterRef}>
          {lineNumbers.map((num) => (
            <div key={num} className="editor-line-number">{num}</div>
          ))}
        </div>

        {/* Syntax Highlighted Editor */}
        <div 
          className="editor-container" 
          onScroll={handleScroll}
        >
          <Editor
            value={editorContent}
            onValueChange={handleEditorChange}
            highlight={code => highlight(code, getLanguage(activeFile.path))}
            padding={24}
            className="editor-textarea"
            textareaClassName="editor-textarea-shim"
            onKeyDown={handleSave}
            style={{
              fontFamily: 'var(--font-code)',
              fontSize: 14,
              backgroundColor: 'transparent',
              minHeight: '100%', 
              overflow: 'hidden' /* ✅ CRITICAL: Prevents double scrollbars */
            }}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className="editor-status-bar">
        <span>{activeFile?.path}</span>
        <span>{lineNumbers.length} lines</span>
        <span>{editorContent.length} characters</span>
      </div>
    </div>
  );
};