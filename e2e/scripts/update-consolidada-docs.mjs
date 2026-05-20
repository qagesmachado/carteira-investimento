import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../casos-de-uso/ui/consolidada');

const files = fs.readdirSync(docsDir).filter((f) => /^\d{2}-.+\.md$/.test(f));

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const filePath = path.join(docsDir, file);
  let text = fs.readFileSync(filePath, 'utf8');
  const specPath = `e2e/specs/consolidada/${slug}.spec.ts`;

  text = text.replace(/- \*\*Status:\*\* .+/, '- **Status:** implementado');
  text = text.replace(/- \*\*Arquivo de teste \(fase 2\):\*\*[^\n]*/g, `- **Arquivo de teste:** \`${specPath}\``);
  text = text.replace(/- \*\*Lookup:\*\*[^\n]*/g, '- **Lookup:** yfinance (ou «não se aplica» nos casos sem rede)');
  if (slug === '01-carregamento-sem-carteira') {
    text = text.replace(
      /- \*\*Lookup:\*\*[^\n]*/,
      '- **Lookup:** não se aplica'
    );
  }
  text = text.replace(
    /frontend `http:\/\/127\.0\.0\.1:5173` · API `http:\/\/127\.0\.0\.1:8000`/g,
    'frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`'
  );
  text = text.replace(/AUPO11/g, 'AUVP11');
  text = text.replace(/ASSET_LOOKUP_MODE=fake/g, 'ASSET_LOOKUP_MODE=yfinance');
  fs.writeFileSync(filePath, text, 'utf8');
}

console.log('Updated', files.length, 'consolidada docs');
