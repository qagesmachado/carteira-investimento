# Perfis predefinidos na configuração

## Metadados

- **ID:** `UI-REB-015`
- **Status:** implementado
- **Página:** `/rebalanceamento/configuracao`
- **Arquivo de teste:** `e2e/specs/rebalanceamento/15-perfis-predefinidos.spec.ts`

## Cenário — aplicar perfil conservador

1. Abrir configuração de metas com carteira seedada.
2. Clicar em «Perfis predefinidos».
3. Selecionar perfil «Conservador» no modal.
4. Confirmar com «Aplicar perfil».
5. Verificar que os sliders refletem as metas do perfil (ex.: renda fixa 80%).
6. Salvar metas e confirmar mensagem de sucesso.
