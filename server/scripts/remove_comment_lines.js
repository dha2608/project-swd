const fs = require('fs');
const path = require('path');

const targets = [
  path.resolve(__dirname, '../../client/src'),
  path.resolve(__dirname, '..')
];

const CODE_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.scss', '.html']);

const SKIP_DIRS = new Set(['node_modules', 'build', 'dist', '.git']);

function isCodeFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return CODE_EXTS.has(ext);
}

function shouldSkipDir(dirName) {
  return SKIP_DIRS.has(dirName);
}

async function listFilesRecursively(dir, acc = []) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      await listFilesRecursively(fullPath, acc);
    } else {
      if (isCodeFile(fullPath)) acc.push(fullPath);
    }
  }
  return acc;
}

function stripCommentLines(content, ext) {
  const lines = content.split(/\r?\n/);
  const isHtml = ext === '.html';
  const result = [];
  let inBlockComment = false;
  let inHtmlComment = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      result.push(line);
      continue;
    }

    if (!isHtml) {
      // Code files (JS/TS/CSS/SCSS): handle /* ... */ comments safely
      if (!inBlockComment && trimmed.startsWith('/*')) {
        inBlockComment = !trimmed.endsWith('*/');
        continue; // skip this line
      }
      if (inBlockComment) {
        if (trimmed.endsWith('*/')) {
          inBlockComment = false;
        }
        continue; // skip lines inside block comment
      }
      // Single-line comment
      if (trimmed.startsWith('//')) {
        continue;
      }
      // Keep other lines (including CSS universal selector '* { ... }')
      result.push(line);
      continue;
    }

    // HTML comments: <!-- ... --> possibly multi-line
    if (isHtml) {
      if (!inHtmlComment && trimmed.startsWith('<!--')) {
        inHtmlComment = !trimmed.endsWith('-->');
        continue;
      }
      if (inHtmlComment) {
        if (trimmed.endsWith('-->')) {
          inHtmlComment = false;
        }
        continue;
      }
      result.push(line);
    }
  }

  return result.join('\n');
}

async function processFile(filePath) {
  const original = await fs.promises.readFile(filePath, 'utf8');
  const ext = path.extname(filePath).toLowerCase();
  const stripped = stripCommentLines(original, ext);
  if (stripped !== original) {
    await fs.promises.writeFile(filePath, stripped, 'utf8');
    return true;
  }
  return false;
}

async function main() {
  try {
    let totalFiles = 0;
    let changedFiles = 0;
    for (const target of targets) {
      if (!fs.existsSync(target)) continue;
      const files = await listFilesRecursively(target);
      totalFiles += files.length;
      for (const f of files) {
        const changed = await processFile(f);
        if (changed) changedFiles++;
      }
    }
    console.log(`Processed ${totalFiles} files. Updated ${changedFiles} files (removed comment lines).`);
  } catch (err) {
    console.error('Error stripping comment lines:', err);
    process.exitCode = 1;
  }
}

main();