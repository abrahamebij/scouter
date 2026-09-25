"use client";

import React from "react";
import Link from "next/link";

interface MarkdownContentProps {
  content: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer tailored for Scouter terminal output.
 * Formats headings, bullet lists, markdown tables, bold text, code tags, and links.
 */
export default function MarkdownContent({ content }: MarkdownContentProps) {
  const lines = content.split("\n");
  const renderedElements: React.ReactNode[] = [];

  let tableRows: string[] = [];
  let inTable = false;
  let inList = false;
  let listItems: string[] = [];

  function flushList(key: number) {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="space-y-1.5 my-2.5 pl-4 list-disc marker:text-accent/70 text-xs text-on-surface">
          {listItems.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
    inList = false;
  }

  function flushTable(key: number) {
    if (tableRows.length > 0) {
      const rows = tableRows.map((r) =>
        r
          .split("|")
          .map((c) => c.trim())
          .filter((c, i, arr) => i > 0 && i < arr.length - 1)
      );

      const header = rows[0] || [];
      const dataRows = rows.slice(2); // Skip header and separator row

      renderedElements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-3 rounded-lg border border-outline-variant/20 bg-surface-container-lowest/60">
          <table className="w-full text-left text-xs font-mono">
            {header.length > 0 && (
              <thead className="bg-surface-container-high/60 border-b border-outline-variant/20 text-on-surface-variant text-[11px] uppercase tracking-wider font-label">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="px-3 py-2 font-semibold">
                      {formatInline(col)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-outline-variant/10 text-on-surface">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-surface-container-high/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 text-xs">
                      {formatInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    }
    inTable = false;
  }

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const line = rawLine.trim();

    // Table detection
    if (line.startsWith("|") && line.endsWith("|")) {
      if (inList) flushList(i);
      inTable = true;
      tableRows.push(line);
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // List item detection
    if (line.startsWith("- ") || line.startsWith("* ")) {
      inList = true;
      listItems.push(line.slice(2).trim());
      continue;
    } else if (inList) {
      flushList(i);
    }

    // Empty lines
    if (!line) {
      continue;
    }

    // Headings
    if (line.startsWith("### ")) {
      renderedElements.push(
        <h3 key={i} className="font-headline font-bold text-sm text-on-surface mt-4 mb-1.5 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
          <span>{formatInline(line.slice(4))}</span>
        </h3>
      );
      continue;
    }

    if (line.startsWith("## ")) {
      renderedElements.push(
        <h2 key={i} className="font-headline font-bold text-base text-on-surface mt-5 mb-2 pb-1 border-b border-outline-variant/15">
          {formatInline(line.slice(3))}
        </h2>
      );
      continue;
    }

    if (line.startsWith("# ")) {
      renderedElements.push(
        <h1 key={i} className="font-headline font-bold text-lg text-on-surface mt-6 mb-3">
          {formatInline(line.slice(2))}
        </h1>
      );
      continue;
    }

    // Regular paragraphs
    renderedElements.push(
      <p key={i} className="text-xs sm:text-sm text-on-surface leading-relaxed font-light my-2">
        {formatInline(line)}
      </p>
    );
  }

  if (inTable) flushTable(lines.length);
  if (inList) flushList(lines.length);

  return <div className="space-y-1">{renderedElements}</div>;
}

/**
 * Handles inline formatting: bold (**text**), links ([text](url)), code (`code`), and $SYMBOL tags.
 */
function formatInline(text: string): React.ReactNode {
  // Regex to match markdown links, bold chunks, code tags, or $SYMBOL tags
  const tokens = text.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\)|\`.*?\`|\$[A-Z0-9\-]+)/g);

  return tokens.map((part, idx) => {
    if (!part) return null;

    // Bold: **text**
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={idx} className="font-semibold text-on-surface">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Links: [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isInternal = url.startsWith("/");
      if (isInternal) {
        return (
          <Link
            key={idx}
            href={url}
            className="text-accent underline decoration-accent/40 hover:decoration-accent font-medium transition-colors"
          >
            {label}
          </Link>
        );
      }
      return (
        <a
          key={idx}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline decoration-accent/40 hover:decoration-accent font-medium inline-flex items-center gap-0.5 transition-colors"
        >
          <span>{label}</span>
        </a>
      );
    }

    // Code: `code`
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-surface-container-high border border-outline-variant/30 text-[11px] font-mono text-on-surface"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Company symbol tag: $SYMBOL
    if (/^\$[A-Z0-9\-]+$/.test(part)) {
      const sym = part.slice(1).toLowerCase();
      return (
        <Link
          key={idx}
          href={`/company/${sym}`}
          className="inline-block px-1.5 py-0.2 rounded bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/25 font-mono text-[11px] font-semibold text-accent hover:text-on-surface transition-colors mx-0.5"
          title={`View ${part} on Scouter`}
        >
          {part}
        </Link>
      );
    }

    return part;
  });
}
