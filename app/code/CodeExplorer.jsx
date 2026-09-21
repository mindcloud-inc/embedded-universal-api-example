'use client';

import { useState } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram.jsx';
import CodeBlock from './CodeBlock.jsx';
import { BACKEND_STACKS, FRONTEND_STACKS } from './stackExamples.js';

const VIEWS = [
  { value: 'all', label: 'All' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Frontend', label: 'Frontend' }
];

export default function CodeExplorer({ sections }) {
  const [view, setView] = useState('all');
  const [backendStack, setBackendStack] = useState('next');
  const [frontendStack, setFrontendStack] = useState('next');
  const [showDiagram, setShowDiagram] = useState(true);
  // Collapsed by default: three one-line rows you can scan, opened on demand.
  const [openSteps, setOpenSteps] = useState(() => new Set());

  const visibleSections = view === 'all' ? sections : sections.filter((section) => section.where === view);

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
        <div className="segmented" role="tablist" aria-label="Which pieces to show">
          {VIEWS.map((option) => (
            <button key={option.value} type="button" role="tab" aria-selected={view === option.value} className={view === option.value ? 'active' : ''} onClick={() => setView(option.value)}>
              {option.label}
            </button>
          ))}
        </div>

        <button className="btn btn-ghost" type="button" onClick={() => setShowDiagram((previous) => !previous)}>
          {showDiagram ? 'Hide diagram' : 'Show diagram'}
        </button>
      </div>

      <div className="stack-controls">
        {view !== 'Frontend' && (
          <label className="stack-picker">
            <span>Backend</span>
            <select value={backendStack} onChange={(event) => setBackendStack(event.target.value)}>
              {BACKEND_STACKS.map((stack) => (
                <option key={stack.value} value={stack.value}>
                  {stack.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {view !== 'Backend' && (
          <label className="stack-picker">
            <span>Frontend</span>
            <select value={frontendStack} onChange={(event) => setFrontendStack(event.target.value)}>
              {FRONTEND_STACKS.map((stack) => (
                <option key={stack.value} value={stack.value}>
                  {stack.label}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {showDiagram && (
        <div className="diagram-card">
          <ArchitectureDiagram />
        </div>
      )}

      {visibleSections.map((section) => {
        const isOpen = openSteps.has(section.step);
        const stack = section.where === 'Frontend' ? frontendStack : backendStack;
        const files = section.examples[stack] || section.examples.next;

        return (
          <section key={section.step} className={`code-section ${isOpen ? 'open' : ''}`}>
            <button className="code-section-header" onClick={() => toggleStep(section.step)} type="button" aria-expanded={isOpen}>
              <span className="code-section-step">{section.step}</span>
              <span className="code-section-title">{section.title}</span>
              <span className="code-section-where">{section.where}</span>
              <span className="code-section-count">
                {files.length} {files.length === 1 ? 'file' : 'files'}
              </span>
              <span className={`code-section-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
                ⌄
              </span>
            </button>

            {isOpen && (
              <div className="code-section-body">
                <p className="code-section-summary">{section.summary}</p>
                {files.map((file) => (
                  <div key={file.file} className="code-file">
                    <div className="code-file-header">
                      <code className="code-file-name">{file.file}</code>
                      <span className="code-file-caption">{file.caption}</span>
                    </div>
                    <CodeBlock code={file.code} language={file.language} />
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
