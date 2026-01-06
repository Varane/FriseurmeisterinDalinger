const state = {
  products: [],
  site: null,
  filters: {
    category: "all",
    min: "",
    max: "",
    search: "",
    sort: "featured"
  }
};

const elements = {
  category: document.getElementById("filter-category"),
  min: document.getElementById("filter-min"),
  max: document.getElementById("filter-max"),
  search: document.getElementById("filter-search"),
  sort: document.getElementById("filter-sort"),
  grid: document.getElementById("product-grid"),
  status: document.getElementById("shop-status"),
  dialog: document.getElementById("filters-dialog"),
  openDialog: document.getElementById("open-filters"),
  dialogCategory: document.getElementById("dialog-category"),
  dialogMin: document.getElementById("dialog-min"),
  dialogMax: document.getElementById("dialog-max"),
  dialogSearch: document.getElementById("dialog-search"),
  dialogSort: document.getElementById("dialog-sort"),
  dialogApply: document.getElementById("dialog-apply"),
  dialogReset: document.getElementById("dialog-reset"),
  footerYear: document.getElementById("footer-year")
};

const setText = (element, value) => {
  if (element) {
    element.textContent = value ?? "";
  }
};

const formatPrice = (value, currency) => `${value} ${currency}`;

const buildCategoryOptions = (products) => {
  const categories = Array.from(
    new Set(products.map((product) => product.category).filter(Boolean))
  ).sort();

  const options = ["all", ...categories];

  [elements.category, elements.dialogCategory].forEach((select) => {
    if (!select) return;
    select.innerHTML = "";
    options.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category === "all" ? "Alle Kategorien" : category;
      select.appendChild(option);
    });
  });
};

const updateFiltersFromInputs = () => {
  state.filters = {
    category: elements.category?.value || "all",
    min: elements.min?.value || "",
    max: elements.max?.value || "",
    search: elements.search?.value || "",
    sort: elements.sort?.value || "featured"
  };
};

const syncDialogInputs = () => {
  if (!elements.dialog) return;
  elements.dialogCategory.value = state.filters.category;
  elements.dialogMin.value = state.filters.min;
  elements.dialogMax.value = state.filters.max;
  elements.dialogSearch.value = state.filters.search;
  elements.dialogSort.value = state.filters.sort;
};

const syncInlineInputs = () => {
  if (!elements.category) return;
  elements.category.value = state.filters.category;
  elements.min.value = state.filters.min;
  elements.max.value = state.filters.max;
  elements.search.value = state.filters.search;
  elements.sort.value = state.filters.sort;
};

const applyFilters = () => {
  const { category, min, max, search, sort } = state.filters;
  let filtered = [...state.products];

  if (category !== "all") {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (min) {
    filtered = filtered.filter((product) => product.priceEur >= Number(min));
  }

  if (max) {
    filtered = filtered.filter((product) => product.priceEur <= Number(max));
  }

  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter((product) =>
      [product.name, product.brand, product.category]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(query))
    );
  }

  if (sort === "price-asc") {
    filtered.sort((a, b) => a.priceEur - b.priceEur);
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => b.priceEur - a.priceEur);
  } else {
    filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  renderProducts(filtered);
};

const renderEmptyState = () => {
  if (!elements.grid) return;
  elements.grid.innerHTML = "";

  const wrapper = document.createElement("div");
  wrapper.className = "card";

  const title = document.createElement("h3");
  setText(title, "Aktuell keine Produkte online.");

  const text = document.createElement("p");
  setText(text, "Schreib uns auf WhatsApp – wir empfehlen passende Pflege.");

  wrapper.append(title, text);

  if (state.site?.contact?.whatsAppUrl) {
    const cta = document.createElement("a");
    cta.className = "button primary";
    cta.setAttribute("href", state.site.contact.whatsAppUrl);
    cta.textContent = "WhatsApp schreiben";
    wrapper.appendChild(cta);
  }

  elements.grid.appendChild(wrapper);
  setText(elements.status, "Aktuell keine Produkte online.");
};

