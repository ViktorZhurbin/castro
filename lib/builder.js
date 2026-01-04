import { marked } from 'marked';
import fs from 'fs';
import path from 'path';
import {bytesToKb} from './convertUnits.js';
import { colorLog } from './logger.js';
import {msToSeconds} from './convertUnits.js';

// Shared constants
export const CONTENT_DIR = './content';
export const OUTPUT_DIR = './dist';
export const TEMPLATE_FILE = './template.html';

// Read template once at module load
const template = fs.readFileSync(TEMPLATE_FILE, 'utf-8');

/**
 * Generate HTML from template with optional script injection
 * @param {string} title - Page title
 * @param {string} content - HTML content
 * @param {string} injectScript - Optional script to inject before </head>
 */
export function generateHtml(title, content, injectScript = '') {
  let html = template
    .replace('{{title}}', title)
    .replace('{{content}}', content);

  if (injectScript) {
    html = html.replace('</head>', `${injectScript}\n</head>`);
  }

  return html;
}

/**
 * Build all markdown files to HTML
 * @param {Object} options - Build options
 * @param {string} options.injectScript - Optional script to inject
 * @returns {number} Number of files built
 */
export function buildAll(options = {}) {
  const { injectScript = '', verbose = false, startMessage = "build started..." } = options;
  const startTime = performance.now();

  console.log(`${colorLog('info', 'cyan')}  ${startMessage}`);

  // Create output directory if it doesn't exist
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Read all .md files
  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));

  const builtFiles = files.map(file => {
    const markdown = fs.readFileSync(path.join(CONTENT_DIR, file), 'utf-8');
    const html = marked(markdown);
    const title = file.replace('.md', '');
    const output = generateHtml(title, html, injectScript);

    const outputPath = path.join(OUTPUT_DIR, file.replace('.md', '.html'));
    fs.writeFileSync(outputPath, output);

    const fileSize = Buffer.byteLength(output, 'utf-8');

    return { outputPath, fileSize };
  });

  const buildTime = msToSeconds(performance.now() - startTime);
  console.log(`${colorLog('ready', 'green')} built in ${buildTime}`)

  if (verbose) {
    console.log("") // separator empty line
    logBuiltFiles(builtFiles);
  }

  return files.length;
}


/**
 * Log built files with Vite-style formatting
 * @param {Array<{outputPath: string, fileSize: number}>} files - Array of built files
 */
function logBuiltFiles(files) {
  // Find the longest path for alignment
  const maxPathLength = Math.max(
    ...files.map(({ outputPath }) => outputPath.length)
  );

  for (const { outputPath, fileSize } of files) {
    const dir = path.dirname(outputPath);
    const filename = path.basename(outputPath);
    const formattedSize = bytesToKb(fileSize);

    // Calculate padding to align file sizes
    const pathDisplay = `${dir}/${filename}`;
    const padding = ' '.repeat(maxPathLength - pathDisplay.length + 2);

    const dirFragment = colorLog(`${dir}/`, "dim")
    const fileFragment = colorLog(filename, "cyan")

    console.log(
      `${dirFragment}${fileFragment}${padding}${formattedSize}`
    );
  };
}
