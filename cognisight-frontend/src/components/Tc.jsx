import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

export default function Tc() {
  const [mode, setMode] = useState("quick");
  const [language, setLanguage] = useState("Java");
  const [code, setCode] = useState("");
  const [count, setCount] = useState(3);

  // Quick mode
  const [template, setTemplate] = useState("{int}\n{int}");

  // LeetCode mode
  const [inputFormat, setInputFormat] = useState("n\narr");
  const [constraints, setConstraints] = useState("");

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  function editorLang(lang) {
    if (lang === "CPP") return "cpp";
    if (lang === "C") return "c";
    return lang.toLowerCase();
  }

  async function generate() {
    if (code.trim().length < 10) {
      alert("Please write valid code first");
      return;
    }

    if (mode === "quick" && template.trim().length === 0) {
      alert("Input Template is required in Quick Mode");
      return;
    }

    if (mode === "leetcode" && inputFormat.trim().length === 0) {
      alert("Input Format is required in LeetCode Mode");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const res = await axios.post("http://localhost:5000/api/generate", {
        mode,
        language,
        code,
        count,
        inputTemplate: template,
        inputFormat,
        constraints
      });

      setResults(res.data.testcases || []);
    } catch (e) {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{cssStyles}</style>
      
      <div className="container">
        <h1>🧪 Dynamic Testcase Generator</h1>

        <div className="layout">
          <aside className="sidebar">
            <label>Mode</label>
            <select value={mode} onChange={e => setMode(e.target.value)}>
              <option value="quick">Quick Mode</option>
              <option value="leetcode">LeetCode Mode</option>
            </select>

            <label>Language</label>
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              <option>Java</option>
              <option>Python</option>
              <option>C</option>
              <option>CPP</option>
            </select>

            <label>Number of Testcases</label>
            <input
              type="number"
              min={1}
              value={count}
              onChange={e => setCount(Number(e.target.value))}
            />

            {mode === "quick" && (
              <>
                <label>Input Template</label>
                <textarea
                  rows={5}
                  value={template}
                  onChange={e => setTemplate(e.target.value)}
                  placeholder={`Example:\n{int}\n{int}`}
                />
              </>
            )}

            {mode === "leetcode" && (
              <>
                <label>Input Format</label>
                <textarea
                  rows={4}
                  value={inputFormat}
                  onChange={e => setInputFormat(e.target.value)}
                  placeholder={`Example:\nn\narr`}
                />

                <label>Constraints (optional)</label>
                <textarea
                  rows={4}
                  value={constraints}
                  onChange={e => setConstraints(e.target.value)}
                  placeholder={`Example:\n1 ≤ n ≤ 10^5`}
                />
              </>
            )}

            <button onClick={generate} disabled={loading}>
              {loading ? "Generating..." : "Generate"}
            </button>
          </aside>

          <div className="editor">
            <Editor
              height="520px"
              theme="vs-dark"
              language={editorLang(language)}
              value={code}
              onChange={v => setCode(v || "")}
            />
          </div>
        </div>

        <div className="results">
          <h2>Generated Testcases</h2>

          {results.length === 0 && <p style={{color: '#9ca3af'}}>No testcases yet.</p>}

          {results.map((r, i) => (
            <div key={i} className="card">
              <b>Testcase #{i + 1}</b>
              
              <div className="io-block">
                <span className="label">INPUT:</span>
                <pre>{r.input}</pre>
              </div>
              
              <div className="io-block">
                <span className="label">OUTPUT:</span>
                <pre>{r.output}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// Internal CSS String
const cssStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Fira+Code:wght@400;500&display=swap');

  :root {
    --bg-color: #121212;
    --surface-color: #1e1e1e;
    --input-bg: #2d2d2d;
    --border-color: #3e3e3e;
    --primary-color: #3b82f6; 
    --primary-hover: #2563eb;
    --text-primary: #e5e7eb;
    --text-secondary: #9ca3af;
    --success-color: #10b981;
    --code-font: 'Fira Code', monospace;
  }

  body {
    background-color: var(--bg-color);
    color: var(--text-primary);
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin-bottom: 2rem;
    background: linear-gradient(90deg, #60a5fa, #a78bfa);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700;
  }

  /* Layout */
  .layout {
    display: grid;
    grid-template-columns: 320px 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  /* Sidebar */
  .sidebar {
    background-color: var(--surface-color);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid var(--border-color);
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
    height: fit-content;
  }

  .sidebar label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    margin-bottom: -0.5rem;
  }

  .sidebar select,
  .sidebar input,
  .sidebar textarea {
    background-color: var(--input-bg);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.75rem;
    border-radius: 6px;
    font-family: inherit;
    font-size: 0.95rem;
    transition: border-color 0.2s;
    width: 100%;
    box-sizing: border-box;
  }

  .sidebar textarea {
    font-family: var(--code-font);
    font-size: 0.85rem;
    resize: vertical;
  }

  .sidebar select:focus,
  .sidebar input:focus,
  .sidebar textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }

  .sidebar button {
    background-color: var(--primary-color);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 0.5rem;
  }

  .sidebar button:hover:not(:disabled) {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
  }

  .sidebar button:disabled {
    background-color: var(--border-color);
    color: var(--text-secondary);
    cursor: not-allowed;
  }

  /* Editor */
  .editor {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border-color);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
  }

  /* Results */
  .results {
    margin-top: 3rem;
    border-top: 1px solid var(--border-color);
    padding-top: 2rem;
  }

  .results h2 {
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  .card {
    background-color: var(--surface-color);
    border: 1px solid var(--border-color);
    border-left: 4px solid var(--success-color);
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: transform 0.2s;
  }

  .card:hover {
    transform: translateX(4px);
  }

  .card b {
    display: block;
    font-size: 0.9rem;
    color: var(--success-color);
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .io-block {
    margin-bottom: 10px;
  }

  .label {
    font-size: 0.75rem;
    color: #666;
    font-weight: bold;
    display: block;
    margin-bottom: 4px;
  }

  .card pre {
    background-color: #000;
    padding: 1rem;
    border-radius: 6px;
    font-family: var(--code-font);
    font-size: 0.9rem;
    white-space: pre-wrap;
    word-wrap: break-word;
    color: #a5b3ce;
    margin: 0;
    border: 1px solid #333;
  }

  /* Responsive */
  @media (max-width: 900px) {
    .layout {
      grid-template-columns: 1fr;
    }
    .editor {
      height: 400px;
    }
  }
`;