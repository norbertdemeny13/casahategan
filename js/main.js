(function () {
  const PRODUCTS = (window.CATALOG && window.CATALOG.products) || [];
  const PHONE = "0752084770";
  const WHATSAPP = "40745686056";

  const ICONS = {
    brick: '<svg viewBox="0 0 48 48" fill="none" stroke="#3a3a3a" stroke-width="1.7"><path d="M6 16h14v8H6zM22 16h20v8H22zM6 26h20v8H6zM28 26h14v8H28zM14 6h20v8H14z"/></svg>',
    bolt: '<svg viewBox="0 0 48 48" fill="none" stroke="#3a3a3a" stroke-width="1.7"><path d="M26 6L12 26h10l-2 16 16-22H26l2-14z"/><rect x="30" y="30" width="12" height="10" rx="1"/><path d="M33 33h6M33 36h6"/></svg>',
    home: '<svg viewBox="0 0 48 48" fill="none" stroke="#3a3a3a" stroke-width="1.7"><path d="M8 22L24 8l16 14v18H8V22z"/><path d="M20 40V28h8v12M34 18c2 2 4 6 4 8"/></svg>',
    pipe: '<svg viewBox="0 0 48 48" fill="none" stroke="#3a3a3a" stroke-width="1.7"><rect x="6" y="18" width="16" height="12" rx="2"/><path d="M22 24h8M30 16v16h10a4 4 0 0 0 0-8h-4"/><circle cx="14" cy="24" r="2"/></svg>',
    paint: '<svg viewBox="0 0 48 48" fill="none" stroke="#3a3a3a" stroke-width="1.7"><path d="M8 28V14h22v14H8z"/><path d="M30 18h8v6h-8M18 28v8h8M12 36h20"/></svg>',
    phone: '<svg viewBox="0 0 48 48" fill="none" stroke="#e39b08" stroke-width="1.8"><path d="M16 10c2 6 4 8 8 10l4-4 8 2c-1 8-8 16-18 16-6 0-10-4-10-8 2-2 6-4 8-16z"/><path d="M30 12c4 1 7 4 8 8"/></svg>',
    card: '<svg viewBox="0 0 48 48" fill="none" stroke="#e39b08" stroke-width="1.8"><rect x="8" y="14" width="26" height="18" rx="2"/><path d="M8 20h26M14 28h6"/><path d="M30 18l8 4v10l-8 4"/></svg>',
    truck: '<svg viewBox="0 0 48 48" fill="none" stroke="#e39b08" stroke-width="1.8"><path d="M6 30V16h18v14H6zM24 22h8l6 6v2H24"/><circle cx="14" cy="34" r="3"/><circle cx="32" cy="34" r="3"/><path d="M34 12v4"/></svg>',
    hand: '<svg viewBox="0 0 48 48" fill="none" stroke="#e39b08" stroke-width="1.8"><path d="M14 28c0-8 6-14 10-14 2 6 2 10 0 14h12c4 0 6 3 6 6H20"/><circle cx="32" cy="14" r="5"/><path d="M32 11v3l2 1"/></svg>',
  };

  function esc(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[ch]));
  }

  function money(amount) {
    if (amount == null) return "";
    return amount.toLocaleString("ro-RO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " lei";
  }

  function productBySlug(slug) {
    return PRODUCTS.find((item) => item.slug === slug);
  }

  function getCart() {
    try {
      const parsed = JSON.parse(localStorage.getItem("ch-cart") || "[]");
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function saveCart(items) {
    localStorage.setItem("ch-cart", JSON.stringify(items));
    paintCart();
  }

  function cartCount() {
    return getCart().reduce((sum, row) => sum + row.qty, 0);
  }

  function cartDetailed() {
    return getCart()
      .map((row) => ({ ...row, product: productBySlug(row.slug) }))
      .filter((row) => row.product);
  }

  function lineTotal(row) {
    if (row.product.price == null) return 0;
    return row.product.price * row.qty;
  }

  function discountRate() {
    return localStorage.getItem("ch-coupon") === "REDUCERE-5%" ? 0.05 : 0;
  }

  function totals() {
    const subtotal = cartDetailed().reduce((sum, row) => sum + lineTotal(row), 0);
    const discount = subtotal * discountRate();
    return { subtotal, discount, total: subtotal - discount };
  }

  function addToCart(slug, qty) {
    const product = productBySlug(slug);
    if (!product || product.price == null) return;
    const cart = getCart();
    const existing = cart.find((row) => row.slug === slug);
    const amount = Math.max(1, qty || 1);
    if (existing) existing.qty += amount;
    else cart.push({ slug, qty: amount });
    saveCart(cart);
    openDrawer();
    toast("Produs adăugat în coș");
  }

  function setQty(slug, qty) {
    const cart = getCart()
      .map((row) => (row.slug === slug ? { ...row, qty } : row))
      .filter((row) => row.qty > 0);
    saveCart(cart);
  }

  function waLink(name) {
    const text = "Bună ziua. Mă interesează o ofertă pentru " + name + ".";
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(text);
  }

  function cardHTML(product) {
    const href = "produs.html?p=" + encodeURIComponent(product.slug);
    const price = product.price == null
      ? '<p class="price price-empty">Preț la cerere</p>'
      : '<p class="price">' + money(product.price) + "</p>";
    const action = product.price == null
      ? '<a class="btn btn-dark btn-block" href="' + href + '">Vezi produsul</a>'
      : '<button class="btn btn-gold btn-block" type="button" data-add="' + esc(product.slug) + '">Adaugă în coș</button>';
    return (
      '<article class="card">' +
      (product.badge ? '<span class="badge">' + esc(product.badge) + "</span>" : "") +
      '<a class="card-media" href="' + href + '"><img src="' + esc(product.image) + '" alt="' + esc(product.name) + '"></a>' +
      "<h3><a href=\"" + href + "\">" + esc(product.name) + "</a></h3>" +
      price +
      action +
      '<a class="quote-link" target="_blank" rel="noopener" href="' + waLink(product.name) + '">Cere ofertă</a>' +
      "</article>"
    );
  }

  function renderGrid(node, items) {
    if (!node) return;
    if (!items.length) {
      node.innerHTML = '<div class="empty"><h3>Nu am găsit produse pentru filtrul ales.</h3><p>Sună-ne la <a href="tel:+' + PHONE + '">0752 084 770</a> și îți pregătim oferta.</p></div>';
      return;
    }
    node.innerHTML = items.map(cardHTML).join("");
  }

  function toast(message) {
    let node = document.querySelector(".toast");
    if (!node) {
      node = document.createElement("div");
      node.className = "toast";
      document.body.appendChild(node);
    }
    node.textContent = message;
    node.classList.add("is-on");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => node.classList.remove("is-on"), 1800);
  }

  function chrome() {
    const top = document.getElementById("chrome-top");
    const bottom = document.getElementById("chrome-bottom");
    if (top) {
      top.innerHTML =
        '<div class="topbar"><div class="wrap topbar-inner">' +
        '<div class="coupon-copy"><span>Dă click și copiază cuponul de reducere!</span>' +
        '<button class="coupon-btn" type="button" data-copy-coupon>REDUCERE-5%</button></div>' +
        '<a class="top-phone" href="tel:+' + PHONE + '"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 4h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 2-2z"/></svg> 0752 084 770</a>' +
        '<a class="btn btn-yellow account-btn" href="cont.html">Cont</a>' +
        "</div></div>" +
        '<header class="header"><div class="wrap header-inner">' +
        '<a class="logo" href="index.html"><img src="images/logo.svg" alt="Casa Hațegan"></a>' +
        '<nav class="nav" aria-label="Principal">' +
        '<a href="magazin.html">Magazin</a>' +
        '<div class="nav-drop"><button type="button">Cum comand? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1.5 4L6 8l4.5-4" stroke="currentColor" stroke-width="1.5"/></svg></button>' +
        "<menu><li><a href=\"termeni.html\">Termeni și condiții</a></li><li><a href=\"retur.html\">Retur</a></li><li><a href=\"livrare.html\">Livrare</a></li></menu></div>" +
        '<a href="blog.html">Blog</a><a href="despre.html">Despre noi</a><a href="contact.html">Contact</a>' +
        "</nav>" +
        '<div class="header-tools">' +
        '<button class="icon-btn menu-toggle" type="button" data-open-nav aria-label="Deschide meniul"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button>' +
        '<button class="icon-btn" type="button" data-open-cart aria-label="Coș"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 6h15l-2 9H8L6 6z"/><path d="M6 6L5 3H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/></svg><span class="cart-count" data-cart-count>0</span></button>' +
        '<button class="icon-btn" type="button" data-open-search aria-label="Caută produse"><span class="search-label">Caută produse</span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg></button>' +
        "</div></div></header>";
    }
    if (bottom) {
      bottom.innerHTML =
        '<footer class="site-footer"><div class="wrap footer-grid">' +
        "<div><p>Magazin online de materiale de construcții, instalații electrice și sanitare, scule și unelte, produse pentru casă și grădină, amenajări exterioare, vopsele interior și exterior, termice și instalații, izolații interior/exterior.</p>" +
        '<img class="pay-banner" src="images/netopia.jpg" alt="Plăți securizate Netopia" style="height:48px;width:auto;margin-top:14px;background:#fff;border-radius:4px"></div>' +
        "<div><h3>Contact</h3><p><a href=\"tel:+40769020456\">0769 020 456</a><br><a href=\"mailto:office.casahategan@gmail.com\">office.casahategan@gmail.com</a><br>Str. Ion Creangă, nr. 42, Aiud, jud. Alba</p></div>" +
        "<div><h3>Categorii mari</h3><ul>" +
        '<li><a href="magazin.html?categorie=constructii">Construcții</a></li>' +
        '<li><a href="magazin.html?categorie=electrice">Electrice și iluminat</a></li>' +
        '<li><a href="magazin.html?categorie=casa">Casă și grădină</a></li>' +
        '<li><a href="magazin.html?categorie=instalatii">Instalații</a></li>' +
        '<li><a href="magazin.html?categorie=amenajari">Amenajări interioare</a></li>' +
        "</ul></div>" +
        "<div><h3>Informații</h3><ul>" +
        '<li><a href="confidentialitate.html">Politica de confidențialitate</a></li>' +
        '<li><a href="cookies.html">Politica de cookies</a></li>' +
        '<li><a href="retur.html">Politica de retur</a></li>' +
        '<li><a href="termeni.html">Termeni și condiții</a></li>' +
        '<li><a href="livrare.html">Transport și livrare</a></li>' +
        '<li><a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener">ANPC</a></li>' +
        "</ul></div>" +
        "<div><h3>Asistență</h3><ul>" +
        '<li><a href="cum-comand.html">Cum comand?</a></li>' +
        '<li><a href="faq.html">Întrebări frecvente</a></li>' +
        '<li><a href="contact.html">Contact</a></li>' +
        '<li><a href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO" target="_blank" rel="noopener">Soluționarea litigiilor</a></li>' +
        "</ul></div></div>" +
        '<div class="wrap footer-base"><p>Copyright © 2026 Casa Hațegan SRL, CUI: RO30640389. Toate drepturile rezervate.</p>' +
        '<div class="badges"><a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noopener"><img src="images/anpc-sal.png" alt="ANPC SAL"></a>' +
        '<a href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.home2.show&lng=RO" target="_blank" rel="noopener"><img src="images/anpc-sol.png" alt="Soluționarea online a litigiilor"></a></div></div></footer>' +
        '<a class="whatsapp" href="https://wa.me/' + WHATSAPP + '" target="_blank" rel="noopener" aria-label="WhatsApp">' +
        '<svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><path d="M12 3a9 9 0 0 0-7.7 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3zm5.2 12.7c-.2.6-1.2 1.1-1.7 1.1-.4.1-.9.2-3-.6-2.5-1-4.1-3.6-4.2-3.8-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4 1-.4h.7c.2 0 .5 0 .7.6.3.7.9 2.4 1 2.6.1.2.1.4 0 .6-.1.2-.2.4-.4.6l-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.4.3.1.5.1.6-.1l.7-.8c.2-.2.4-.2.6-.1.3.1 1.6.8 1.9.9.2.1.4.2.5.3.1.3 0 .8-.2 1.2z"/></svg></a>';
    }

    if (!document.querySelector(".backdrop")) {
      const backdrop = document.createElement("div");
      backdrop.className = "backdrop";
      backdrop.dataset.closeOverlay = "";
      document.body.appendChild(backdrop);
    }
    if (!document.querySelector(".search-panel")) {
      const panel = document.createElement("div");
      panel.className = "search-panel";
      panel.innerHTML =
        '<form data-search-form><input type="search" name="q" placeholder="Caută produse" aria-label="Caută produse" data-search-input><button class="btn btn-gold" type="submit">Caută</button><button class="btn btn-outline" type="button" data-close-overlay>Închide</button></form><div class="search-results" data-search-results></div>';
      document.body.appendChild(panel);
    }
    if (!document.querySelector(".drawer")) {
      const drawer = document.createElement("aside");
      drawer.className = "drawer";
      drawer.innerHTML =
        '<header><strong>Coșul tău</strong><button class="icon-btn" type="button" data-close-overlay aria-label="Închide">✕</button></header><div class="drawer-body" data-drawer-body></div><footer data-drawer-foot></footer>';
      document.body.appendChild(drawer);
    }
    if (!document.querySelector(".nav-panel")) {
      const nav = document.createElement("nav");
      nav.className = "nav-panel";
      nav.innerHTML =
        '<button class="icon-btn" type="button" data-close-overlay aria-label="Închide">✕</button>' +
        '<a href="index.html">Acasă</a><a href="magazin.html">Magazin</a><a href="cum-comand.html">Cum comand?</a><a href="blog.html">Blog</a><a href="despre.html">Despre noi</a><a href="contact.html">Contact</a><a href="cont.html">Cont</a><a href="cos.html">Coș</a>';
      document.body.appendChild(nav);
    }
  }

  function openOverlay(selector) {
    document.querySelector(".backdrop").classList.add("is-open");
    document.querySelector(selector).classList.add("is-open");
  }
  function closeOverlays() {
    document.querySelectorAll(".backdrop, .search-panel, .drawer, .nav-panel").forEach((node) => {
      node.classList.remove("is-open");
    });
  }
  function openDrawer() {
    paintCart();
    openOverlay(".drawer");
  }

  function paintCart() {
    document.querySelectorAll("[data-cart-count]").forEach((node) => {
      const count = cartCount();
      node.textContent = String(count);
      node.dataset.count = String(count);
    });
    const body = document.querySelector("[data-drawer-body]");
    const foot = document.querySelector("[data-drawer-foot]");
    if (!body || !foot) return;
    const rows = cartDetailed();
    if (!rows.length) {
      body.innerHTML = "<p>Coșul este gol.</p>";
      foot.innerHTML = '<a class="btn btn-gold btn-block" href="magazin.html">Vezi magazinul</a>';
      return;
    }
    body.innerHTML = rows.map((row) => (
      '<div class="cart-line"><img src="' + esc(row.product.image) + '" alt=""><div><h3>' + esc(row.product.name) + "</h3><p>" +
      row.qty + " × " + money(row.product.price) + '</p></div><strong>' + money(lineTotal(row)) + "</strong></div>"
    )).join("");
    const sums = totals();
    foot.innerHTML =
      '<div class="summary-row"><span>Total</span><strong>' + money(sums.total) + "</strong></div>" +
      '<a class="btn btn-gold btn-block" href="cos.html">Finalizează comanda</a>';
  }

  function searchProducts(query) {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return [];
    return PRODUCTS.filter((product) => {
      const haystack = (product.name + " " + product.categories.join(" ")).toLowerCase();
      return words.every((word) => haystack.includes(word));
    });
  }

  function renderSearch(query) {
    const box = document.querySelector("[data-search-results]");
    const items = searchProducts(query).slice(0, 8);
    if (!query.trim()) {
      box.innerHTML = "";
      return;
    }
    if (!items.length) {
      box.innerHTML = "<p>Niciun produs găsit.</p>";
      return;
    }
    box.innerHTML = items.map((product) => (
      '<a class="search-hit" href="produs.html?p=' + encodeURIComponent(product.slug) + '"><img src="' + esc(product.image) + '" alt=""><span>' + esc(product.name) + "</span><strong>" + (product.price == null ? "La cerere" : money(product.price)) + "</strong></a>"
    )).join("");
  }

  function initHome() {
    document.querySelectorAll("[data-cat-icon]").forEach((node) => {
      node.innerHTML = ICONS[node.dataset.catIcon] || "";
    });
    document.querySelectorAll("[data-perk-icon]").forEach((node) => {
      node.innerHTML = ICONS[node.dataset.perkIcon] || "";
    });

    const slider = document.querySelector("[data-slider]");
    if (slider) {
      const slides = [...slider.querySelectorAll("img")];
      const dots = document.createElement("div");
      dots.className = "slider-dots";
      let index = 0;
      slides.forEach((_, slideIndex) => {
        const button = document.createElement("button");
        button.type = "button";
        button.addEventListener("click", () => show(slideIndex));
        dots.appendChild(button);
      });
      slider.appendChild(dots);
      function show(next) {
        index = next;
        slides.forEach((slide, slideIndex) => slide.classList.toggle("is-active", slideIndex === index));
        [...dots.children].forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === index));
      }
      show(0);
      setInterval(() => show((index + 1) % slides.length), 4500);
    }

    document.querySelectorAll("[data-tabs]").forEach((box) => {
      const buttons = [...box.querySelectorAll("[data-group]")];
      const grid = box.querySelector("[data-grid]");
      function show(group) {
        buttons.forEach((button) => {
          const active = button.dataset.group === group;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-selected", active ? "true" : "false");
        });
        renderGrid(grid, PRODUCTS.filter((product) => product.groups.includes(group)));
      }
      buttons.forEach((button) => button.addEventListener("click", () => show(button.dataset.group)));
      const current = buttons.find((button) => button.classList.contains("is-active")) || buttons[0];
      if (current) show(current.dataset.group);
    });

    const recommended = document.querySelector("[data-recommended]");
    if (recommended) {
      renderGrid(recommended, PRODUCTS.filter((product) => product.groups.includes("recomandate")));
    }
  }

  function initShop() {
    const grid = document.querySelector("[data-shop]");
    if (!grid) return;
    const params = new URLSearchParams(location.search);
    const category = params.get("categorie") || "";
    const group = params.get("grup") || "";
    const query = params.get("q") || "";
    const input = document.querySelector("[data-shop-search]");
    if (input) input.value = query;
    document.querySelectorAll("[data-cat-link]").forEach((link) => {
      link.classList.toggle("is-active", link.dataset.catLink === (category || "toate"));
    });
    let items = PRODUCTS.slice();
    if (category) items = items.filter((product) => product.categories.includes(category));
    if (group) items = items.filter((product) => product.groups.includes(group));
    if (query) {
      const found = searchProducts(query).map((product) => product.slug);
      items = items.filter((product) => found.includes(product.slug));
    }
    const title = document.querySelector("[data-shop-title]");
    const names = {
      constructii: "Construcții",
      electrice: "Electrice și iluminat",
      casa: "Casă și grădină",
      instalatii: "Instalații",
      amenajari: "Amenajări interioare",
      sobe: "Sobe și accesorii",
      cazane: "Accesorii pentru cazane",
      ferestre: "Ferestre",
      despicatoare: "Instalații climatizare",
      materiale: "Materiale de construcții",
    };
    if (title) title.textContent = names[category] || names[group] || (query ? "Căutare: " + query : "Magazin");
    renderGrid(grid, items);
  }

  function initProduct() {
    const root = document.querySelector("[data-product]");
    if (!root) return;
    const slug = new URLSearchParams(location.search).get("p");
    const product = productBySlug(slug);
    if (!product) {
      root.innerHTML = '<h1>Produsul nu a fost găsit</h1><p><a href="magazin.html">Înapoi la magazin</a></p>';
      return;
    }
    document.title = product.name + " – Casa Hațegan";
    const category = product.categories[0] || "constructii";
    root.innerHTML =
      '<p class="crumb"><a href="index.html">Acasă</a> / <a href="magazin.html?categorie=' + category + '">Magazin</a> / ' + esc(product.name) + "</p>" +
      '<div class="product-layout"><div class="product-photo"><img src="' + esc(product.image) + '" alt="' + esc(product.name) + '"></div><div>' +
      (product.badge ? '<span class="badge" style="position:static">' + esc(product.badge) + "</span>" : "") +
      "<h1>" + esc(product.name) + "</h1>" +
      (product.price == null ? '<p class="price price-empty">Preț la cerere. Scrie-ne pentru ofertă.</p>' : '<p class="price" style="font-size:28px">' + money(product.price) + "</p>") +
      '<div class="qty-row"><div class="qty"><button type="button" data-qty-minus>-</button><input data-qty value="1" inputmode="numeric" aria-label="Cantitate"><button type="button" data-qty-plus>+</button></div></div>' +
      '<div class="product-actions">' +
      (product.price == null ? "" : '<button class="btn btn-gold" type="button" data-add="' + esc(product.slug) + '" data-qty-source>Adaugă în coș</button>') +
      '<a class="btn btn-outline" target="_blank" rel="noopener" href="' + waLink(product.name) + '">Cere ofertă pe WhatsApp</a>' +
      "</div><p>Livrare în Aiud și în țară. Retur în 14 zile pentru comenzile la distanță.</p></div></div>";
    const qtyInput = root.querySelector("[data-qty]");
    root.querySelector("[data-qty-minus]").addEventListener("click", () => {
      qtyInput.value = String(Math.max(1, Number(qtyInput.value || 1) - 1));
    });
    root.querySelector("[data-qty-plus]").addEventListener("click", () => {
      qtyInput.value = String(Number(qtyInput.value || 1) + 1);
    });
  }

  function initCartPage() {
    const root = document.querySelector("[data-cart-page]");
    if (!root) return;
    const lines = root.querySelector("[data-cart-lines]");
    const summary = root.querySelector("[data-cart-summary]");
    const form = root.querySelector("[data-checkout]");
    const done = root.querySelector("[data-checkout-done]");
    const couponInput = root.querySelector("[data-coupon-input]");
    if (couponInput && discountRate()) couponInput.value = "REDUCERE-5%";

    function paint() {
      if (!done.hidden) {
        lines.innerHTML = "";
        summary.hidden = false;
        return;
      }
      const rows = cartDetailed();
      if (!rows.length) {
        lines.innerHTML = '<div class="empty"><h3>Coșul este gol.</h3><p><a href="magazin.html">Continuă cumpărăturile</a></p></div>';
        summary.hidden = true;
        return;
      }
      summary.hidden = false;
      lines.innerHTML = rows.map((row) => (
        '<div class="cart-line"><img src="' + esc(row.product.image) + '" alt=""><div><h3><a href="produs.html?p=' + encodeURIComponent(row.slug) + '">' + esc(row.product.name) + "</a></h3>" +
        '<div class="qty"><button type="button" data-line-minus="' + esc(row.slug) + '">-</button><input value="' + row.qty + '" data-line-qty="' + esc(row.slug) + '" aria-label="Cantitate"><button type="button" data-line-plus="' + esc(row.slug) + '">+</button></div>' +
        '<button class="remove" type="button" data-remove="' + esc(row.slug) + '">Șterge</button></div><strong>' + money(lineTotal(row)) + "</strong></div>"
      )).join("");
      const sums = totals();
      summary.querySelector("[data-subtotal]").textContent = money(sums.subtotal);
      summary.querySelector("[data-discount]").textContent = sums.discount ? "−" + money(sums.discount) : "0,00 lei";
      summary.querySelector("[data-total]").textContent = money(sums.total);
    }
    paint();

    root.addEventListener("click", (event) => {
      const minus = event.target.closest("[data-line-minus]");
      const plus = event.target.closest("[data-line-plus]");
      const remove = event.target.closest("[data-remove]");
      if (minus) setQty(minus.dataset.lineMinus, (cartDetailed().find((row) => row.slug === minus.dataset.lineMinus).qty || 1) - 1);
      if (plus) setQty(plus.dataset.linePlus, (cartDetailed().find((row) => row.slug === plus.dataset.linePlus).qty || 1) + 1);
      if (remove) setQty(remove.dataset.remove, 0);
      if (minus || plus || remove) paint();
    });

    root.querySelector("[data-apply-coupon]").addEventListener("click", () => {
      const code = couponInput.value.trim().toUpperCase();
      if (code === "REDUCERE-5%") {
        localStorage.setItem("ch-coupon", "REDUCERE-5%");
        toast("Cupon aplicat: 5%");
      } else {
        localStorage.removeItem("ch-coupon");
        toast("Cuponul nu este valid");
      }
      paint();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!cartDetailed().length) return;
      const data = new FormData(form);
      const order = {
        id: "CH-" + Date.now().toString().slice(-6),
        name: data.get("nume"),
        phone: data.get("telefon"),
        total: money(totals().total),
      };
      form.hidden = true;
      done.hidden = false;
      done.innerHTML = "<h2>Mulțumim, " + esc(order.name) + "!</h2><p>Comanda <strong>" + order.id + "</strong> în valoare de <strong>" + order.total + "</strong> a fost notată în acest browser. Te contactăm la " + esc(order.phone) + " pentru confirmare, sau sună-ne tu la <a href=\"tel:+" + PHONE + "\">0752 084 770</a>.</p>";
      saveCart([]);
      paint();
    });
  }

  function initForms() {
    document.querySelectorAll("[data-local-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        const note = form.querySelector("[data-form-note]");
        if (note) {
          note.hidden = false;
          form.querySelector("button[type=submit]").disabled = true;
        }
      });
    });
  }

  function initCookies() {
    if (localStorage.getItem("ch-cookies")) return;
    const box = document.createElement("aside");
    box.className = "cookie";
    box.innerHTML =
      "<h2>Politica de confidențialitate</h2><p>Folosim cookie-uri pentru a reține coșul în acest browser și pentru a îmbunătăți navigarea. Detalii în <a href=\"cookies.html\">politica de cookies</a>.</p>" +
      '<div class="cookie-actions"><a class="btn btn-outline" href="cookies.html">Setări cookies</a><button class="btn btn-outline" type="button" data-cookie="no">Resping</button><button class="btn btn-gold" type="button" data-cookie="yes">Accept</button></div>';
    document.body.appendChild(box);
    box.addEventListener("click", (event) => {
      const choice = event.target.closest("[data-cookie]");
      if (!choice) return;
      localStorage.setItem("ch-cookies", choice.dataset.cookie);
      box.remove();
    });
  }

  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    if (add) {
      const source = document.querySelector("[data-qty]");
      const qty = add.hasAttribute("data-qty-source") && source ? Number(source.value || 1) : 1;
      addToCart(add.dataset.add, qty);
    }
    if (event.target.closest("[data-copy-coupon]")) {
      const code = "REDUCERE-5%";
      if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
      localStorage.setItem("ch-coupon", code);
      toast("Cupon copiat: " + code);
    }
    if (event.target.closest("[data-open-search]")) {
      openOverlay(".search-panel");
      const input = document.querySelector("[data-search-input]");
      if (input) input.focus();
    }
    if (event.target.closest("[data-open-cart]")) openDrawer();
    if (event.target.closest("[data-open-nav]")) openOverlay(".nav-panel");
    if (event.target.closest("[data-close-overlay]")) closeOverlays();
  });

  document.addEventListener("input", (event) => {
    if (event.target.matches("[data-search-input]")) renderSearch(event.target.value);
  });
  document.addEventListener("submit", (event) => {
    const form = event.target.closest("[data-search-form]");
    if (!form) return;
    event.preventDefault();
    const query = new FormData(form).get("q") || "";
    location.href = "magazin.html?q=" + encodeURIComponent(query);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeOverlays();
  });
  window.addEventListener("scroll", () => {
    const header = document.querySelector(".header");
    if (header) header.classList.toggle("is-stuck", window.scrollY > 8);
  });

  chrome();
  paintCart();
  initHome();
  initShop();
  initProduct();
  initCartPage();
  initForms();
  initCookies();
})();
