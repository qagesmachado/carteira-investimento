import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import TopAssetRankBadge from './TopAssetRankBadge.svelte';

describe('TopAssetRankBadge', () => {
  it('renderiza medalha para ranks 1 a 3', () => {
    for (const rank of [1, 2, 3]) {
      const { getByTestId, getByLabelText } = render(TopAssetRankBadge, { props: { rank } });
      expect(getByTestId(`dashboard-top-rank-${rank}`)).toBeTruthy();
      expect(getByLabelText(`Posição ${rank}`)).toBeTruthy();
    }
  });

  it('renderiza numero simples para ranks 4 e 5', () => {
    const { getByTestId, getByText } = render(TopAssetRankBadge, { props: { rank: 4 } });
    expect(getByTestId('dashboard-top-rank-4')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
  });
});
