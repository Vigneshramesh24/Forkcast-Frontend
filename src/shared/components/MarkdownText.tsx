import React from 'react';

type Props = { text: string; className?: string };

// Very small Markdown renderer for chat messages.
// Supports: headings (#..######), bold **text**, italics *text* or _text_,
// unordered lists (*, -), ordered lists (1.), and code fences ```.
// It avoids innerHTML to keep rendering safe.
export const MarkdownText: React.FC<Props> = ({ text, className }) => {
  const lines = (text || '').split(/\r?\n/);

  const elements: React.ReactNode[] = [];
  let i = 0;
  let inCode = false;
  let codeBuffer: string[] = [];
  let listBuffer: { ordered: boolean; items: string[] } | null = null;

  const renderInline = (s: string) => {
    // Bold **text**
    const boldSplit = s.split(/(\*\*[^*]+\*\*)/g);
    const boldElems = boldSplit.map((part, idx) => {
      const m = part.match(/^\*\*([^*]+)\*\*$/);
      if (m) return <strong key={`b-${idx}`}>{m[1]}</strong>;
      return part;
    });

    // Then italics on resulting array
    const italicsProcessed: React.ReactNode[] = [];
    boldElems.forEach((frag, idx) => {
      if (typeof frag === 'string') {
        const itSplit = frag.split(/(\*[^*]+\*|_[^_]+_)/g);
        itSplit.forEach((p, j) => {
          const mi = p.match(/^\*([^*]+)\*$/) || p.match(/^_([^_]+)_$/);
          if (mi) italicsProcessed.push(<em key={`i-${idx}-${j}`}>{mi[1]}</em>);
          else italicsProcessed.push(p);
        });
      } else {
        italicsProcessed.push(frag);
      }
    });
    return italicsProcessed;
  };

  const flushList = () => {
    if (!listBuffer) return;
    const { ordered, items } = listBuffer;
    const children = items.map((it, k) => <li key={`li-${k}`}>{renderInline(it)}</li>);
    elements.push(ordered ? <ol className="list-decimal ml-6" key={`ol-${elements.length}`}>{children}</ol>
                         : <ul className="list-disc ml-6" key={`ul-${elements.length}`}>{children}</ul>);
    listBuffer = null;
  };

  for (i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code fence
    if (line.trim().startsWith('```')) {
      if (inCode) {
        // close
        elements.push(
          <pre key={`code-${elements.length}`} className="bg-muted p-3 rounded-md overflow-auto text-xs">
            <code>{codeBuffer.join('\n')}</code>
          </pre>
        );
        codeBuffer = [];
        inCode = false;
      } else {
        flushList();
        inCode = true;
      }
      continue;
    }
    if (inCode) { codeBuffer.push(line); continue; }

    // Lists
    const ulMatch = line.match(/^\s*([*-])\s+(.*)$/);
    const olMatch = line.match(/^\s*(\d+)\.\s+(.*)$/);
    if (ulMatch) {
      const itemText = ulMatch[2];
      if (!listBuffer) listBuffer = { ordered: false, items: [] };
      if (listBuffer.ordered) flushList();
      listBuffer.items.push(itemText);
      continue;
    }
    if (olMatch) {
      const itemText = olMatch[2];
      if (!listBuffer) listBuffer = { ordered: true, items: [] };
      if (!listBuffer.ordered) flushList();
      listBuffer.items.push(itemText);
      continue;
    }

    // blank line ends a list
    if (line.trim() === '') { flushList(); continue; }

    // Headings
    const hMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (hMatch) {
      flushList();
      const level = hMatch[1].length;
      const content = renderInline(hMatch[2]);
      const Tag = (`h${level}` as any);
      elements.push(<Tag key={`h-${elements.length}`} className="font-semibold mt-2">{content}</Tag>);
      continue;
    }

    // Paragraph
    flushList();
    elements.push(<p key={`p-${elements.length}`} className={className || 'text-sm leading-relaxed'}>{renderInline(line)}</p>);
  }

  // any trailing list
  flushList();

  return <div className={className}>{elements}</div>;
};

export default MarkdownText;