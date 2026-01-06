const elements = {
  tagline: document.getElementById("site-tagline"),
  heroHeadline: document.getElementById("hero-headline"),
  heroSubheadline: document.getElementById("hero-subheadline"),
  aboutText: document.getElementById("about-text"),
  servicesGrid: document.getElementById("services-grid"),
  featuredGrid: document.getElementById("featured-products"),
  contactAddress: document.getElementById("contact-address"),
  contactPhone: document.getElementById("contact-phone"),
  contactWhatsApp: document.getElementById("contact-whatsapp"),
  contactMaps: document.getElementById("contact-maps"),
  heroCta: document.getElementById("hero-cta"),
  bookingLink: document.getElementById("booking-link"),
  footerYear: document.getElementById("footer-year"),
  instagramLink: document.getElementById("instagram-link")
};

const setText = (element, value) => {
  if (element) {
    element.textContent = value ?? "";
  }
};

const renderServices = (services = []) => {
  if (!elements.servicesGrid) return;
  elements.servicesGrid.innerHTML = "";

  services.forEach((service) => {
    const card = document.createElement("article");
    card.className = "card";

    const title = document.createElement("h3");
    setText(title, service.title || "Service");

    const desc = document.createElement("p");
    setText(desc, service.description || "Details folgen.");

    card.append(title, desc);
    elements.servicesGrid.appendChild(card);
  });
};

const renderFeaturedProducts = (products = []) => {
  if (!elements.featuredGrid) return;
  elements.featuredGrid.innerHTML = "";

  products
    .filter((product) => product.featured)
    .slice(0, 3)
    .forEach((product) => {
      const card = document.createElement("article");
      card.className = "card";

      const title = document.createElement("h3");
      setText(title, product.name || "Produkt");

      const meta = document.createElement("p");
      meta.className = "product-meta";
      setText(meta, `${product.brand || "Studio"} · ${product.category || "Kategorie"}`);

      const desc = document.createElement("p");
      setText(desc, product.shortDescription || "Details folgen.");

      const price = document.createElement("p");
      price.className = "product-price";
      setText(price, product.priceEur ? `${product.priceEur} ${product.currency || "EUR"}` : "Preis auf Anfrage");

      card.append(title, meta, desc, price);
      elements.featuredGrid.appendChild(card);
    });
};

const renderBookingLinks = (site) => {
  const bookingUrl = site.bookingUrl;
  const target = bookingUrl || "#contact";

  if (elements.heroCta) {
    elements.heroCta.setAttribute("href", target);
  }
  if (elements.bookingLink) {
    elements.bookingLink.setAttribute("href", target);
  }
};

const loadContent = async () => {
  try {
    const [siteResponse, productsResponse] = await Promise.all([
      fetch("./data/site.json"),
      fetch("./data/products.json")
    ]);

    if (!siteResponse.ok || !productsResponse.ok) {
      throw new Error("Content fetch failed");
    }

    const site = await siteResponse.json();
    const products = await productsResponse.json();

    setText(elements.tagline, site.tagline);
    setText(elements.heroHeadline, site.heroHeadline);
    setText(elements.heroSubheadline, site.heroSubheadline);
    setText(elements.aboutText, site.aboutText);

    renderServices(site.services || []);
    renderFeaturedProducts(products || []);

    setText(elements.contactAddress, site.contact?.address);
    if (elements.contactPhone && site.contact?.phone) {
      elements.contactPhone.setAttribute("href", `tel:${site.contact.phone.replace(/\s+/g, "")}`);
      elements.contactPhone.textContent = site.contact.phone;
    }
    if (elements.contactWhatsApp && site.contact?.whatsAppUrl) {
      elements.contactWhatsApp.setAttribute("href", site.contact.whatsAppUrl);
    }

    if (elements.contactMaps) {
      elements.contactMaps.setAttribute("href", site.contact?.mapsUrl || "#");
    }

    if (elements.instagramLink && site.socials?.instagramUrl) {
      elements.instagramLink.setAttribute("href", site.socials.instagramUrl);
    }

    renderBookingLinks(site);
  } catch (error) {
    const fallback = document.createElement("p");
    fallback.className = "product-meta";
    fallback.textContent = "Inhalte konnten nicht geladen werden. Bitte später erneut versuchen.";
    if (elements.featuredGrid) {
      elements.featuredGrid.appendChild(fallback);
    }
  }
};

setText(elements.footerYear, new Date().getFullYear().toString());

loadContent();
