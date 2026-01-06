const state = {
  products: [],
  contact: {
    whatsAppUrl: ""
  },
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

const formatPrice = (value) => (value ? `${value} EUR` : "Preis auf Anfrage");

const buildCategoryOptions = (products) => {
  const categories = Array.from(
    new Set(products.map((product) => product.category || "Kategorie"))
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

const getPriceValue = (product) =>
  typeof product.priceEur === "number" ? product.priceEur : null;

const applyFilters = () => {
  const { category, min, max, search, sort } = state.filters;
  let filtered = [...state.products];

  if (category !== "all") {
    filtered = filtered.filter((product) => product.category === category);
  }

  if (min) {
    filtered = filtered.filter((product) => {
      const price = getPriceValue(product);
      return price !== null && price >= Number(min);
    });
  }

  if (max) {
    filtered = filtered.filter((product) => {
      const price = getPriceValue(product);
      return price !== null && price <= Number(max);
    });
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
    filtered.sort((a, b) => {
      const priceA = getPriceValue(a) ?? Number.POSITIVE_INFINITY;
      const priceB = getPriceValue(b) ?? Number.POSITIVE_INFINITY;
      return priceA - priceB;
    });
  } else if (sort === "price-desc") {
    filtered.sort((a, b) => {
      const priceA = getPriceValue(a) ?? Number.NEGATIVE_INFINITY;
      const priceB = getPriceValue(b) ?? Number.NEGATIVE_INFINITY;
      return priceB - priceA;
    });
  } else {
    filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
  }

  renderProducts(filtered);
};

const renderProducts = (products) => {
  if (!elements.grid) return;
  elements.grid.innerHTML = "";

  setText(elements.status, `${products.length} Produkte verfügbar`);

  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const media = document.createElement("div");
    media.className = "product-media";
    setText(media, product.images?.[0]?.alt || "Produktfoto folgt");

    const body = document.createElement("div");
    body.className = "product-body";

    const badge = document.createElement("span");
    badge.className = "badge";
    setText(badge, product.featured ? "Featured" : "Signature");

    const title = document.createElement("h3");
    title.className = "product-title";
    setText(title, product.name || "Produkt");

    const meta = document.createElement("p");
    meta.className = "product-meta";
    setText(meta, `${product.brand || "Studio"} · ${product.category || "Kategorie"}`);

    const desc = document.createElement("p");
    desc.className = "product-meta";
    setText(desc, product.shortDescription || "Details folgen.");

    const price = document.createElement("p");
    price.className = "product-price";
    setText(price, formatPrice(getPriceValue(product)));

    body.append(badge, title, meta, desc, price);

    const actions = document.createElement("div");
    actions.className = "product-actions";

    const buy = document.createElement("a");
    buy.className = "button primary";
    buy.setAttribute("target", "_blank");
    buy.setAttribute("rel", "noreferrer");

    if (product.paymentLinkUrl) {
      buy.setAttribute("href", product.paymentLinkUrl);
      buy.textContent = "Jetzt kaufen";
    } else {
      const message = encodeURIComponent(
        `Hallo Ina, ich möchte „${product.name}“ per WhatsApp bestellen.`
      );
      const whatsAppBase = state.contact.whatsAppUrl || "https://wa.me/4917678136186";
      buy.setAttribute("href", `${whatsAppBase}?text=${message}`);
      buy.textContent = "Per WhatsApp bestellen";
    }

    const details = document.createElement("p");
    details.className = "product-meta";
    setText(details, product.description || "Details folgen.");

    actions.append(buy, details);

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

const loadContent = async () => {
  try {
    const [productsResponse, siteResponse] = await Promise.all([
      fetch("../data/products.json"),
      fetch("../data/site.json")
    ]);
    if (!productsResponse.ok || !siteResponse.ok) {
      throw new Error("Failed to load content");
    }
    const products = await productsResponse.json();
    const site = await siteResponse.json();
    state.products = products;
    state.contact.whatsAppUrl = site.contact?.whatsAppUrl || "";
    buildCategoryOptions(products);
    initFilters();
    initDialog();
    applyFilters();
  } catch (error) {
    setText(elements.status, "Produkte konnten nicht geladen werden.");
  }
};

setText(elements.footerYear, new Date().getFullYear().toString());

loadContent();
