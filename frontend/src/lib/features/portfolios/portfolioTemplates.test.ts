import { describe, expect, it } from 'vitest';

import { buildPortfolioCreatePayload, getPortfolioTemplate } from './portfolioTemplates';

describe('portfolioTemplates', () => {
  it('template simulação usa status simulation', () => {
    const template = getPortfolioTemplate('simulation');
    expect(template.status).toBe('simulation');
    expect(template.suggestedName).toContain('simulação');
  });

  it('monta payload de criação com metadados do template', () => {
    const payload = buildPortfolioCreatePayload({
      name: 'Minha reserva',
      templateId: 'emergency',
      allocationTargetsJson: '{"classes":{}}',
      holder: 'Eu'
    });
    expect(payload.name).toBe('Minha reserva');
    expect(payload.holder).toBe('Eu');
    expect(payload.objective).toContain('reserva');
    expect(payload.status).toBe('active');
    expect(payload.allocation_targets_json).toBe('{"classes":{}}');
  });
});
