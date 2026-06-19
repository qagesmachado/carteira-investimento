<script lang="ts">
  import type { Asset, AssetCreate, AssetMarket, AssetType, AssetUpdate, EtfSubtype, FixedIncomeIndexer } from '$lib/api/assets';
  import {
    buildFixedIncomeIdentifier,
    FIXED_INCOME_INDEXER_OPTIONS,
    FIXED_INCOME_TITLE_OPTIONS,
    KNOWN_TITLE_TYPE_CODES
  } from '$lib/features/assets/fixedIncomeIdentifier';
  import {
    COUNTRY_SELECT_OPTIONS,
    CURRENCY_SELECT_OPTIONS,
    formatCountryCodeForDisplay,
    formatCurrencyCodeForDisplay,
    formatDecimalBR,
    formatSectorForDisplay,
    parseDecimalBR
  } from '$lib/assetLabels';
  import { formatIsoDateToBr, parseBrDateToIso, sanitizeBrDateTyping } from '$lib/brDate';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let asset: Partial<AssetCreate> | null = null;
  export let mode: 'create' | 'edit' = 'create';
  export let onSave: (payload: AssetCreate) => Promise<void> | void = () => undefined;
  export let onUpdate: ((payload: AssetUpdate) => Promise<void> | void) | null = null;
  export let onCancel: (() => void) | undefined = undefined;
  export let loading = false;
  /** Rótulo do botão principal; padrão conforme modo create/edit. */
  export let submitLabel = '';
  export let cancelLabel = 'Cancelar edição';
  /** Exibe botão de cancelar (ex.: modal de revisão do lote). */
  export let showCancelButton = false;
  /** Desabilita o seletor de tipo (ex.: cadastro de RF/previdência na carteira). */
  export let lockType = false;
  /** Torna o identificador somente leitura (ex.: edição de RF na carteira). */
  export let readonlySymbol = false;
  /** Restringe os tipos disponíveis no seletor. `null` = todos. */
  export let availableTypes: AssetType[] | null = null;
  /** Exibe o alerta «vá em Carteiras para informar os valores». */
  export let showInfoAlert = true;
  /** Título do cabeçalho do formulário. */
  export let headerTitle = 'Dados do ativo';
  /** Classe do elemento `<form>` (permite embutir sem card/shadow). */
  export let formClass = 'card bg-base-100 shadow-xl';

  $: resolvedSubmitLabel =
    submitLabel || (mode === 'edit' ? 'Atualizar ativo' : 'Salvar ativo');

  const assetTypes: { value: AssetType; label: string }[] = [
    { value: 'stock', label: 'Ação' },
    { value: 'etf', label: 'ETF' },
    { value: 'fii', label: 'Fundo imobiliário' },
    { value: 'fixed_income', label: 'Renda fixa' },
    { value: 'crypto', label: 'Cripto' },
    { value: 'pension', label: 'Previdência' },
    { value: 'other', label: 'Outro' }
  ];

  $: typeOptions = availableTypes
    ? assetTypes.filter((t) => availableTypes!.includes(t.value))
    : assetTypes;

  const markets: { value: AssetMarket; label: string }[] = [
    { value: 'national', label: 'Nacional' },
    { value: 'international', label: 'Internacional' }
  ];

  let symbol = '';
  let name = '';
  let asset_type: AssetType = 'stock';
  let market: AssetMarket = 'national';
  let country = 'BR';
  let currency = 'BRL';
  let etf_subtype: EtfSubtype | '' = '';
  let sector = '';
  let subsector = '';
  let segment = '';
  let company_cnpj = '';
  let payer_cnpj = '';
  let payer_name = '';
  let current_quote = '';
  let quote_source = '';
  let notes = '';
  let fixed_income_indexer: FixedIncomeIndexer | '' = '';
  let fixed_income_yield_description = '';
  let titleTypeSelect = 'cdb';
  let titleTypeOther = '';
  let maturity_date = '';
  let purchase_date = '';
  let identifierGenHint = '';
  let formDateError = '';

  let loadedSourceKey = '';

  function assetSourceKey(source: Partial<AssetCreate> | null): string {
    if (!source) {
      return '';
    }
    const id = 'id' in source && typeof (source as Asset).id === 'number' ? (source as Asset).id : '';
    return `${mode}:${id}:${source.symbol ?? ''}:${source.asset_type ?? ''}:${source.maturity_date ?? ''}:${source.fixed_income_title_type ?? ''}`;
  }

  function applyAsset(source: Partial<AssetCreate> | null) {
    if (!source) {
      symbol = '';
      name = '';
      asset_type = 'stock';
      market = 'national';
      country = 'BR';
      currency = 'BRL';
      etf_subtype = '';
      sector = '';
      subsector = '';
      segment = '';
      company_cnpj = '';
      payer_cnpj = '';
      payer_name = '';
      current_quote = '';
      quote_source = '';
      notes = '';
      fixed_income_indexer = '';
      fixed_income_yield_description = '';
      titleTypeSelect = 'cdb';
      titleTypeOther = '';
      maturity_date = '';
      purchase_date = '';
      identifierGenHint = '';
      formDateError = '';
      return;
    }

    symbol = formatTickerForDisplay(source.symbol ?? '');
    name = source.name ?? '';
    asset_type = source.asset_type ?? 'stock';
    market = source.market ?? 'national';
    country = (source.country ?? 'BR').trim().toUpperCase() || 'BR';
    currency = (source.currency ?? 'BRL').trim().toUpperCase() || 'BRL';
    etf_subtype = (source.etf_subtype as EtfSubtype | null | undefined) ?? '';
    sector = formatSectorForDisplay(source.sector ?? '');
    subsector = source.subsector ?? '';
    segment = source.segment ?? '';
    company_cnpj = source.company_cnpj ?? '';
    payer_cnpj = source.payer_cnpj ?? '';
    payer_name = source.payer_name ?? '';
    current_quote =
      source.current_quote != null && source.current_quote !== undefined
        ? formatDecimalBR(source.current_quote)
        : '';
    quote_source = source.quote_source ?? '';
    notes = source.notes ?? '';
    fixed_income_indexer = (source.fixed_income_indexer as FixedIncomeIndexer | null | undefined) ?? '';
    fixed_income_yield_description = source.fixed_income_yield_description ?? '';
    const tt = source.fixed_income_title_type?.trim() ?? '';
    if (tt && KNOWN_TITLE_TYPE_CODES.has(tt)) {
      titleTypeSelect = tt;
      titleTypeOther = '';
    } else if (tt) {
      titleTypeSelect = 'other';
      titleTypeOther = tt;
    } else {
      titleTypeSelect = 'cdb';
      titleTypeOther = '';
    }
    maturity_date = formatIsoDateToBr(source.maturity_date);
    purchase_date = formatIsoDateToBr(source.purchase_date);
    identifierGenHint = '';
    formDateError = '';
  }

  $: sourceKey = assetSourceKey(asset);
  $: if (sourceKey !== loadedSourceKey) {
    loadedSourceKey = sourceKey;
    applyAsset(asset);
  }

  $: showEtfSubtype = asset_type === 'etf' && market === 'national';
  $: isManualProduct = asset_type === 'fixed_income' || asset_type === 'pension';
  $: isFixedIncome = asset_type === 'fixed_income';
  $: symbolLabel = isManualProduct ? 'Identificador' : 'Ticker';
  $: nameLabel = isManualProduct ? 'Descrição do produto' : 'Nome';
  $: symbolPlaceholder = isManualProduct
    ? 'Ex.: CDB BTG IPCA+ 2028'
    : 'PETR4';
  $: namePlaceholder = isManualProduct
    ? 'Ex.: CDB Banco BTG — IPCA + 8,40% a.a.'
    : '';

  $: countryOptions = (() => {
    const u = country?.trim().toUpperCase();
    const known = new Set(COUNTRY_SELECT_OPTIONS.map((o) => o.value));
    const out = [...COUNTRY_SELECT_OPTIONS];
    if (u && !known.has(u)) {
      out.unshift({ value: u, label: formatCountryCodeForDisplay(u) });
    }
    return out.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  })();

  $: currencyOptions = (() => {
    const u = currency?.trim().toUpperCase();
    const known = new Set(CURRENCY_SELECT_OPTIONS.map((o) => o.value));
    const out = [...CURRENCY_SELECT_OPTIONS];
    if (u && !known.has(u)) {
      out.unshift({ value: u, label: formatCurrencyCodeForDisplay(u) });
    }
    return out.sort((a, b) => a.label.localeCompare(b.label, 'pt-BR'));
  })();

  function handleGenerateIdentifier() {
    const iso = parseBrDateToIso(maturity_date);
    const result = buildFixedIncomeIdentifier({
      titleTypeCode: titleTypeSelect,
      titleTypeOther,
      indexer: fixed_income_indexer || null,
      maturityDateIso: iso ?? ''
    });
    if (!result.ok) {
      identifierGenHint = result.reason;
      return;
    }
    identifierGenHint = '';
    symbol = result.value;
  }

  function rfPayloadFields(): Pick<
    AssetCreate,
    | 'fixed_income_indexer'
    | 'fixed_income_yield_description'
    | 'fixed_income_title_type'
    | 'maturity_date'
    | 'purchase_date'
  > {
    if (asset_type !== 'fixed_income') {
      return {
        fixed_income_indexer: null,
        fixed_income_yield_description: null,
        fixed_income_title_type: null,
        maturity_date: null,
        purchase_date: null
      };
    }
    const titleStored =
      titleTypeSelect === 'other' ? titleTypeOther.trim() || null : titleTypeSelect || null;
    return {
      fixed_income_indexer: fixed_income_indexer || null,
      fixed_income_yield_description: fixed_income_yield_description.trim() || null,
      fixed_income_title_type: titleStored,
      maturity_date: parseBrDateToIso(maturity_date) || null,
      purchase_date: parseBrDateToIso(purchase_date) || null
    };
  }

  function validateRfDates(): boolean {
    formDateError = '';
    if (asset_type !== 'fixed_income') {
      return true;
    }
    if (maturity_date.trim() && !parseBrDateToIso(maturity_date)) {
      formDateError = 'Data de vencimento inválida. Use DD/MM/AAAA (ex.: 15/06/2028).';
      return false;
    }
    if (purchase_date.trim() && !parseBrDateToIso(purchase_date)) {
      formDateError = 'Data de compra inválida. Use DD/MM/AAAA (ex.: 15/06/2028).';
      return false;
    }
    return true;
  }

  function blurNormalizeMaturity() {
    const iso = parseBrDateToIso(maturity_date);
    if (iso) {
      maturity_date = formatIsoDateToBr(iso);
    }
  }

  function blurNormalizePurchase() {
    const iso = parseBrDateToIso(purchase_date);
    if (iso) {
      purchase_date = formatIsoDateToBr(iso);
    }
  }

  function handleMaturityInput(event: Event) {
    const t = event.currentTarget as HTMLInputElement;
    maturity_date = sanitizeBrDateTyping(t.value);
    t.value = maturity_date;
  }

  function handlePurchaseInput(event: Event) {
    const t = event.currentTarget as HTMLInputElement;
    purchase_date = sanitizeBrDateTyping(t.value);
    t.value = purchase_date;
  }

  async function submit() {
    if (!validateRfDates()) {
      return;
    }
    const payload: AssetCreate = {
      symbol,
      name,
      asset_type,
      market,
      country: country || null,
      currency,
      etf_subtype: showEtfSubtype && etf_subtype ? etf_subtype : null,
      sector: isManualProduct ? null : sector || null,
      subsector: isManualProduct ? null : subsector || null,
      segment: isManualProduct ? null : segment || null,
      company_cnpj: company_cnpj || null,
      payer_cnpj: payer_cnpj || null,
      payer_name: payer_name || null,
      quote_source: isManualProduct ? null : quote_source || null,
      current_quote: isManualProduct ? null : parseDecimalBR(current_quote),
      notes: notes || null,
      ...rfPayloadFields()
    };

    if (mode === 'edit' && onUpdate) {
      await onUpdate(payload);
    } else {
      await onSave(payload);
    }
  }
