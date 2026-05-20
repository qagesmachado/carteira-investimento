import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const docsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../casos-de-uso/ui/assets');

const cases = [
  ['01-carregamento.md', '001', '01-carregamento'],
  ['02-busca-lookup-individual.md', '002', '02-busca-lookup-individual'],
  ['03-cadastro-manual-renda-fixa.md', '003', '03-cadastro-manual-renda-fixa'],
  ['04-cadastro-manual-previdencia.md', '004', '04-cadastro-manual-previdencia'],
  ['05-salvar-etf-nacional-subtipo-rf.md', '005', '05-salvar-etf-nacional-subtipo-rf'],
  ['06-listagem-busca-filtro.md', '006', '06-listagem-busca-filtro'],
  ['07-editar-ativo-lista.md', '007', '07-editar-ativo-lista'],
  ['08-excluir-ativo-lista.md', '008', '08-excluir-ativo-lista'],
  ['09-importacao-lote.md', '009', '09-importacao-lote'],
  ['10-fluxo-completo-lookup-ate-lista.md', '010', '10-fluxo-completo-lookup-ate-lista'],
  ['11-dispensar-alerta.md', '011', '11-dispensar-alerta'],
  ['12-lookup-erro-ticker-invalido.md', '012', '12-lookup-erro-ticker-invalido'],
  ['13-rf-validacao-campos-obrigatorios.md', '013', '13-rf-validacao-campos-obrigatorios'],
  ['14-ticker-duplicado.md', '014', '14-ticker-duplicado'],
  ['15-listagem-limpar-busca.md', '015', '15-listagem-limpar-busca'],
  ['16-excluir-cancelar.md', '016', '16-excluir-cancelar'],
  ['17-importacao-lote-ja-cadastrado.md', '017', '17-importacao-lote-ja-cadastrado'],
  ['18-importacao-lote-etf-subtipo.md', '018', '18-importacao-lote-etf-subtipo']
];

function specPath(slug) {
  return `e2e/specs/assets/${slug}.spec.ts`;
}

for (const [file, , slug] of cases) {
  const filePath = path.join(docsDir, file);
  let text = fs.readFileSync(filePath, 'utf8');
  const sp = specPath(slug);
  const testBlock = `- **Arquivo de teste:** \`${sp}\``;

  if (!text.includes('- **Status:**')) {
    continue;
  }

  text = text.replace(/- \*\*Status:\*\* .+/, '- **Status:** implementado');
  text = text.replace(/- \*\*Nível:\*\* .+\n/g, '');
  text = text.replace(/- \*\*Arquivo de teste \(fake\):\*\*[^\n]*\n/g, '');
  text = text.replace(/- \*\*Arquivo de teste \(complete\):\*\*[^\n]*\n/g, '');
  text = text.replace(/- \*\*Arquivo de teste:\*\*[^\n]*\n/g, '');

  if (!text.includes('Arquivo de teste')) {
    text = text.replace(/(- \*\*Depende de:\*\*[^\n]*\n)/, `$1${testBlock}\n`);
  } else {
    text = text.replace(
      /- \*\*Arquivo de teste[^]*?(?=\n- \*\*Referência|\n## )/s,
      `${testBlock}\n`
    );
  }

  if (!text.includes('- **Lookup:**')) {
    const lookup =
      slug.includes('lookup') ||
      slug.includes('importacao') ||
      slug.includes('etf') ||
      slug.includes('fluxo-completo') ||
      slug.includes('ticker-duplicado')
        ? 'yfinance'
        : 'não se aplica';
    text = text.replace(/(- \*\*Arquivo de teste:[^\n]*\n)/, `$1- **Lookup:** ${lookup}\n`);
  }

  text = text.replace(
    /frontend `http:\/\/127\.0\.0\.1:5173` · API `http:\/\/127\.0\.0\.1:8000`/g,
    'frontend `http://127.0.0.1:5174` · API `http://127.0.0.1:8001`'
  );

  text = text.replace(/npm run test:ui:(fake|complete)/g, 'npm run test:ui');

  fs.writeFileSync(filePath, text, 'utf8');
}

console.log('Updated', cases.length, 'docs');
