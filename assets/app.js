const elements = {
  tagline: document.getElementById("site-tagline"),
  heroHeadline: document.getElementById("hero-headline"),
  heroSubheadline: document.getElementById("hero-subheadline"),
  aboutText: document.getElementById("about-text"),
  servicesGrid: document.getElementById("services-grid"),
  galleryGrid: document.getElementById("gallery-grid"),
  featuredGrid: document.getElementById("featured-products"),
  contactAddress: document.getElementById("contact-address"),
  contactPhone: document.getElementById("contact-phone"),
  contactWhatsApp: document.getElementById("contact-whatsapp"),
  contactMaps: document.getElementById("contact-maps"),
  heroCta: document.getElementById("hero-cta"),
  bookingLink: document.getElementById("booking-link"),
  footerYear: document.getElementById("footer-year"),
  instagramLink: document.getElementById("instagram-link"),
  buildLabel: document.getElementById("build-label")
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
    setText(title, service.title);

    const desc = document.createElement("p");
    setText(desc, service.description);

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
      setText(title, product.name);

      const meta = document.createElement("p");
      meta.className = "product-meta";
      setText(meta, `${product.brand} · ${product.category}`);

      const desc = document.createElement("p");
      setText(desc, product.shortDescription);

      const price = document.createElement("p");
      price.className = "product-price";
      setText(price, `${product.priceEur} ${product.currency}`);

      card.append(title, meta, desc, price);
      elements.featuredGrid.appendChild(card);
  });
};

const renderGallery = (items = []) => {
  if (!elements.galleryGrid) return;
  elements.galleryGrid.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "gallery-empty";
    setText(emptyState, "Noch keine Bilder – bitte im Admin hochladen.");
    elements.galleryGrid.appendChild(emptyState);
    return;
  }

  const sortedItems = [...items].sort((a, b) => {
    const orderA = typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
    const orderB = typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    const featuredA = a.featured ? 1 : 0;
    const featuredB = b.featured ? 1 : 0;
    if (featuredA !== featuredB) return featuredB - featuredA;
    return 0;
  });

  sortedItems.forEach((item) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-item";

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || "";
    image.loading = "lazy";

    figure.appendChild(image);

    if (item.caption) {
      const caption = document.createElement("figcaption");
      setText(caption, item.caption);
      figure.appendChild(caption);
    }

    elements.galleryGrid.appendChild(figure);
  });
};

const renderLinks = (site) => {
  if (site.contact?.phone && elements.contactPhone) {
    const phoneHref = site.contact.phone.replace(/\s+/g, "");
    elements.contactPhone.setAttribute("href", `tel:${phoneHref}`);
    setText(elements.contactPhone, site.contact.phone);
  }

  if (site.contact?.whatsAppUrl) {
    [elements.contactWhatsApp, elements.heroCta, elements.bookingLink].forEach((link) => {
      if (link) {
        link.setAttribute("href", site.contact.whatsAppUrl);
      }
    });
  }

  if (elements.contactMaps && site.contact?.mapsUrl) {
    elements.contactMaps.setAttribute("href", site.contact.mapsUrl);
  }

  if (elements.instagramLink && site.socials?.instagramUrl) {
    elements.instagramLink.setAttribute("href", site.socials.instagramUrl);
  }
};

const loadContent = async () => {
  try {
    const siteResponse = await fetch("./data/site.json");
    if (!siteResponse.ok) return;
    const site = await siteResponse.json();

    setText(elements.tagline, site.tagline);
    setText(elements.heroHeadline, site.heroHeadline);
    setText(elements.heroSubheadline, site.heroSubheadline);
    setText(elements.aboutText, site.aboutText);
    setText(elements.contactAddress, site.contact?.address);
    setText(elements.buildLabel, site.buildLabel);

    renderServices(site.services || []);
    renderLinks(site);

    if (elements.galleryGrid) {
      const galleryResponse = await fetch("./data/gallery.json");
      if (galleryResponse.ok) {
        const galleryData = await galleryResponse.json();
        renderGallery(galleryData?.items || []);
      } else {
        renderGallery([]);
      }
    }

    if (elements.featuredGrid) {
      const productsResponse = await fetch("./data/products.json");
      if (productsResponse.ok) {
        const products = await productsResponse.json();
        renderFeaturedProducts(products || []);
      }
    }
  } catch (error) {
    // Keep the existing HTML content when content loading fails.
    renderGallery([]);
  }
};

setText(elements.footerYear, new Date().getFullYear().toString());

loadContent();
