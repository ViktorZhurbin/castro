import { marked } from 'marked';
import http from 'http';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './content';
const OUTPUT_DIR = './dist';
const PORT = 3000;

// HTML template (same as build.js)
function htmlTemplate(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.6;
      color: #333;
    }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-size: 0.9em;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    pre code {
      padding: 0;
    }
    blockquote {
      border-left: 4px solid #ddd;
      margin: 0;
      padding-left: 20px;
      color: #666;
    }
    img {
      max-width: 100%;
    }
    a {
      color: #0066cc;
    }
  </style>
  <script>
    // Simple live reload: poll every 2 seconds
    let lastModified = Date.now();
    setInterval(async () => {
      try {
        const res = await fetch('/reload-check');
        const { modified } = await res.json();
        if (modified > lastModified) {
          location.reload();
        }
      } catch(e) {}
    }, 2000);
  </script>
</head>
<body>
  ${content}
</body>
</html>`;
}

// Build all markdown files
function buildAll() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  files.forEach(file => {
    const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const html = marked(markdown);
    const title = file.replace('.md', '');
    const output = htmlTemplate(title, html);
    const outputPath = path.join(OUTPUT_DIR, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, output);
  });

  return files.length;
}

// Initial build
console.log('Building site...');
const count = buildAll();
console.log(`Built ${count} page(s)`);

// Watch for changes
let lastModified = Date.now();
fs.watch(CONTENT_DIR, (eventType, filename) => {
  if (filename && filename.endsWith('.md')) {
    console.log(`Change detected: ${filename}`);
    buildAll();
    lastModified = Date.now();
    console.log('Rebuilt!');
  }
});

// HTTP server
const server = http.createServer((req, res) => {
  // Live reload check endpoint
  if (req.url === '/reload-check') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ modified: lastModified }));
    return;
  }

  // Serve HTML files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(OUTPUT_DIR, filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\nDev server running at http://localhost:${PORT}`);
  console.log('Watching for changes...\n');
});
