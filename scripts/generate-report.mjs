import { chromium } from 'playwright';
import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const mdPath = "C:/Users/ruru/Ruru's Brain/Projects/see-you-wild/_blueprint.md";
const outputPath = path.join(process.cwd(), 'report-see-you-wild.pdf');

// Read markdown
const mdContent = fs.readFileSync(mdPath, 'utf-8');

// Pre-process: extract mermaid blocks before marked parses them
// Replace ```mermaid ... ``` with a placeholder <div> that marked won't mangle
const mermaidBlocks = [];
const mdWithPlaceholders = mdContent.replace(
  /```mermaid\n([\s\S]*?)```/g,
  (match, diagram) => {
    const idx = mermaidBlocks.length;
    mermaidBlocks.push(diagram.trim());
    return `<div class="mermaid" data-idx="${idx}"></div>`;
  }
);

// Parse markdown with marked (Node.js side — no browser JS needed)
marked.setOptions({ gfm: true, breaks: false });
const bodyHtml = marked.parse(mdWithPlaceholders);

// Restore mermaid content into the placeholder divs via inline script
// Encode diagrams as JSON to safely embed in HTML
const mermaidJson = JSON.stringify(mermaidBlocks);

const fullHtml = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>See You Wild — Blueprint Report</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
  <style>
    * {
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 900px;
      margin: 0 auto;
      padding: 32px;
      background: #fff;
    }

    h1 {
      font-size: 24px;
      border-bottom: 2px solid #d4a373;
      padding-bottom: 8px;
      margin-top: 2em;
      margin-bottom: 0.75em;
    }

    h2 {
      font-size: 20px;
      margin-top: 2em;
      margin-bottom: 0.5em;
      color: #2a2a2a;
    }

    h3 {
      font-size: 16px;
      margin-top: 1.5em;
      margin-bottom: 0.4em;
      color: #3a3a3a;
    }

    h4, h5, h6 {
      margin-top: 1em;
      margin-bottom: 0.3em;
    }

    p {
      margin: 0.6em 0;
    }

    a {
      color: #2563eb;
      text-decoration: none;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1em 0;
      font-size: 13px;
    }

    th, td {
      border: 1px solid #ddd;
      padding: 8px 12px;
      text-align: left;
    }

    th {
      background: #f8f6f2;
      font-weight: 600;
    }

    tr:nth-child(even) td {
      background: #fafafa;
    }

    code {
      background: #f4f6f5;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
      font-size: 0.9em;
    }

    pre {
      background: #f4f6f5;
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
      border-left: 3px solid #d4a373;
    }

    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
      font-size: 0.88em;
    }

    blockquote {
      margin: 1em 0;
      padding: 8px 16px;
      border-left: 4px solid #d4a373;
      background: #fdf8f0;
      color: #555;
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;
    }

    li {
      margin: 0.25em 0;
    }

    hr {
      border: none;
      border-top: 1px solid #e0dcd4;
      margin: 2em 0;
    }

    .mermaid {
      text-align: center;
      margin: 20px 0;
    }

    @media print {
      body {
        padding: 0;
      }
      pre {
        white-space: pre-wrap;
        word-break: break-word;
      }
    }
  </style>
</head>
<body>
  ${bodyHtml}

  <script>
    // Restore mermaid diagram text into placeholder divs
    const diagrams = ${mermaidJson};
    document.querySelectorAll('.mermaid[data-idx]').forEach(function(el) {
      const idx = parseInt(el.getAttribute('data-idx'), 10);
      el.textContent = diagrams[idx];
      el.removeAttribute('data-idx');
    });

    // Init and run mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    mermaid.run({ querySelector: '.mermaid' });
  </script>
</body>
</html>`;

async function generateReport() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // Log page errors for debugging
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  await page.setContent(fullHtml, { waitUntil: 'networkidle' });

  // Wait for mermaid diagrams to render (SVG injected)
  if (mermaidBlocks.length > 0) {
    console.log(`Waiting for ${mermaidBlocks.length} mermaid diagram(s) to render...`);
    try {
      await page.waitForFunction(() => {
        const diagrams = document.querySelectorAll('.mermaid');
        return Array.from(diagrams).every(d => d.querySelector('svg'));
      }, { timeout: 10000 });
      console.log('Mermaid diagrams rendered.');
    } catch {
      console.warn('Mermaid timeout — proceeding without all diagrams rendered.');
    }
  }

  await page.pdf({
    path: outputPath,
    format: 'A4',
    margin: { top: '2cm', bottom: '2cm', left: '2cm', right: '2cm' },
    printBackground: true,
  });

  await browser.close();

  const stats = fs.statSync(outputPath);
  console.log(`PDF saved: ${outputPath} (${(stats.size / 1024).toFixed(1)} KB)`);
}

generateReport().catch(err => {
  console.error('Failed to generate report:', err);
  process.exit(1);
});
