import React, { useRef, useEffect, useCallback, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useIDEStore } from '../stores/ideStore';
import { io } from "socket.io-client";
import './Terminal.css';

// Initialize socket outside component
const socket = io("http://localhost:5000");

export const Terminal = () => {
  const {
    terminals,
    activeTerminal,
    currentProject,
    createTerminal,
    setActiveTerminal,
    closeTerminal,
    clearTerminal,
    addTerminalOutput
  } = useIDEStore();

  const contentRef = useRef(null);
  const inputRef = useRef(null);

  // --- RESIZE LOGIC START ---
  const [height, setHeight] = useState(250); // Default starting height
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef({ startY: 0, startHeight: 0 });

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    // Capture initial positions
    sidebarRef.current = {
      startY: e.clientY,
      startHeight: height
    };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none'; // Prevent text selection while dragging
  }, [height]);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, []);

  const resize = useCallback((e) => {
    if (isResizing) {
      // Calculate how much the mouse moved (Up is negative Y, so we invert delta)
      const delta = sidebarRef.current.startY - e.clientY;
      const newHeight = sidebarRef.current.startHeight + delta;

      // Constraints: Min 100px, Max 800px
      if (newHeight > 100 && newHeight < 800) {
        setHeight(newHeight);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);
  // --- RESIZE LOGIC END ---

  // 1. Socket Listener
  useEffect(() => {
    const handleData = ({ id, data }) => {
      if (data.includes("--- Terminal Cleared ---")) {
        clearTerminal(id);
        return;
      }
      addTerminalOutput(id, data, 'stdout');
    };

    socket.on("terminal:data", handleData);
    return () => socket.off("terminal:data", handleData);
  }, [addTerminalOutput, clearTerminal]);

  // 2. Auto-create & Scroll
  useEffect(() => {
    if (terminals.length === 0) createTerminal();
  }, [terminals.length, createTerminal]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [activeTerminal?.output]);

  // 3. Command Handling
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const command = inputRef.current?.value?.trim();
    if (!command || !activeTerminal) return;
    
    if (!currentProject) {
      addTerminalOutput(activeTerminal.id, '❌ No project loaded!', 'stderr');
      return;
    }

    if (command === 'cls' || command === 'clear') {
       clearTerminal(activeTerminal.id);
       if (inputRef.current) inputRef.current.value = '';
       socket.emit("terminal:write", { id: activeTerminal.id, command: command, projectId: currentProject.id });
       return;
    }

    addTerminalOutput(activeTerminal.id, `$ ${command}`, 'input');
    if (inputRef.current) inputRef.current.value = '';

    socket.emit("terminal:write", { 
      id: activeTerminal.id, 
      command: command, 
      projectId: currentProject.id 
    });
  }, [activeTerminal, currentProject, addTerminalOutput, clearTerminal]);

  const handleNewTerminal = () => createTerminal();
  
  // RENDER
  if (!activeTerminal) {
    return (
      <div className="terminal-container" style={{ height: `${height}px` }}>
        <div className="terminal-resize-handle" onMouseDown={startResizing} />
        <div className="terminal-empty">
          <Plus className="terminal-empty-icon" />
          <h3>No terminals open</h3>
          <button onClick={handleNewTerminal} className="btn--primary">New Terminal</button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="terminal-container" 
      style={{ height: `${height}px`, minHeight: '100px' }}
    >
      {/* DRAG HANDLE */}
      <div className="terminal-resize-handle" onMouseDown={startResizing}>
        <div className="terminal-resize-line"></div>
      </div>

      <div className="terminal-header">
        <div className="terminal-tabs">
          {terminals.map((terminal) => (
            <button
              key={terminal.id}
              className={`terminal-tab ${activeTerminal.id === terminal.id ? 'active' : ''}`}
              onClick={() => setActiveTerminal(terminal)}
            >
              <span className="terminal-tab-name">terminal-{terminal.id}</span>
              {activeTerminal.id === terminal.id && (
                <X className="terminal-tab-close" onClick={(e) => { e.stopPropagation(); closeTerminal(terminal.id); }} />
              )}
            </button>
          ))}
          <button onClick={handleNewTerminal} className="terminal-tab-new"><Plus size={14} /></button>
        </div>
        <div className="terminal-controls">
          <button onClick={() => clearTerminal(activeTerminal.id)}><Trash2 size={16} /></button>
        </div>
      </div>

      <div className="terminal-content" ref={contentRef}>
        {activeTerminal.output.map((line, index) => (
          <div key={index} className={`terminal-line terminal-line--${line.type}`}>
            <span>{line.text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="terminal-input-form">
        <div className="terminal-prompt">
          <span className="terminal-user">user@codeflow:</span>
          <span className="terminal-path">~</span>
          <span className="terminal-dollar">$</span>
        </div>
        <input ref={inputRef} type="text" className="terminal-input" autoFocus placeholder="Type a command..." autoComplete="off" />
      </form>
    </div>
  );
};