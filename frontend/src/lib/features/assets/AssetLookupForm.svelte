<script lang="ts">
  export let onLookup: (symbol: string) => Promise<void> | void = () => undefined;
  export let loading = false;

  let symbol = '';

  async function submit() {
    const normalizedSymbol = symbol.trim();

    if (!normalizedSymbol) {
      return;
    }

    await onLookup(normalizedSymbol);
  }
</script>

<form class="card bg-base-100 shadow-xl" on:submit|preventDefault={submit}>
  <div class="card-body gap-4">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">Buscar ativo</p>
      <h2 class="card-title">Pré-cadastro via yfinance</h2>
      <p class="text-sm text-base-content/70">
        Informe um ticker, como PETR4, VOO ou BTC-USD. Você poderá revisar antes de salvar.
      </p>
    </div>

    <label class="form-control">
      <span class="label">
        <span class="label-text">Ticker ou símbolo</span>
      </span>
      <input
        bind:value={symbol}
        class="input input-bordered"
        placeholder="PETR4"
        autocomplete="off"
      />
    </label>

    <div class="card-actions justify-end">
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar ativo'}
      </button>
    </div>
  </div>
</form>
