const elements = {
  tagline: document.getElementById("site-tagline"),
  heroHeadline: document.getElementById("hero-headline"),
  heroSubheadline: document.getElementById("hero-subheadline"),
  aboutText: document.getElementById("about-text"),
  servicesGrid: document.getElementById("services-grid"),
  galleryGrid: document.getElementById("gallery-grid"),
  contactAddress: document.getElementById("contact-address"),
  contactPhone: document.getElementById("contact-phone"),
  contactWhatsApp: document.getElementById("contact-whatsapp"),
  contactMaps: document.getElementById("contact-maps"),
  heroCta: document.getElementById("hero-cta"),
  bookingLink: document.getElementById("booking-link"),
  footerYear: document.getElementById("footer-year"),
  instagramLink: document.getElementById("instagram-link"),
  buildLabel: document.getElementById("build-label"),
  lightbox: document.getElementById("gallery-lightbox")
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

const lightboxState = {
  lastFocusedElement: null
};

const openLightbox = (item) => {
  if (!elements.lightbox) return;
  const image = elements.lightbox.querySelector(".lightbox-image");
  const caption = elements.lightbox.querySelector(".lightbox-caption");
  const closeButton = elements.lightbox.querySelector(".lightbox-close");

  if (!image || !caption || !closeButton) return;

  image.src = item.src;
  image.alt = item.alt || "";
  const captionText = item.caption || item.alt || "";
  setText(caption, captionText);

  lightboxState.lastFocusedElement = document.activeElement;
  elements.lightbox.showModal();

  window.setTimeout(() => {
    closeButton.focus();
  }, 0);
};

const setupLightbox = () => {
  if (!elements.lightbox) return;
  const closeButton = elements.lightbox.querySelector(".lightbox-close");

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      elements.lightbox.close();
    });
  }

  elements.lightbox.addEventListener("click", (event) => {
    if (event.target === elements.lightbox) {
      elements.lightbox.close();
    }
  });

  elements.lightbox.addEventListener("close", () => {
    if (lightboxState.lastFocusedElement instanceof HTMLElement) {
      lightboxState.lastFocusedElement.focus();
    }
  });
};

const renderGallery = (items = []) => {
  if (!elements.galleryGrid) return;
  elements.galleryGrid.innerHTML = "";

  if (!Array.isArray(items) || items.length === 0) {
    const emptyState = document.createElement("p");
    emptyState.className = "gallery-empty";
    setText(emptyState, "Aktuell sind keine Bilder verfügbar.");
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
    figure.classList.toggle("contain", item.fit === "contain");
    figure.classList.toggle("cover", item.fit !== "contain");

    const button = document.createElement("button");
    button.type = "button";
    button.className = "gallery-button";
    button.setAttribute("aria-label", item.alt || "Galeriebild öffnen");
    button.addEventListener("click", () => openLightbox(item));

    const media = document.createElement("div");
    media.className = "gallery-media";

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt || "";
    image.loading = "lazy";
    image.decoding = "async";

    media.appendChild(image);
    button.appendChild(media);
    figure.appendChild(button);

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

  } catch (error) {
    // Keep the existing HTML content when content loading fails.
    renderGallery([]);
  }
};

setText(elements.footerYear, new Date().getFullYear().toString());

loadContent();
setupLightbox();
