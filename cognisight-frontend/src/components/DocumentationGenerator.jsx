// DocumentationGenerator.jsx
import React, { useState, useRef } from 'react';
import { Download, Zap, FileText, CheckCircle, File, FileCode, Upload } from 'lucide-react';
import { jsPDF } from "jspdf";
import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  PageBreak,
  Footer,           // <--- Added for DOCX Footer
  //PageNumber,       // <--- Added for dynamic page numbers
  //NumberOfPages,    // <--- Added for total page count
  AlignmentType     // <--- Added for centering text
} from "docx"; 
import { saveAs } from "file-saver";
import './DocumentationGenerator.css'; 

const API_URL = 'http://localhost:8000';

function DocumentationGenerator({ templateConfig, onBack }) {
  const [selectedFile, setSelectedFile] = useState(templateConfig.projectZip || null);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [domain, setDomain] = useState('generic');
  
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [error, setError] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);

  const fileInputRef = useRef(null);

  // --- CLIENT SIDE GENERATORS ---

  const generatePDF = () => {
    if (!generatedData) return;
    const doc = new jsPDF();
    const { project_name, domain, sections } = generatedData;
    const sectionKeys = Object.keys(sections);

    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxLineWidth = pageWidth - margin * 2;

    // 1. Title Page
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text(project_name, pageWidth / 2, 60, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text(`Domain: ${domain}`, pageWidth / 2, 70, { align: "center" });
    doc.text("Technical Documentation", pageWidth / 2, 80, { align: "center" });
    
    // 2. Table of Contents
    doc.addPage();
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Table of Contents", margin, 20);
    doc.setLineWidth(0.5);
    doc.line(margin, 25, pageWidth - margin, 25);

    let tocY = 40;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    sectionKeys.forEach((heading, index) => {
        if (tocY > 270) { doc.addPage(); tocY = 20; }
        doc.text(`${index + 1}. ${heading}`, margin, tocY);
        tocY += 10;
    });

    // 3. Content Pages
    doc.addPage();
    let y = 20;

    Object.entries(sections).forEach(([heading, content]) => {
      if (y > 250) { doc.addPage(); y = 20; }

      // Section Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text(heading, margin, y);
      y += 10;
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      const lines = content.split('\n');
      doc.setFont("times", "normal");
      doc.setFontSize(12);

      lines.forEach(line => {
        if (y > 270) { doc.addPage(); y = 20; }

        line = line.trim();
        if (!line) return;

        if (line.startsWith('##')) {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(14);
          doc.text(line.replace(/#/g, '').trim(), margin, y);
          doc.setFont("times", "normal");
          doc.setFontSize(12);
          y += 8;
        } 
        else if (line.startsWith('```') || line.startsWith('import ') || line.includes('function ')) {
          doc.setFont("courier", "normal");
          doc.setFontSize(10);
          doc.setTextColor(50);
          const splitText = doc.splitTextToSize(line, maxLineWidth);
          doc.text(splitText, margin + 5, y);
          doc.setFont("times", "normal");
          doc.setFontSize(12);
          doc.setTextColor(0);
          y += splitText.length * 5;
        } 
        else if (line.startsWith('*') || line.startsWith('-')) {
            const cleanLine = "• " + line.replace(/^[*|-]\s*/, '');
            const splitText = doc.splitTextToSize(cleanLine, maxLineWidth);
            doc.text(splitText, margin + 5, y);
            y += splitText.length * 6;
        }
        else {
          const splitText = doc.splitTextToSize(line, maxLineWidth);
          doc.text(splitText, margin, y);
          y += splitText.length * 6;
        }
      });
      y += 15; 
    });

    // --- ADD PAGE NUMBERS TO FOOTER ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(
            `Page ${i} of ${totalPages}`, 
            pageWidth / 2, 
            pageHeight - 10, 
            { align: "center" }
        );
    }

    doc.save(`${project_name.replace(/\s+/g, '_')}_Documentation.pdf`);
  };

  const generateDOCX = () => {
    if (!generatedData) return;
    const { project_name, domain, sections } = generatedData;

    const docChildren = [
      new Paragraph({
        text: project_name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({
        text: `Domain: ${domain}`,
        alignment: AlignmentType.CENTER,
      }),
      new Paragraph({ text: "" }),
      
      new Paragraph({
        text: "Table of Contents",
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      })
    ];

    Object.keys(sections).forEach((heading, index) => {
        docChildren.push(new Paragraph({
            text: `${index + 1}. ${heading}`,
            spacing: { after: 120 }
        }));
    });

    docChildren.push(new Paragraph({ children: [new PageBreak()] }));

    Object.entries(sections).forEach(([heading, content]) => {
      docChildren.push(
        new Paragraph({
          text: heading,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
          border: { bottom: { color: "auto", space: 1, value: "single", size: 6 } }
        })
      );

      const lines = content.split('\n');
      lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        if (line.startsWith('##')) {
           docChildren.push(new Paragraph({
             text: line.replace(/#/g, '').trim(),
             heading: HeadingLevel.HEADING_2,
             spacing: { before: 200, after: 100 }
           }));
        } else if (line.startsWith('*') || line.startsWith('-')) {
           docChildren.push(new Paragraph({
             text: line.replace(/^[*|-]\s*/, ''),
             bullet: { level: 0 }
           }));
        } else {
           docChildren.push(new Paragraph({
             children: [new TextRun(line)],
             spacing: { after: 120 }
           }));
        }
      });
    });

    const doc = new Document({
      sections: [{ 
        properties: {}, 
        // --- ADD FOOTER WITH PAGE NUMBERS ---
        footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                            new TextRun("Page "),
                            new PageNumber(),
                            new TextRun(" of "),
                            new NumberOfPages(),
                        ],
                    }),
                ],
            }),
        },
        children: docChildren 
      }],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, `${project_name.replace(/\s+/g, '_')}_Documentation.docx`);
    });
  };

  const handleGenerate = async () => {
    if (!selectedFile || !projectName) {
      setError("Please provide a Project Name and Upload a ZIP file.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedData(null);
    setProgressText("Initializing AI models...");

    try {
      const formData = new FormData();
      formData.append('zip_file', selectedFile);
      formData.append('project_name', projectName);
      formData.append('project_description', projectDescription);
      formData.append('domain', domain);
      formData.append('template', templateConfig.headings.join('\n'));

      setProgressText("Analyzing code & Generating content...");

      const response = await fetch(`${API_URL}/generate-doc`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.detail || "Generation failed on server.");
      }

      const data = await response.json();
      setGeneratedData(data);
      setProgressText("Done!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (generatedData) {
    return (
      <div className="doc-container success-view">
        <div className="doc-content-wrapper" style={{textAlign: 'center', padding: 40}}>
          <CheckCircle size={64} color="#10B981" style={{marginBottom: 20, margin: '0 auto'}} />
          <h2>Content Generated!</h2>
          <p>The AI has analyzed <b>{generatedData.project_name}</b>. Choose a format to download:</p>
          
          <div className="doc-action-buttons" style={{justifyContent: 'center', marginTop: 30, gap: '20px'}}>
            <button className="doc-btn doc-btn--primary" onClick={generatePDF}>
              <File size={18} style={{marginRight:8}}/> Download PDF
            </button>
            <button className="doc-btn doc-btn--outline" onClick={generateDOCX}>
              <FileCode size={18} style={{marginRight:8}}/> Download DOCX
            </button>
          </div>
          
          <button style={{marginTop: 20, background:'none', border:'none', color:'#666', cursor:'pointer'}} 
            onClick={() => setGeneratedData(null)}>
            Start Over
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="doc-container">
      <div className="doc-header">
        <h1><Zap size={24}/> Generator Setup</h1>
        {onBack && <button className="doc-btn doc-btn--outline doc-btn--sm" onClick={onBack}>← Back</button>}
      </div>

      <div className="doc-content-wrapper">
        {error && <div className="doc-status doc-status--error">{error}</div>}
        
        <div className="doc-section">
          <h3>1. Project Details</h3>
          <div className="doc-form-row">
            <div className="doc-form-group">
              <label>Project Name</label>
              <input type="text" className="doc-form-input" 
                value={projectName} onChange={e => setProjectName(e.target.value)} 
                placeholder="e.g. Inventory System"/>
            </div>
            <div className="doc-form-group">
               <label>Domain</label>
               <select className="doc-form-input" value={domain} onChange={e => setDomain(e.target.value)}>
                 <option value="generic">Generic / Mixed</option>
                 <option value="web">Web Development</option>
                 <option value="datascience">Data Science</option>
                 <option value="enterprise">Enterprise Software</option>
               </select>
            </div>
          </div>
          <div className="doc-form-group">
            <label>Description (Optional context for AI)</label>
            <textarea className="doc-form-input" 
              value={projectDescription} onChange={e => setProjectDescription(e.target.value)}
              placeholder="Briefly describe what this project does..." />
          </div>
        </div>

        <div className="doc-section">
          <h3>2. Source Code</h3>
          {!selectedFile ? (
            <div 
              className="doc-upload-zone" 
              onClick={() => fileInputRef.current?.click()} 
              style={{cursor: 'pointer'}}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".zip" 
                style={{ display: 'none' }} 
                onChange={e => {
                   if(e.target.files?.[0]) setSelectedFile(e.target.files[0]);
                }}
              />
              <Upload size={32} color="#666" style={{marginBottom:10}} />
              <p>Click to Upload Project .zip</p>
            </div>
          ) : (
            <div className="file-chip">
              <FileText size={16}/> {selectedFile.name} 
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }} 
                style={{marginLeft:10, color:'red', background:'none', border:'none', cursor:'pointer'}}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="doc-section">
          <h3>3. Structure Preview</h3>
          <div className="heading-preview-list">
             {templateConfig.headings.map((h, i) => (
               <div key={i} className="heading-item"><small>{i+1}.</small> {h}</div>
             ))}
          </div>
        </div>

        {loading && (
          <div className="doc-progress-section">
            <div className="doc-spinner"></div>
            <p>{progressText}</p>
          </div>
        )}

        <div className="doc-action-buttons">
          <button className="doc-btn doc-btn--primary doc-btn--lg doc-btn--full" 
            onClick={handleGenerate} disabled={loading}>
            {loading ? 'Processing...' : 'Generate Documentation'} <Zap size={18} style={{marginLeft:8}}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentationGenerator;