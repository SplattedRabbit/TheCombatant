import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.join(__dirname, '..');
const mdFilePath = path.join(workspaceRoot, 'PATCHNOTES_v2_to_v3.md');
const htmlTempPath = path.join(__dirname, 'patchnotes_temp.html');
const pdfOutputPath = path.join(workspaceRoot, 'PATCHNOTES_v2_to_v3.pdf');

function parseInline(text) {
  // Escape HTML characters
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Bold **text**
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Italic *text*
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  
  // Inline code `code`
  text = text.replace(/`(.*?)`/g, '<code>$1</code>');
  
  return text;
}

function markdownToHtml(md) {
  const lines = md.split('\n');
  let html = '';
  let inList = false;
  let listLevel = 0; // 0 = none, 1 = ul, 2 = nested ul

  for (let line of lines) {
    let trimmed = line.trim();
    
    // Handle empty lines
    if (trimmed === '') {
      if (inList) {
        while (listLevel > 0) {
          html += '</ul>\n';
          listLevel--;
        }
        inList = false;
      }
      continue;
    }

    // Handle horizontal rules
    if (trimmed === '---') {
      if (inList) {
        while (listLevel > 0) {
          html += '</ul>\n';
          listLevel--;
        }
        inList = false;
      }
      html += '<hr>\n';
      continue;
    }

    // Handle Headers
    if (trimmed.startsWith('# ')) {
      if (inList) {
        while (listLevel > 0) {
          html += '</ul>\n';
          listLevel--;
        }
        inList = false;
      }
      const text = parseInline(trimmed.substring(2));
      html += `<h1>${text}</h1>\n`;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      if (inList) {
        while (listLevel > 0) {
          html += '</ul>\n';
          listLevel--;
        }
        inList = false;
      }
      const text = parseInline(trimmed.substring(4));
      html += `<h3>${text}</h3>\n`;
      continue;
    }

    // Handle list items
    const listMatch = line.match(/^(\s*)([\*\-])\s+(.*)$/);
    if (listMatch) {
      const indent = listMatch[1].length;
      const content = parseInline(listMatch[3]);
      const targetLevel = indent > 0 ? 2 : 1;

      if (!inList) {
        html += '<ul>\n';
        listLevel = 1;
        inList = true;
      }

      if (targetLevel > listLevel) {
        html += '<ul>\n';
        listLevel = 2;
      } else if (targetLevel < listLevel) {
        html += '</ul>\n';
        listLevel = 1;
      }

      html += `  <li>${content}</li>\n`;
      continue;
    }

    // If it's a regular paragraph
    if (inList) {
      while (listLevel > 0) {
        html += '</ul>\n';
        listLevel--;
      }
      inList = false;
    }

    const content = parseInline(trimmed);
    html += `<p>${content}</p>\n`;
  }

  // Close any open lists
  if (inList) {
    while (listLevel > 0) {
      html += '</ul>\n';
      listLevel--;
    }
  }

  return html;
}

try {
  const mdContent = fs.readFileSync(mdFilePath, 'utf-8');
  const bodyHtml = markdownToHtml(mdContent);

  const htmlTemplate = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <title>D&D 3.5e Combat App: Patchnotes v2.0.0 - v3.0.0</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IM+Fell+English+SC&family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', sans-serif;
      color: #2b1f14;
      background-color: #fbf8f3;
      margin: 0;
      padding: 40px;
      line-height: 1.6;
    }
    
    .container {
      max-width: 850px;
      margin: 0 auto;
      background: #fffdf9;
      padding: 50px;
      border: 1px solid #e2d2c1;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);
      border-radius: 4px;
      position: relative;
    }
    
    /* Elegant border frame */
    .container::before {
      content: "";
      position: absolute;
      inset: 15px;
      border: 1px dashed rgba(139, 26, 26, 0.2);
      pointer-events: none;
      border-radius: 2px;
    }
    
    h1 {
      font-family: 'IM Fell English SC', serif;
      color: #8b1a1a;
      font-size: 2.2em;
      border-bottom: 2px solid #8b1a1a;
      padding-bottom: 15px;
      margin-top: 0;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    h3 {
      font-family: 'IM Fell English SC', serif;
      color: #8b1a1a;
      font-size: 1.4em;
      border-bottom: 1px dashed #d0bba6;
      padding-bottom: 5px;
      margin-top: 2em;
      letter-spacing: 0.3px;
    }
    
    p {
      margin-bottom: 12px;
      font-size: 0.95em;
    }
    
    ul {
      padding-left: 20px;
      margin-bottom: 16px;
    }
    
    li {
      margin-bottom: 8px;
      font-size: 0.95em;
    }
    
    strong {
      color: #7a1616;
      font-weight: 600;
    }
    
    code {
      font-family: Consolas, Monaco, monospace;
      background-color: #f5eae0;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.85em;
      color: #443;
    }
    
    hr {
      border: 0;
      height: 1px;
      background: #e2d2c1;
      margin: 30px 0;
    }
    
    /* Print optimizations */
    @media print {
      body {
        background-color: #ffffff;
        padding: 0;
      }
      .container {
        border: none;
        box-shadow: none;
        padding: 20px;
        max-width: 100%;
      }
      .container::before {
        display: none;
      }
      h3 {
        page-break-after: avoid;
      }
      p, li {
        orphans: 3;
        widows: 3;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    ${bodyHtml}
  </div>
</body>
</html>`;

  fs.writeFileSync(htmlTempPath, htmlTemplate, 'utf-8');
  console.log('Temporary HTML file generated at:', htmlTempPath);

  // Invoke Edge to print to PDF
  const msedgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const command = `"${msedgePath}" --headless --disable-gpu --print-to-pdf="${pdfOutputPath}" "file:///${htmlTempPath.replace(/\\/g, '/')}"`;

  console.log('Running Edge command to compile PDF...');
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error compiling PDF:', error);
      process.exit(1);
    }
    console.log('PDF compiled successfully at:', pdfOutputPath);
    
    // Clean up temporary HTML file
    try {
      fs.unlinkSync(htmlTempPath);
      console.log('Temporary HTML file cleaned up.');
    } catch (cleanupErr) {
      console.warn('Failed to clean up temp HTML file:', cleanupErr);
    }
    
    process.exit(0);
  });

} catch (err) {
  console.error('Failed to generate PDF:', err);
  process.exit(1);
}
