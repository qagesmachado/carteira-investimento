import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../casos-de-uso/ui/portfolios');

const files = fs.readdirSync(docsDir).filter((f) => /^\d{2}-.+\.md$/.test(f));

const noLookup = new Set([
  '01-carregamento-carteiras',
  '02-criar-carteira',
  '13-criar-carteira-nome-obrigatorio',
  '03-renomear-carteira',
  '14-excluir-carteira',
  '04-trocar-carteira-ativa'
]);

for (const file of files) {
  const slug = file.replace(/\.md$/, '');
  const filePath = path.join(docsDir, file);
  let text = fs.readFileSync(filePath, 'utf8');
  const specPath = `e2e/specs/portfolios/${slug}.spec.ts`;

  text = text.replace(/- \*\*Status:\*\* .+/, '- **Status:** implementado');
  text = text.replace(/- \*\*Arquivo de teste[^\n]*/g, `- **Arquivo de teste:** \`${specPath}\``);
  if (!text.includes('- **Arquivo de teste:**')) {
    text = text.replace(
      /(- \*\*Status:\*\* implementado\n)/,
      `$1- **Arquivo de teste:** \`${specPath}\`\n`
    );
  }
  const lookupLine = noLookup.has(slug)
    ? '- **Lookup:** não se aplica'
    : '- **Lookup:** yfinance';
  text = text.replace(/- \*\*Lookup:\*\*[^\n]*/g, lookupLine);
  text = text.replace(
    /frontend `http:\/\/127\.0\.0\.1:5173` · API `http:\/\/127\.0\.0\.1:8000`/g,
    'frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`'
  );
  text = text.replace(/ASSET_LOOKUP_MODE=fake/g, 'ASSET_LOOKUP_MODE=yfinance');
  fs.writeFileSync(filePath, text, 'utf8');
}

console.log('Updated', files.length, 'portfolios docs');
