function resolveTarget(target: string | HTMLElement): HTMLElement {
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target) ?? document.body;
  }
  return target;
}

/**
 * Move o nó para outro ancestral (ex.: dialog ou body).
 * Dentro de `<dialog>`, preferir o próprio dialog — o top layer do navegador
 * fica acima de nós anexados só ao body.
 */
export function portal(
  node: HTMLElement,
  target: string | HTMLElement = 'body',
): { update: (target: string | HTMLElement) => void; destroy: () => void } {
  let currentTarget = resolveTarget(target);

  function mount() {
    currentTarget.appendChild(node);
  }

  mount();

  return {
    update(newTarget: string | HTMLElement) {
      node.remove();
      currentTarget = resolveTarget(newTarget);
      mount();
    },
    destroy() {
      node.remove();
    },
  };
}
