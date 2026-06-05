/**
 * One-off migration helper — atualiza imports de API_BASE_URL e @playwright/test nos specs/helpers.
 */
const fs = require('node:fs');
const path = require('node:path');

const specsRoot = path.join(__dirname, '..', 'specs');

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'fixtures') continue;
      walk(full, files);
    } else if (entry.name.endsWith('.ts')) {
      files.push(full);
    }
  }
  return files;
}

function relativeFixtureImport(fromFile) {
  const rel = path.relative(path.dirname(fromFile), path.join(specsRoot, 'fixtures', 'test.ts'));
  return rel.replace(/\\/g, '/').replace(/\.ts$/, '');
}

function migrateHelperFile(filePath, content) {
  let next = content;

  if (next.includes('API_BASE_URL')) {
    if (!next.includes("from './workerContext'")) {
      next = next.replace(
        /import \{ API_BASE_URL \} from '\.\/apiResponses';?\r?\n/,
        "import { getWorkerApiBaseUrl } from './workerContext';\n"
      );
      next = next.replace(
        /import \{ API_BASE_URL, ([^}]+) \} from '\.\/apiResponses';?\r?\n/,
        "import { $1 } from './apiResponses';\nimport { getWorkerApiBaseUrl } from './workerContext';\n"
      );
    }
    next = next.replace(/\bAPI_BASE_URL\b/g, 'getWorkerApiBaseUrl()');
  }

  if (filePath.endsWith('apiResponses.ts') || filePath.endsWith('workerContext.ts')) {
    return content;
  }

  return next;
}

function migrateSpecFile(filePath, content) {
  if (!filePath.endsWith('.spec.ts')) {
    return content;
  }

  let next = content;
  const fixtureImport = relativeFixtureImport(filePath);

  next = next.replace(
    /import \{([^}]*)\}\s*from '@playwright\/test';/g,
    (match, imports) => {
      const parts = imports.split(',').map((s) => s.trim()).filter(Boolean);
      const testParts = [];
      const typeParts = [];

      for (const part of parts) {
        const normalized = part.replace(/^type\s+/, '');
        if (normalized === 'test' || normalized === 'expect') {
          testParts.push(normalized);
        } else if (part.startsWith('type ')) {
          typeParts.push(part.replace(/^type\s+/, ''));
        } else {
          typeParts.push(part);
        }
      }

      let result = '';
      if (testParts.length > 0) {
        result += `import { ${testParts.join(', ')} } from '${fixtureImport}';\n`;
      }
      if (typeParts.length > 0) {
        result += `import type { ${typeParts.join(', ')} } from '@playwright/test';\n`;
      }
      return result.trimEnd() + (result ? '\n' : match);
    }
  );

  if (next.includes('API_BASE_URL')) {
    const depth = path.relative(specsRoot, path.dirname(filePath)).split(path.sep).length;
    const prefix = '../'.repeat(depth) + 'helpers/workerContext';

    next = next.replace(
      /import \{ API_BASE_URL(?:, ([^}]+))? \} from '(\.\.\/)+helpers\/apiResponses';/g,
      (_, rest, _dots) => {
        const helperPrefix = '../'.repeat(depth) + 'helpers/apiResponses';
        const lines = [];
        if (rest) lines.push(`import { ${rest} } from '${helperPrefix}';`);
        lines.push(`import { getWorkerApiBaseUrl } from '${prefix}';`);
        return lines.join('\n');
      }
    );

    next = next.replace(/\bAPI_BASE_URL\b/g, 'getWorkerApiBaseUrl()');
  }

  return next;
}

function migrateFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  let next = original;

  if (filePath.includes(`${path.sep}helpers${path.sep}`)) {
    next = migrateHelperFile(filePath, next);
  } else if (filePath.endsWith('.spec.ts')) {
    next = migrateSpecFile(filePath, next);
  }

  if (next !== original) {
    fs.writeFileSync(filePath, next, 'utf8');
    console.log('updated', path.relative(path.join(__dirname, '..'), filePath));
  }
}

for (const file of walk(specsRoot)) {
  migrateFile(file);
}

console.log('done');
