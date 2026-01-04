import { marked } from 'marked';
import fs from 'fs';
import path from 'path';

const CONTENT_DIR = './content';
const OUTPUT_DIR = './dist';

// HTML template wrapper
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
</head>
<body>
  ${content}
</body>
</html>`;
}

// Build function
function build() {
  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all .md files
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  console.log(`Building ${files.length} file(s)...`);

  files.forEach(file => {
    const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const html = marked(markdown);
    const title = file.replace('.md', '');
    const output = htmlTemplate(title, html);

    const outputPath = path.join(OUTPUT_DIR, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, output);
    console.log(`✓ ${file} -> ${path.basename(outputPath)}`);
  });

  console.log('Build complete!');
}

build();
