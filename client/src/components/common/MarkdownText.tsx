import React from 'react';

export interface MarkdownTextProps {
  content: string;
  className?: string;
  invert?: boolean;
  inline?: boolean;
}

const isWordChar = (ch: string | undefined): boolean =>
  Boolean(ch && /[A-Za-z0-9_]/.test(ch));

function renderInlineMarkdown(
  text: string,
  invert: boolean,
  keyPrefix: string
): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  let plainStart = 0;
  let i = 0;
  let keyCounter = 0;

  const flushPlain = (end: number) => {
    if (end > plainStart) {
      nodes.push(text.slice(plainStart, end));
    }
  };

  while (i < text.length) {
    // 1. Inline code: `code`
    if (text[i] === '`') {
      const closeIdx = text.indexOf('`', i + 1);
      if (closeIdx > i + 1) {
        flushPlain(i);
        nodes.push(
          <code
            key={`${keyPrefix}-code-${keyCounter++}`}
            className={
              invert
                ? 'px-1.5 py-0.5 rounded bg-white/15 font-mono text-[0.88em] text-white'
                : 'px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-700/80 font-mono text-[0.88em] text-slate-900 dark:text-slate-100'
            }
          >
            {text.slice(i + 1, closeIdx)}
          </code>
        );
        i = closeIdx + 1;
        plainStart = i;
        continue;
      }
    }

    // 2. Markdown link: [label](https://...)
    if (text[i] === '[') {
      const linkMatch = text
        .slice(i)
        .match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (linkMatch) {
        flushPlain(i);
        const [, label, href] = linkMatch;
        nodes.push(
          <a
            key={`${keyPrefix}-link-${keyCounter++}`}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={
              invert
                ? 'underline font-medium text-white hover:text-white/90'
                : 'underline font-medium text-brand-600 dark:text-brand-400 hover:opacity-80'
            }
          >
            {renderInlineMarkdown(label, invert, `${keyPrefix}-l${keyCounter}`)}
          </a>
        );
        i += linkMatch[0].length;
        plainStart = i;
        continue;
      }
    }

    // 3. Bold: **text**
    if (text[i] === '*' && text[i + 1] === '*') {
      const nextChar = text[i + 2];
      if (nextChar && nextChar !== '*' && !/\s/.test(nextChar)) {
        const closeIdx = text.indexOf('**', i + 2);
        if (closeIdx > i + 2) {
          flushPlain(i);
          const inner = text.slice(i + 2, closeIdx);
          nodes.push(
            <strong
              key={`${keyPrefix}-b-${keyCounter++}`}
              className="font-semibold"
            >
              {renderInlineMarkdown(inner, invert, `${keyPrefix}-b${keyCounter}`)}
            </strong>
          );
          i = closeIdx + 2;
          plainStart = i;
          continue;
        }
      }
    }

    // 4. Bold: __text__ (guarded so snake_case/identifiers are left literal)
    if (
      text[i] === '_' &&
      text[i + 1] === '_' &&
      !isWordChar(text[i - 1])
    ) {
      const nextChar = text[i + 2];
      if (nextChar && nextChar !== '_' && !/\s/.test(nextChar)) {
        let searchFrom = i + 2;
        let closeIdx = -1;
        while (searchFrom < text.length) {
          const candidate = text.indexOf('__', searchFrom);
          if (candidate === -1) break;
          if (!isWordChar(text[candidate + 2]) && !/\s/.test(text[candidate - 1])) {
            closeIdx = candidate;
            break;
          }
          searchFrom = candidate + 2;
        }
        if (closeIdx > i + 2) {
          flushPlain(i);
          const inner = text.slice(i + 2, closeIdx);
          nodes.push(
            <strong
              key={`${keyPrefix}-bu-${keyCounter++}`}
              className="font-semibold"
            >
              {renderInlineMarkdown(inner, invert, `${keyPrefix}-bu${keyCounter}`)}
            </strong>
          );
          i = closeIdx + 2;
          plainStart = i;
          continue;
        }
      }
    }

    // 5. Italic: *text* (guarded against bullet markers and multiplication expressions)
    if (
      text[i] === '*' &&
      text[i + 1] !== '*' &&
      !isWordChar(text[i - 1])
    ) {
      const nextChar = text[i + 1];
      if (nextChar && !/\s/.test(nextChar)) {
        let searchFrom = i + 1;
        let closeIdx = -1;
        while (searchFrom < text.length) {
          const candidate = text.indexOf('*', searchFrom);
          if (candidate === -1) break;
          if (
            text[candidate + 1] !== '*' &&
            text[candidate - 1] !== '*' &&
            !/\s/.test(text[candidate - 1]) &&
            !isWordChar(text[candidate + 1])
          ) {
            closeIdx = candidate;
            break;
          }
          searchFrom = candidate + 1;
        }
        if (closeIdx > i + 1) {
          flushPlain(i);
          const inner = text.slice(i + 1, closeIdx);
          nodes.push(
            <em key={`${keyPrefix}-i-${keyCounter++}`} className="italic">
              {renderInlineMarkdown(inner, invert, `${keyPrefix}-i${keyCounter}`)}
            </em>
          );
          i = closeIdx + 1;
          plainStart = i;
          continue;
        }
      }
    }

    i += 1;
  }

  flushPlain(text.length);
  return nodes;
}

