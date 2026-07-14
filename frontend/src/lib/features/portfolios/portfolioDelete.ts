export function portfolioDeleteConfirmMessage(name: string): string {
  return `Excluir carteira «${name}» e todas as posições?`;
}

export function confirmPortfolioDelete(name: string): boolean {
  return confirm(portfolioDeleteConfirmMessage(name));
}