const renderProducts = (products) => {
  if (!elements.grid) return;
  elements.grid.innerHTML = "";

  if (!products.length) {
    renderEmptyState();
    return;
  }

  setText(elements.status, `${products.length} Produkte verfügbar`);

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const media = document.createElement("div");
    media.className = "product-media";
    setText(media, product.images?.[0]?.alt || "Produktbild");

    const body = document.createElement("div");
    body.className = "product-body";

    const badge = document.createElement("span");
    badge.className = "badge";
    setText(badge, product.featured ? "Featured" : "Signature");

    const title = document.createElement("h3");
    title.className = "product-title";
    setText(title, product.name);

    const meta = document.createElement("p");
    meta.className = "product-meta";
    setText(meta, `${product.brand} · ${product.category}`);

    if (product.shortDescription) {
      const desc = document.createElement("p");
      desc.className = "product-meta";
      setText(desc, product.shortDescription);
      body.append(badge, title, meta, desc);
    } else {
      body.append(badge, title, meta);
    }

    if (product.priceEur && product.currency) {
      const price = document.createElement("p");
      price.className = "product-price";
      setText(price, formatPrice(product.priceEur, product.currency));
      body.appendChild(price);
    }

    const actions = document.createElement("div");
    actions.className = "product-actions";

    if (product.paymentLinkUrl) {
      const buy = document.createElement("a");
      buy.className = "button primary";
      buy.setAttribute("target", "_blank");
      buy.setAttribute("rel", "noreferrer");
      buy.setAttribute("href", product.paymentLinkUrl);
      buy.textContent = "Jetzt kaufen";
      actions.appendChild(buy);
    }

    if (product.description) {
      const details = document.createElement("p");
      details.className = "product-meta";
      setText(details, product.description);
      actions.appendChild(details);
    }

    card.append(media, body, actions);
    elements.grid.appendChild(card);
  });
};

const initFilters = () => {
  if (!elements.category) return;

  const onInput = () => {
    updateFiltersFromInputs();
    applyFilters();
  };

  [elements.category, elements.min, elements.max, elements.search, elements.sort].forEach(
    (input) => input?.addEventListener("input", onInput)
  );
};

const initDialog = () => {
  if (!elements.dialog || !elements.openDialog) return;

  elements.openDialog.addEventListener("click", () => {
    syncDialogInputs();
    elements.dialog.showModal();
  });

  elements.dialogApply.addEventListener("click", () => {
    state.filters = {
      category: elements.dialogCategory.value,
      min: elements.dialogMin.value,
      max: elements.dialogMax.value,
      search: elements.dialogSearch.value,
      sort: elements.dialogSort.value
    };
    syncInlineInputs();
    applyFilters();
    elements.dialog.close();
  });

  elements.dialogReset.addEventListener("click", () => {
    state.filters = {
      category: "all",
      min: "",
      max: "",
      search: "",
      sort: "featured"
    };
    syncDialogInputs();
    syncInlineInputs();
    applyFilters();
  });
};

const loadShopData = async () => {
  try {
    const [productsResponse, siteResponse] = await Promise.all([
      fetch("../data/products.json"),
      fetch("../data/site.json")
    ]);

    if (siteResponse.ok) {
      state.site = await siteResponse.json();
    }

    if (!productsResponse.ok) {
      setText(elements.status, "Produkte konnten nicht geladen werden.");
      return;
    }

    const products = await productsResponse.json();
    state.products = products;
    buildCategoryOptions(products);
    initFilters();
    initDialog();
    applyFilters();
  } catch (error) {
    setText(elements.status, "Produkte konnten nicht geladen werden.");
  }
};

setText(elements.footerYear, new Date().getFullYear().toString());

loadShopData();