function renderLinesWithBreaks(
  lines: string[],
  invert: boolean,
  keyPrefix: string
): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  lines.forEach((line, idx) => {
    if (idx > 0) {
      out.push(<br key={`${keyPrefix}-br-${idx}`} />);
    }
    out.push(...renderInlineMarkdown(line, invert, `${keyPrefix}-l${idx}`));
  });
  return out;
}

function renderMarkdownBlocks(
  segment: string,
  invert: boolean,
  segKey: string
): React.ReactNode[] {
  const lines = segment.replace(/\r\n/g, '\n').split('\n');
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let blockIdx = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    // Headings (# - ####)
    const headingMatch = line.match(/^\s*(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].trim();
      const sizeClass =
        level === 1
          ? 'text-base font-bold'
          : level === 2
          ? 'text-sm md:text-[15px] font-bold'
          : 'text-xs md:text-sm font-semibold';
      blocks.push(
        <div
          key={`${segKey}-h-${blockIdx++}`}
          className={`${sizeClass} ${
            invert ? 'text-white' : 'text-slate-900 dark:text-white'
          } pt-0.5`}
        >
          {renderInlineMarkdown(headingText, invert, `${segKey}-hi-${blockIdx}`)}
        </div>
      );
      i += 1;
      continue;
    }

    // Blockquote (> ...)
    if (/^\s*>\s?/.test(line)) {
      const quoteLines: string[] = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quoteLines.push(lines[i].replace(/^\s*>\s?/, ''));
        i += 1;
      }
      blocks.push(
        <blockquote
          key={`${segKey}-q-${blockIdx++}`}
          className={
            invert
              ? 'border-l-2 border-white/50 pl-3 italic text-white/90'
              : 'border-l-2 border-brand-400 dark:border-brand-500 pl-3 italic text-slate-600 dark:text-slate-300'
          }
        >
          {renderLinesWithBreaks(quoteLines, invert, `${segKey}-qi-${blockIdx}`)}
        </blockquote>
      );
      continue;
    }

    // Unordered list (- item / * item / • item)
    if (/^\s*[-*•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*•]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*•]\s+/, ''));
        i += 1;
      }
      blocks.push(
        <ul
          key={`${segKey}-ul-${blockIdx++}`}
          className="list-disc pl-5 space-y-1"
        >
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInlineMarkdown(item, invert, `${segKey}-uli-${blockIdx}-${idx}`)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Ordered list (1. item)
    const olFirst = line.match(/^\s*(\d+)\.\s+(.+)$/);
    if (olFirst) {
      const startNum = parseInt(olFirst[1], 10) || 1;
      const items: string[] = [];
      while (i < lines.length) {
        const m = lines[i].match(/^\s*\d+\.\s+(.+)$/);
        if (!m) break;
        items.push(m[1]);
        i += 1;
      }
      blocks.push(
        <ol
          key={`${segKey}-ol-${blockIdx++}`}
          start={startNum}
          className="list-decimal pl-5 space-y-1"
        >
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInlineMarkdown(item, invert, `${segKey}-oli-${blockIdx}-${idx}`)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Paragraph (consecutive plain lines until blank line or structural block)
    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^\s*(#{1,4})\s+/.test(lines[i]) &&
      !/^\s*>\s?/.test(lines[i]) &&
      !/^\s*[-*•]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paraLines.push(lines[i]);
      i += 1;
    }

    if (paraLines.length > 0) {
      blocks.push(
        <p key={`${segKey}-p-${blockIdx++}`}>
          {renderLinesWithBreaks(paraLines, invert, `${segKey}-pi-${blockIdx}`)}
        </p>
      );
    }
  }

  return blocks;
}

export const MarkdownText: React.FC<MarkdownTextProps> = ({
  content,
  className = '',
  invert = false,
  inline = false
}) => {
  const safeContent = typeof content === 'string' ? content : String(content ?? '');

  if (!safeContent) {
    return null;
  }

  if (inline) {
    return (
      <span className={className}>
        {renderInlineMarkdown(safeContent, invert, 'inline')}
      </span>
    );
  }

  // Split around fenced code blocks (```lang\n...\n```)
  const fenceRegex = /```([A-Za-z0-9_+#.-]*)[ \t]*\r?\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let partIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = fenceRegex.exec(safeContent)) !== null) {
    if (match.index > lastIndex) {
      const prose = safeContent.slice(lastIndex, match.index);
      parts.push(...renderMarkdownBlocks(prose, invert, `seg-${partIdx++}`));
    }

    const lang = match[1]?.trim() || 'code';
    const code = match[2].replace(/\n$/, '');
    parts.push(
      <div
        key={`codeblock-${partIdx++}`}
        className="my-2 rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 text-slate-100"
      >
        <div className="px-3 py-1 bg-slate-900 border-b border-slate-800 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          {lang}
        </div>
        <pre className="p-3 text-xs font-mono overflow-x-auto leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < safeContent.length) {
    parts.push(
      ...renderMarkdownBlocks(
        safeContent.slice(lastIndex),
        invert,
        `seg-${partIdx++}`
      )
    );
  }

  return <div className={`space-y-2 ${className}`}>{parts}</div>;
};