</script>

<form class={formClass} on:submit|preventDefault={submit}>
  <div class="card-body gap-4">
    <div>
      <p class="text-sm font-semibold uppercase tracking-wide text-primary">Revisão</p>
      <h2 class="card-title">{headerTitle}</h2>
      <p class="text-sm text-base-content/70">
        {#if isManualProduct}
          Cadastro manual do produto. Valor aplicado, valor atual e rendimento contratado são informados na
          carteira, ao adicionar a posição.
        {:else}
          Revise ou complemente os dados antes de salvar na base.
        {/if}
      </p>
    </div>

    {#if isManualProduct && showInfoAlert}
      <div class="alert alert-info text-sm shadow-none">
        <span>
          Use um identificador único por contrato (ex.: «CDB BTG IPCA+ 2028»). Depois de salvar, vá em
          <strong>Carteiras</strong> para informar os valores da sua aplicação.
        </span>
      </div>
    {/if}

    <div class="grid gap-4 md:grid-cols-2">
      <label class="form-control">
        <span class="label justify-between gap-2">
          <span class="label-text">{symbolLabel}</span>
          {#if isFixedIncome && !readonlySymbol}
            <button
              type="button"
              class="btn btn-outline btn-xs shrink-0"
              on:click|preventDefault={handleGenerateIdentifier}
            >
              Gerar identificador
            </button>
          {/if}
        </span>
        <input
          bind:value={symbol}
          class="input input-bordered"
          placeholder={symbolPlaceholder}
          readonly={readonlySymbol}
          required
        />
        {#if isFixedIncome && identifierGenHint}
          <span class="label-text-alt text-error">{identifierGenHint}</span>
        {/if}
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">{nameLabel}</span></span>
        <input
          bind:value={name}
          class="input input-bordered"
          placeholder={namePlaceholder}
          required
        />
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">Tipo</span></span>
        <select bind:value={asset_type} class="select select-bordered" disabled={lockType}>
          {#each typeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">Mercado</span></span>
        <select bind:value={market} class="select select-bordered">
          {#each markets as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <div class="form-control">
        <label class="label" for="asset-country"><span class="label-text">País</span></label>
        <select id="asset-country" bind:value={country} class="select select-bordered">
          {#each countryOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      <div class="form-control">
        <label class="label" for="asset-currency"><span class="label-text">Moeda</span></label>
        <select id="asset-currency" bind:value={currency} class="select select-bordered" required>
          {#each currencyOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </div>

      {#if showEtfSubtype}
        <label class="form-control">
          <span class="label"><span class="label-text">Tipo do ETF nacional</span></span>
          <select bind:value={etf_subtype} class="select select-bordered" required>
            <option value="" disabled>Selecione</option>
            <option value="variable_income">Renda variável</option>
            <option value="fixed_income">Renda fixa</option>
          </select>
        </label>
      {/if}

      {#if isFixedIncome}
        <div class="md:col-span-2 rounded-lg border border-base-300 bg-base-200/30 p-4">
          <p class="mb-3 text-sm font-semibold text-base-content/90">Dados da renda fixa</p>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="form-control">
              <span class="label"><span class="label-text">Tipo de título</span></span>
              <select bind:value={titleTypeSelect} class="select select-bordered">
                {#each FIXED_INCOME_TITLE_OPTIONS as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            </label>

            {#if titleTypeSelect === 'other'}
              <label class="form-control">
                <span class="label"><span class="label-text">Outro tipo (texto livre)</span></span>
                <input
                  bind:value={titleTypeOther}
                  class="input input-bordered"
                  placeholder="Ex.: CRI, CRA"
                />
              </label>
            {/if}

            <label class="form-control">
              <span class="label"><span class="label-text">Indexador</span></span>
              <select bind:value={fixed_income_indexer} class="select select-bordered">
                <option value="">Selecione</option>
                {#each FIXED_INCOME_INDEXER_OPTIONS as opt}
                  <option value={opt.value}>{opt.label}</option>
                {/each}
              </select>
            </label>

            <label class="form-control md:col-span-2">
              <span class="label"><span class="label-text">Rentabilidade</span></span>
              <input
                bind:value={fixed_income_yield_description}
                class="input input-bordered"
                placeholder="Ex.: 107% CDI, IPCA + 8,4% a.a."
              />
            </label>

            <label class="form-control">
              <span class="label"><span class="label-text">Data de vencimento</span></span>
              <input
                class="input input-bordered font-mono"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="DD/MM/AAAA"
                value={maturity_date}
                maxlength="10"
                on:input={handleMaturityInput}
                on:blur={blurNormalizeMaturity}
              />
            </label>

            <label class="form-control">
              <span class="label"><span class="label-text">Data de compra</span></span>
              <input
                class="input input-bordered font-mono"
                type="text"
                inputmode="numeric"
                autocomplete="off"
                placeholder="DD/MM/AAAA"
                value={purchase_date}
                maxlength="10"
                on:input={handlePurchaseInput}
                on:blur={blurNormalizePurchase}
              />
            </label>
          </div>
          {#if formDateError}
            <p class="mt-2 text-sm text-error">{formDateError}</p>
          {/if}
          <p class="mt-2 text-xs text-base-content/60">
            Datas em formato brasileiro (DD/MM/AAAA). Você pode digitar ou colar; também é aceito colar no formato
            ISO (AAAA-MM-DD). O botão «Gerar identificador» usa o ano da data de vencimento.
          </p>
        </div>
      {/if}
    </div>

    {#if !isManualProduct}
      <div>
        <p class="mb-2 text-sm font-semibold text-base-content/80">Classificação</p>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label"><span class="label-text">Setor</span></span>
            <input bind:value={sector} class="input input-bordered" placeholder="Ex.: Saúde" />
          </label>

          <label class="form-control">
            <span class="label"><span class="label-text">Subsetor</span></span>
            <input bind:value={subsector} class="input input-bordered" />
          </label>

          <label class="form-control md:col-span-2">
            <span class="label"><span class="label-text">Segmento</span></span>
            <input bind:value={segment} class="input input-bordered" />
          </label>
        </div>
      </div>
    {/if}

    <div>
      <p class="mb-2 text-sm font-semibold text-base-content/80">
        {isManualProduct ? 'Emissor e fonte pagadora' : 'Dados fiscais'}
      </p>
      <div class="grid gap-4 md:grid-cols-2">
        <label class="form-control">
          <span class="label"
            ><span class="label-text"
              >{isManualProduct ? 'CNPJ do emissor' : 'CNPJ da empresa / emissor'}</span
            ></span
          >
          <input bind:value={company_cnpj} class="input input-bordered" placeholder="00.000.000/0000-00" />
        </label>

        <label class="form-control">
          <span class="label"><span class="label-text">CNPJ da fonte pagadora</span></span>
          <input bind:value={payer_cnpj} class="input input-bordered" placeholder="00.000.000/0000-00" />
        </label>

        <label class="form-control md:col-span-2">
          <span class="label"><span class="label-text">Nome da fonte pagadora</span></span>
          <input bind:value={payer_name} class="input input-bordered" />
        </label>
      </div>
    </div>

    {#if !isManualProduct}
      <div>
        <p class="mb-2 text-sm font-semibold text-base-content/80">Cotação</p>
        <div class="grid gap-4 md:grid-cols-2">
          <label class="form-control">
            <span class="label"><span class="label-text">Cotação atual</span></span>
            <input
              bind:value={current_quote}
              class="input input-bordered"
              inputmode="decimal"
              placeholder="0,00"
              lang="pt-BR"
            />
          </label>

          <label class="form-control">
            <span class="label"><span class="label-text">Fonte da cotação</span></span>
            <input bind:value={quote_source} class="input input-bordered" />
          </label>
        </div>
      </div>
    {/if}

    <label class="form-control">
      <span class="label"
        ><span class="label-text"
          >{isManualProduct && !isFixedIncome
          ? 'Observações (indexador, vencimento, liquidez)'
          : isFixedIncome
            ? 'Observações adicionais'
            : 'Observações'}</span
        ></span
      >
      <textarea
        bind:value={notes}
        class="textarea textarea-bordered"
        rows={isManualProduct ? 3 : 2}
        placeholder={isManualProduct
          ? 'Liquidez, observações adicionais — indexador e vencimento podem ir nos campos acima.'
          : ''}
      />
    </label>

    <slot name="portfolio-values" />

    <div class="card-actions justify-between gap-2">
      {#if showCancelButton && onCancel}
        <button class="btn btn-ghost" type="button" on:click={onCancel}>{cancelLabel}</button>
      {:else if mode === 'edit' && onCancel}
        <button class="btn btn-ghost" type="button" on:click={onCancel}>{cancelLabel}</button>
      {:else}
        <span />
      {/if}
      <button class="btn btn-primary" type="submit" disabled={loading}>
        {#if loading}
          Salvando...
        {:else}
          {resolvedSubmitLabel}
        {/if}
      </button>
    </div>
  </div>
</form>
