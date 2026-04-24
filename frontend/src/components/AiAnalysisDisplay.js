import React from 'react';
import ReactMarkdown from 'react-markdown';

export default function AiAnalysisDisplay({ content }) {
  if (!content) return null;

  return (
    <div className="ai-analysis-display">
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h2 className="ai-h1">{children}</h2>,
          h2: ({ children }) => <h3 className="ai-h2">{children}</h3>,
          h3: ({ children }) => <h4 className="ai-h3">{children}</h4>,
          p: ({ children }) => <p className="ai-paragraph">{children}</p>,
          ul: ({ children }) => <ul className="ai-list">{children}</ul>,
          ol: ({ children }) => <ol className="ai-list-ordered">{children}</ol>,
          li: ({ children }) => <li className="ai-list-item">{children}</li>,
          strong: ({ children }) => <strong className="ai-bold">{children}</strong>,
          blockquote: ({ children }) => <blockquote className="ai-blockquote">{children}</blockquote>,
          code: ({ inline, children }) =>
            inline ? <code className="ai-inline-code">{children}</code> : <pre className="ai-code-block"><code>{children}</code></pre>,
          table: ({ children }) => <div className="ai-table-wrapper"><table className="ai-table">{children}</table></div>,
          th: ({ children }) => <th className="ai-th">{children}</th>,
          td: ({ children }) => <td className="ai-td">{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
