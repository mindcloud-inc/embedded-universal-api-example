'use client';

import { useState } from 'react';

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
    <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy} type="button" aria-label="Copy to clipboard">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

export default function CodeExplorer({ sections }) {
  const [audience, setAudience] = useState('all');
  // Only the first section starts open: the summaries stay readable, and you
  // expand the code you actually care about.
  const [openSteps, setOpenSteps] = useState(() => new Set([sections[0]?.step]));

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
      </div>

      {visibleSections.map((section) => {
        const isOpen = openSteps.has(section.step);

        return (
          <section key={section.step} className={`code-section ${isOpen ? 'open' : ''}`}>
            <button className="code-section-header" onClick={() => toggleStep(section.step)} type="button" aria-expanded={isOpen}>
              <span className="code-section-step">{section.step}</span>
              <div className="code-section-heading">
                <h2>
                  {section.title} <span className="code-section-where">{section.where}</span>
                </h2>
                <p>{section.summary}</p>
              </div>
              <span className={`code-section-chevron ${isOpen ? 'open' : ''}`} aria-hidden="true">
                ⌄
              </span>
            </button>

            {isOpen &&
              section.files.map((file) => (
                <div key={file.file} className="code-file">
                  <div className="code-file-header">
                    <code className="code-file-name">{file.file}</code>
                    <span className="code-file-caption">{file.caption}</span>
                    <CopyButton code={file.code} />
                  </div>
                  <pre className="code-block">{file.code}</pre>
                </div>
              ))}
          </section>
        );
      })}
    </>
  );
}
