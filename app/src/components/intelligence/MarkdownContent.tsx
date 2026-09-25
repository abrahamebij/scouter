"use client";

import React, { useState } from "react";
import Link from "next/link";
import MaterialIcon from "@/components/ui/MaterialIcon";

interface RenderImageProps {
  src: string;
  alt?: string;
  caption?: string;
}

/**
 * Responsive, graceful image renderer with loading placeholder, error fallback,
 * and high-resolution zoom link.
 */
function RenderImage({ src, alt = "Attached image", caption }: RenderImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  if (hasError) {
    return (
      <a
        href={src}
        target="_blank"
        rel="noopener noreferrer"
        className="my-2.5 p-3 rounded-xl border border-outline-variant/20 bg-surface-container-lowest/80 hover:bg-surface-container-high/40 transition-colors flex items-center gap-3 text-xs text-on-surface-variant hover:text-on-surface group max-w-xl"
      >
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
          <MaterialIcon icon="image" size="sm" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate text-on-surface group-hover:text-accent transition-colors">
            {alt || "External Image"}
          </div>
          <div className="text-[10px] font-mono text-on-surface-variant/50 truncate">
            {src}
          </div>
        </div>
        <MaterialIcon icon="open_in_new" size="sm" />
      </a>
    );
  }

  return (
    <figure className="my-3.5 block max-w-xl">
      <div className="relative group rounded-xl overflow-hidden border border-outline-variant/20 bg-surface-container-lowest flex items-center justify-center shadow-sm">
        {isLoading && (
          <div className="w-full h-44 flex items-center justify-center bg-surface-container-low animate-pulse">
            <span className="text-[11px] font-mono text-on-surface-variant/50 flex items-center gap-2">
              <MaterialIcon icon="image" size="sm" />
              <span>Loading image...</span>
            </span>
          </div>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element -- Dynamic external image from markdown content */}
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          className={`max-h-80 w-auto max-w-full object-contain mx-auto transition-opacity duration-300 ${
            isLoading ? "hidden" : "block"
          }`}
        />
        {!isLoading && (
          <a
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-surface/80 hover:bg-surface border border-outline-variant/30 text-on-surface opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm shadow"
            title="Open image in new tab"
          >
            <MaterialIcon icon="open_in_new" size="sm" />
          </a>
        )}
      </div>
      {(caption || alt) && (
        <figcaption className="text-[11px] text-on-surface-variant/70 text-center font-light mt-1.5 px-2">
          {caption || alt}
        </figcaption>
      )}
    </figure>
  );
}

interface MarkdownContentProps {
  content: string;
}

/**
 * Lightweight, zero-dependency Markdown renderer tailored for Scouter terminal output.
 * Formats headings, bullet lists, markdown tables, bold text, code tags, links, and inline images.
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

    // Standalone image line: ![alt](url) or ![alt](url "title")
    const imageBlockMatch = line.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)(?:\s+"(.*?)")?\)$/);
    if (imageBlockMatch) {
      if (inList) flushList(i);
      if (inTable) flushTable(i);
      const [, alt, url, title] = imageBlockMatch;
      renderedElements.push(
        <RenderImage key={`img-${i}`} src={url} alt={alt} caption={title || alt} />
      );
      continue;
    }

    // Standalone bare image URL line: https://.../image.png
    const bareImageBlockMatch = line.match(/^(https?:\/\/[^\s<>]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s<>]*)?)$/i);
    if (bareImageBlockMatch) {
      if (inList) flushList(i);
      if (inTable) flushTable(i);
      renderedElements.push(
        <RenderImage key={`bare-img-${i}`} src={bareImageBlockMatch[1]} alt="Attached image" />
      );
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
  // Regex to match:
  // 1. Linked image: [![alt](img_url)](target_url)
  // 2. Markdown image: ![alt](url)
  // 3. Bold: **text**
  // 4. Link: [label](url)
  // 5. Code: `code`
  // 6. Company symbol: $SYMBOL
  // 7. Bare image URL: https://.../image.png
  const tokens = text.split(
    /(\[!\[.*?\]\(https?:\/\/[^\s)]+\)\]\(https?:\/\/[^\s)]+\)|!\[.*?\]\(https?:\/\/[^\s)]+\)|\*\*.*?\*\*|\[.*?\]\(.*?\)|\`.*?\`|\$[A-Z0-9\-]+|(?:https?:\/\/[^\s<>]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s<>]*)?))/gi
  );

  return tokens.map((part, idx) => {
    if (!part) return null;

    // Linked image: [![alt](img_url)](target_url)
    const linkedImgMatch = part.match(
      /^\[!\[(.*?)\]\((https?:\/\/[^\s)]+)\)\]\((https?:\/\/[^\s)]+)\)$/
    );
    if (linkedImgMatch) {
      const [, alt, imgUrl, targetUrl] = linkedImgMatch;
      return (
        <a
          key={idx}
          href={targetUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block my-2"
        >
          <RenderImage src={imgUrl} alt={alt} caption={alt} />
        </a>
      );
    }

    // Inline image: ![alt](url) or ![alt](url "title")
    const imgMatch = part.match(/^!\[(.*?)\]\((https?:\/\/[^\s)]+)(?:\s+"(.*?)")?\)$/);
    if (imgMatch) {
      const [, alt, url, title] = imgMatch;
      return <RenderImage key={idx} src={url} alt={alt} caption={title || alt} />;
    }

    // Bare image URL: https://.../image.png
    if (
      /^https?:\/\/[^\s<>]+\.(?:png|jpe?g|gif|webp|svg)(?:\?[^\s<>]*)?$/i.test(part)
    ) {
      return <RenderImage key={idx} src={part} alt="Shared Image" />;
    }

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
