// TemplateSelector.jsx
import React, { useState, useRef } from 'react';
import { Upload, FileText, ArrowRight, LayoutTemplate } from 'lucide-react';

const API_URL = 'http://localhost:8000';

function TemplateSelector({ onConfigured }) {
  const [mode, setMode] = useState('standard'); // 'standard' | 'custom'
  const [customHeadings, setCustomHeadings] = useState([]);
  const [extracting, setExtracting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const STANDARD_HEADINGS = [
    'Introduction & Overview',
    'System Architecture',
    'Database Schema',
    'API Endpoints',
    'Authentication & Security',
    'Setup & Installation',
    'Future Improvements'
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setExtracting(true);
    setError('');
    
    try {
      const fd = new FormData();
      fd.append('template_file', file);
      
      const res = await fetch(`${API_URL}/extract-headings`, { method: 'POST', body: fd });
      if (!res.ok) throw new Error("Failed to parse template file");
      
      const data = await res.json();
      if (data.headings && data.headings.length > 0) {
        setCustomHeadings(data.headings);
        setMode('custom');
      } else {
        setError("No headings found in file. Ensure headers are formatted correctly.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  };

  const handleProceed = () => {
    const headings = mode === 'custom' ? customHeadings : STANDARD_HEADINGS;
    onConfigured({ headings, projectZip: null }); // projectZip handled in next step
  };

  return (
    <div className="doc-container">
      <div className="doc-header">
        <h1><LayoutTemplate size={24}/> Select Template</h1>
        <p>Choose the structure for your documentation.</p>
      </div>

      <div className="template-grid">
        {/* Standard Option */}
        <div className={`template-card ${mode === 'standard' ? 'active' : ''}`}
             onClick={() => setMode('standard')}>
          <div className="icon-wrapper"><FileText size={32}/></div>
          <h3>Standard Structure</h3>
          <p>Best for general web/software projects.</p>
          <ul className="mini-list">
            {STANDARD_HEADINGS.slice(0,4).map(h => <li key={h}>{h}</li>)}
            <li>+3 more</li>
          </ul>
        </div>

        {/* Custom Option */}
        <div className={`template-card ${mode === 'custom' ? 'active' : ''}`}
             onClick={() => fileInputRef.current?.click()}>
          <div className="icon-wrapper"><Upload size={32}/></div>
          <h3>Upload Template</h3>
          <p>Extract headings from an existing PDF or Word doc.</p>
          <input ref={fileInputRef} type="file" hidden accept=".pdf,.docx" onChange={handleFileUpload}/>
          
          {extracting && <p className="status-text">Extracting...</p>}
          
          {customHeadings.length > 0 && mode === 'custom' && (
            <div className="extracted-preview">
              <strong>Found {customHeadings.length} sections:</strong>
              <p>{customHeadings[0]}...</p>
            </div>
          )}
        </div>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <div className="doc-action-buttons">
        <button className="doc-btn doc-btn--primary doc-btn--lg doc-btn--full" onClick={handleProceed}>
          Next Step <ArrowRight size={18}/>
        </button>
      </div>
    </div>
  );
}

export default TemplateSelector;