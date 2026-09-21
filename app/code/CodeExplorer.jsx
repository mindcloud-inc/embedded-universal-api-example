'use client';

import { useState } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram.jsx';

const AUDIENCES = [
  { value: 'all', label: 'All pieces' },
  { value: 'Backend', label: 'Backend only' },
  { value: 'Frontend', label: 'Frontend only' }
];

const CopyButton = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} type="button">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function CodeExplorer({ sections }) {
  const [audience, setAudience] = useState('all');
  const [showDiagram, setShowDiagram] = useState(true);
  // Collapsed by default: three one-line rows you can scan, opened on demand.
  const [openSteps, setOpenSteps] = useState(() => new Set());

  const visibleSections = audience === 'all' ? sections : sections.filter((section) => section.where === audience);

  const toggleStep = (step) => {
    setOpenSteps((prev) => {
      const next = new Set(prev);
      if (next.has(step)) {
        next.delete(step);
      } else {
        next.add(step);
      }
      return next;
    });
  };

  return (
    <>
      <div className="code-controls">
        <label htmlFor="code-audience">Show</label>
        <select id="code-audience" value={audience} onChange={(event) => setAudience(event.target.value)}>
          {AUDIENCES.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <button className="btn btn-ghost" type="button" onClick={() => setShowDiagram((previous) => !previous)}>
          {showDiagram ? 'Hide diagram' : 'Show diagram'}
        </button>
      </div>

      {showDiagram && (
        <div className="diagram-card">
          <ArchitectureDiagram />
        </div>
      )}

      {visibleSections.map((section) => {
        const isOpen = openSteps.has(section.step);

        return (
          <section key={section.step} className={`code-section ${isOpen ? 'open' : ''}`}>
            <button className="code-section-header" onClick={() => toggleStep(section.step)} type="button" aria-expanded={isOpen}>
              <span className="code-section-step">{section.step}</span>
              <span className="code-section-title">{section.title}</span>
              <span className="code-section-where">{section.where}</span>
              <span className="code-section-count">
                {section.files.length} {section.files.length === 1 ? 'file' : 'files'}
              </span>
              <span className={`code-section-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
                ⌄
              </span>
            </button>

            {isOpen && (
              <div className="code-section-body">
                <p className="code-section-summary">{section.summary}</p>
                {section.files.map((file) => (
                  <div key={file.file} className="code-file">
                    <div className="code-file-header">
                      <code className="code-file-name">{file.file}</code>
                      <span className="code-file-caption">{file.caption}</span>
                      <CopyButton code={file.code} />
                    </div>
                    <pre className="code-block">{file.code}</pre>
                  </div>
                ))}
              </div>
            )}
          </section>
        );
      })}
    </>
  );
}
