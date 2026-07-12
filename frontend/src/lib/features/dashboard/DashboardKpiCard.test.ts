import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

import DashboardKpiCard from './DashboardKpiCard.svelte';

describe('DashboardKpiCard', () => {
  it('renders title and value', () => {
    const { getByText, getByTestId } = render(DashboardKpiCard, {
      props: {
        title: 'Patrimônio total',
        value: 'R$ 1.000,00',
        lucideIcon: 'Wallet',
        testId: 'kpi-patrimony'
      }
    });
    expect(getByText('Patrimônio total')).toBeTruthy();
    expect(getByText('R$ 1.000,00')).toBeTruthy();
    expect(getByTestId('lucide-icon-Wallet')).toBeTruthy();
  });

  it('masks BRL values when hideMoneyValues is on', () => {
    setHideMoneyValues(true);
    const { getByText } = render(DashboardKpiCard, {
      props: {
        title: 'Patrimônio total',
        value: 'R$ 1.000,00',
        lucideIcon: 'Wallet'
      }
    });
    expect(getByText('R$ ••••••')).toBeTruthy();
    setHideMoneyValues(false);
  });

  it('shows profit badge with soft box styling', () => {
    const { getByText, getByTestId } = render(DashboardKpiCard, {
      props: {
        title: 'Lucro',
        value: '+R$ 100,00',
        icon: 'trend-up',
        badge: '+10,0%',
        badgeClass: 'bg-success/15 text-success',
        maskValue: false,
        testId: 'kpi-profit'
      }
    });
    expect(getByText('+10,0%')).toBeTruthy();
    const badge = getByTestId('kpi-profit-badge');
    expect(badge.className).toContain('bg-success/15');
    expect(badge.className).toContain('text-success');
  });

  it('renders optional action button on the right', () => {
    const { getByTestId, getByText, queryByText } = render(DashboardKpiCard, {
      props: {
        title: 'Proventos (mês)',
        value: 'R$ 0,00',
        lucideIcon: 'Receipt',
        testId: 'kpi-dividends-month',
        actionHref: '/proventos',
        actionLabel: 'Cadastrar proventos'
      }
    });
    const action = getByTestId('kpi-dividends-month-action');
    expect(action).toBeTruthy();
    expect(action.getAttribute('href')).toBe('/proventos');
    expect(action.className).toContain('btn');
    expect(getByText('Cadastrar proventos')).toBeTruthy();
    expect(queryByText('lançamento')).toBeNull();
  });

  it('renders patrimony filter checkboxes when availability has options', () => {
    const { getByTestId } = render(DashboardKpiCard, {
      props: {
        title: 'Patrimônio total',
        value: 'R$ 1.000,00',
        lucideIcon: 'Wallet',
        testId: 'kpi-patrimony',
        filterAvailability: { hasNonInvestment: true, hasPension: false }
      }
    });
    expect(getByTestId('dashboard-patrimony-filters')).toBeTruthy();
    expect(getByTestId('dashboard-filter-non-investment')).toBeTruthy();
  });
});
