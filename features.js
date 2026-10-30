/* ============================================
   ProjectGo — features.js
   Menu filtering, cart, reservation form, interactive features
   ============================================ */

(function () {
  "use strict";

  /* ---------- Menu Data ---------- */
  const MENU_ITEMS = [
    { id: 1, name: "Truffle Arancini", desc: "Crispy risotto balls with black truffle & mozzarella", price: 16, category: "starters", emoji: "🥟", tags: ["vegetarian"], spicy: false },
    { id: 2, name: "Tuna Tartare", desc: "Fresh yellowfin tuna, avocado, citrus ponzu, sesame", price: 22, category: "starters", emoji: "🍣", tags: ["gluten-free"], spicy: false },
    { id: 3, name: "Burrata Caprese", desc: "Creamy burrata, heirloom tomatoes, basil oil, balsamic", price: 18, category: "starters", emoji: "🍅", tags: ["vegetarian", "gluten-free"], spicy: false },
    { id: 4, name: "Spicy Prawn Cocktail", desc: "Tiger prawns, Marie Rose sauce with a chili kick", price: 19, category: "starters", emoji: "🦐", tags: ["spicy"], spicy: true },
    { id: 5, name: "Wagyu Beef Burger", desc: "Dry-aged wagyu, aged cheddar, caramelized onion, truffle aioli", price: 32, category: "mains", emoji: "🍔", tags: [], spicy: false },
    { id: 6, name: "Lobster Linguine", desc: "Fresh lobster, cherry tomatoes, garlic, white wine sauce", price: 42, category: "mains", emoji: "🦞", tags: [], spicy: false },
    { id: 7, name: "Miso Black Cod", desc: "Marinated black cod, bok choy, ginger beurre blanc", price: 38, category: "mains", emoji: "🐟", tags: ["gluten-free"], spicy: false },
    { id: 8, name: "Wild Mushroom Risotto", desc: "Arborio rice, wild mushrooms, parmesan, white truffle oil", price: 28, category: "mains", emoji: "🍄", tags: ["vegetarian", "gluten-free"], spicy: false },
    { id: 9, name: "Spicy Lamb Tagine", desc: "Slow-cooked lamb, apricot, almonds, couscous, harissa", price: 34, category: "mains", emoji: "🍲", tags: ["spicy"], spicy: true },
    { id: 10, name: "Grilled Ribeye", desc: "28-day aged ribeye, bone marrow butter, hand-cut fries", price: 48, category: "mains", emoji: "🥩", tags: ["gluten-free"], spicy: false },
    { id: 11, name: "Chocolate Fondant", desc: "Warm dark chocolate cake, molten centre, vanilla ice cream", price: 14, category: "desserts", emoji: "🍫", tags: ["vegetarian"], spicy: false },
    { id: 12, name: "Lemon Tart", desc: "Burnt lemon curd, Italian meringue, candied zest", price: 13, category: "desserts", emoji: "🍋", tags: ["vegetarian"], spicy: false },
    { id: 13, name: "Tiramisu", desc: "Classic espresso-soaked ladyfingers, mascarpone cream", price: 12, category: "desserts", emoji: "☕", tags: ["vegetarian"], spicy: false },
    { id: 14, name: "Mango Sticky Rice", desc: "Sweet coconut sticky rice, fresh mango, toasted sesame", price: 11, category: "desserts", emoji: "🥭", tags: ["vegan", "gluten-free"], spicy: false },
    { id: 15, name: "Signature Cocktail", desc: "House bourbon, smoked maple, orange bitters, cherry", price: 16, category: "drinks", emoji: "🍸", tags: [], spicy: false },
    { id: 16, name: "Yuzu Spritz", desc: "Yuzu liqueur, prosecco, soda, fresh mint", price: 14, category: "drinks", emoji: "🥂", tags: ["vegan"], spicy: false },
    { id: 17, name: "Matcha Latte", desc: "Ceremonial grade matcha, oat milk, honey optional", price: 7, category: "drinks", emoji: "🍵", tags: ["vegan", "gluten-free"], spicy: false },
    { id: 18, name: "Craft Beer Selection", desc: "Rotating local craft beers on tap — ask your server", price: 9, category: "drinks", emoji: "🍺", tags: ["vegan"], spicy: false },
  ];

  /* ---------- Cart State ---------- */
  let cart = JSON.parse(localStorage.getItem("pg-cart") || "[]");
  let favorites = JSON.parse(localStorage.getItem("pg-favorites") || "[]");

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initMenuPage();
    initCart();
    initReservationForm();
    initTestimonials();
    initDishOfTheDay();
    initNewsletter();
    initFeaturedCarousel();
    renderFavorites();
  });

  /* ---------- Menu Page ---------- */
  function initMenuPage() {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    renderMenuItems(MENU_ITEMS);

    // Category filters
    const tabs = document.querySelectorAll(".filter-tab");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        tabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        applyFilters();
      });
    });

    // Search
    const searchInput = document.getElementById("menu-search");
    if (searchInput) {
      searchInput.addEventListener("input", debounce(applyFilters, 200));
    }

    // Sort
    const sortSelect = document.getElementById("menu-sort");
    if (sortSelect) {
      sortSelect.addEventListener("change", applyFilters);
    }

    // Dietary filter chips
    document.querySelectorAll(".dietary-filter").forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("active");
        applyFilters();
      });
    });
  }

  function applyFilters() {
    const activeTab = document.querySelector(".filter-tab.active");
    const category = activeTab ? activeTab.dataset.category : "all";
    const search = (document.getElementById("menu-search")?.value || "").toLowerCase();
    const sort = document.getElementById("menu-sort")?.value || "default";
    const dietary = [...document.querySelectorAll(".dietary-filter.active")].map(
      (c) => c.dataset.tag
    );

    let items = [...MENU_ITEMS];

    if (category !== "all") {
      items = items.filter((i) => i.category === category);
    }

    if (search) {
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(search) ||
          i.desc.toLowerCase().includes(search)
      );
    }

    if (dietary.length) {
      items = items.filter((i) =>
        dietary.every((tag) => {
          if (tag === "spicy") return i.spicy;
          return i.tags.includes(tag);
        })
      );
    }

    if (sort === "price-asc") items.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") items.sort((a, b) => b.price - a.price);
    else if (sort === "name") items.sort((a, b) => a.name.localeCompare(b.name));

    renderMenuItems(items);
  }

  function renderMenuItems(items) {
    const grid = document.getElementById("menu-grid");
    if (!grid) return;

    if (!items.length) {
      grid.innerHTML = `<div class="cart-empty" style="grid-column:1/-1"><div class="emoji">🔍</div><p>No dishes match your filters</p></div>`;
      return;
    }

    grid.innerHTML = items
      .map(
        (item) => `
      <article class="dish-card menu-item tilt-card" data-id="${item.id}">
        <div class="dish-card-visual">${item.emoji}</div>
        <div class="dish-card-body">
          <div class="dish-card-tags">
            ${item.tags.map((t) => `<span class="tag ${t === "vegan" ? "vegan" : t === "gluten-free" ? "gf" : ""}">${t}</span>`).join("")}
            ${item.spicy ? '<span class="tag spicy">spicy</span>' : ""}
          </div>
          <h3>${item.name}</h3>
          <p>${item.desc}</p>
          <div class="dish-card-footer">
            <span class="dish-price">$${item.price}</span>
            <div class="dish-actions">
              <button class="fav-btn ${favorites.includes(item.id) ? "active" : ""}" data-id="${item.id}" aria-label="Favorite">♥</button>
              <button class="btn btn-sm btn-primary add-to-cart" data-id="${item.id}">Add</button>
            </div>
          </div>
        </div>
      </article>
    `
      )
      .join("");

    // Bind events
    grid.querySelectorAll(".add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(+btn.dataset.id));
    });

    grid.querySelectorAll(".fav-btn").forEach((btn) => {
      btn.addEventListener("click", () => toggleFavorite(+btn.dataset.id, btn));
    });

    initTiltCards();
  }

  /* ---------- 3D Tilt ---------- */
  function initTiltCards() {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".tilt-card").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -8;
        const rotateY = ((x - centerX) / centerX) * 8;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Cart ---------- */
  function initCart() {
    updateCartUI();

    // Open / close
    document.querySelectorAll(".cart-btn").forEach((btn) => {
      btn.addEventListener("click", openCart);
    });

    const overlay = document.querySelector(".cart-overlay");
    const closeBtn = document.querySelector(".cart-close");
    if (overlay) overlay.addEventListener("click", closeCart);
    if (closeBtn) closeBtn.addEventListener("click", closeCart);

    // Checkout
    const checkoutBtn = document.getElementById("checkout-btn");
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", handleCheckout);
    }
  }

  function addToCart(id) {
    const item = MENU_ITEMS.find((i) => i.id === id);
    if (!item) return;

    const existing = cart.find((c) => c.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: item.id, name: item.name, price: item.price, emoji: item.emoji, qty: 1 });
    }
    saveCart();
    updateCartUI();
    showToast(`${item.name} added to cart`, "success");
  }

  function removeFromCart(id) {
    cart = cart.filter((c) => c.id !== id);
    saveCart();
    updateCartUI();
  }

  function updateQty(id, delta) {
    const item = cart.find((c) => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      removeFromCart(id);
    } else {
      saveCart();
      updateCartUI();
    }
  }

  function saveCart() {
    localStorage.setItem("pg-cart", JSON.stringify(cart));
  }

  function updateCartUI() {
    const countEls = document.querySelectorAll(".cart-count");
    const totalQty = cart.reduce((s, c) => s + c.qty, 0);
    countEls.forEach((el) => {
      el.textContent = totalQty;
      el.classList.toggle("visible", totalQty > 0);
    });

    const container = document.querySelector(".cart-items");
    if (!container) return;

    if (!cart.length) {
      container.innerHTML = `<div class="cart-empty"><div class="emoji">🛒</div><p>Your cart is empty</p></div>`;
    } else {
      container.innerHTML = cart
        .map(
          (item) => `
        <div class="cart-item">
          <div class="cart-item-emoji">${item.emoji}</div>
          <div class="cart-item-info">
            <h4>${item.name}</h4>
            <div class="cart-item-price">$${item.price}</div>
            <div class="cart-item-qty">
              <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
              <span>${item.qty}</span>
              <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
              <button class="qty-btn" data-action="remove" data-id="${item.id}" style="margin-left:auto;font-size:0.75rem">✕</button>
            </div>
          </div>
        </div>
      `
        )
        .join("");

      container.querySelectorAll(".qty-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          const id = +btn.dataset.id;
          const action = btn.dataset.action;
          if (action === "inc") updateQty(id, 1);
          else if (action === "dec") updateQty(id, -1);
          else if (action === "remove") removeFromCart(id);
        });
      });
    }

    // Totals
    const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;

    const subEl = document.getElementById("cart-subtotal");
    const taxEl = document.getElementById("cart-tax");
    const totalEl = document.getElementById("cart-total");
    if (subEl) subEl.textContent = "$" + subtotal.toFixed(2);
    if (taxEl) taxEl.textContent = "$" + tax.toFixed(2);
    if (totalEl) totalEl.textContent = "$" + total.toFixed(2);
  }

  function openCart() {
    document.querySelector(".cart-overlay")?.classList.add("open");
    document.querySelector(".cart-drawer")?.classList.add("open");
  }

  function closeCart() {
    document.querySelector(".cart-overlay")?.classList.remove("open");
    document.querySelector(".cart-drawer")?.classList.remove("open");
  }

  function handleCheckout() {
    if (!cart.length) {
      showToast("Your cart is empty", "error");
      return;
    }

    // Fake checkout success
    cart = [];
    saveCart();
    updateCartUI();
    closeCart();

    // Confetti
    launchConfetti();

    // Modal
    const modal = document.getElementById("checkout-modal");
    if (modal) {
      modal.classList.add("open");
      modal.querySelector(".modal-close")?.addEventListener("click", () => {
        modal.classList.remove("open");
      }, { once: true });
    } else {
      showToast("Order placed successfully! 🎉", "success");
    }
  }

  /* ---------- Confetti ---------- */
  function launchConfetti() {
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ["#c9a227", "#e85a4f", "#4caf50", "#42a5f5", "#f5f0e8"];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        w: Math.random() * 8 + 4,
        h: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        speed: Math.random() * 3 + 2,
        angle: Math.random() * 360,
        spin: Math.random() * 8 - 4,
      });
    }

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.y += p.speed;
        p.angle += p.spin;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.angle * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });
      frame++;
      if (frame < 150) requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    draw();
  }

  /* ---------- Favorites ---------- */
  function toggleFavorite(id, btn) {
    const idx = favorites.indexOf(id);
    if (idx > -1) {
      favorites.splice(idx, 1);
      btn.classList.remove("active");
      showToast("Removed from favorites", "info");
    } else {
      favorites.push(id);
      btn.classList.add("active");
      showToast("Added to favorites ♥", "success");
    }
    localStorage.setItem("pg-favorites", JSON.stringify(favorites));
  }

  function renderFavorites() {
    // Just ensure buttons reflect state — already done in renderMenuItems
  }

  /* ---------- Reservation Form ---------- */
  function initReservationForm() {
    const form = document.getElementById("reservation-form");
    if (!form) return;

    // Set min date to today
    const dateInput = form.querySelector('[name="date"]');
    if (dateInput) {
      const today = new Date().toISOString().split("T")[0];
      dateInput.setAttribute("min", today);
    }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;

      const data = new FormData(form);
      const code = "PG-" + Math.random().toString(36).substring(2, 8).toUpperCase();

      // Show confirmation modal
      const modal = document.getElementById("reserve-modal");
      if (modal) {
        modal.querySelector(".booking-code").textContent = code;
        const details = modal.querySelector(".booking-details");
        if (details) {
          details.innerHTML = `
            <p><strong>${data.get("name")}</strong></p>
            <p>${data.get("date")} at ${data.get("time")} · ${data.get("guests")} guests</p>
          `;
        }
        modal.classList.add("open");
        modal.querySelector(".modal-close")?.addEventListener("click", () => {
          modal.classList.remove("open");
          form.reset();
        }, { once: true });
      }

      showToast("Reservation confirmed!", "success");
    });

    // Live validation
    form.querySelectorAll("input, select, textarea").forEach((field) => {
      field.addEventListener("blur", () => validateField(field));
      field.addEventListener("input", () => {
        if (field.classList.contains("error")) validateField(field);
      });
    });
  }

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll("[required]").forEach((field) => {
      if (!validateField(field)) valid = false;
    });
    return valid;
  }

  function validateField(field) {
    const errorEl = field.parentElement.querySelector(".form-error");
    let message = "";

    if (field.validity.valueMissing) {
      message = "This field is required";
    } else if (field.type === "email" && field.validity.typeMismatch) {
      message = "Please enter a valid email";
    } else if (field.name === "guests" && (+field.value < 1 || +field.value > 20)) {
      message = "Guests must be between 1 and 20";
    } else if (field.name === "phone" && field.value && !/^[\d\s\-+()]{7,}$/.test(field.value)) {
      message = "Please enter a valid phone number";
    }

    if (message) {
      field.classList.add("error");
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add("visible");
      }
      return false;
    } else {
      field.classList.remove("error");
      if (errorEl) errorEl.classList.remove("visible");
      return true;
    }
  }

  /* ---------- Testimonials Slider ---------- */
  function initTestimonials() {
    const track = document.querySelector(".testimonial-track");
    const dots = document.querySelectorAll(".testimonial-dot");
    if (!track || !dots.length) return;

    let current = 0;
    const total = dots.length;

    function goTo(index) {
      current = index;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle("active", i === current));
    }

    dots.forEach((dot, i) => {
      dot.addEventListener("click", () => goTo(i));
    });

    // Auto-play
    setInterval(() => {
      goTo((current + 1) % total);
    }, 5000);
  }

  /* ---------- Dish of the Day ---------- */
  function initDishOfTheDay() {
    const banner = document.getElementById("dish-of-day");
    if (!banner) return;

    // Pick based on day of year for consistency
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000
    );
    const item = MENU_ITEMS[dayOfYear % MENU_ITEMS.length];

    banner.innerHTML = `
      <div class="dotd-emoji">${item.emoji}</div>
      <div class="dotd-info">
        <span class="label" style="color:var(--accent);font-size:0.75rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase">Dish of the Day</span>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div style="display:flex;align-items:center;gap:1rem;margin-top:0.75rem">
          <span class="price">$${item.price}</span>
          <button class="btn btn-sm btn-primary add-to-cart" data-id="${item.id}">Add to Cart</button>
        </div>
      </div>
    `;

    banner.querySelector(".add-to-cart")?.addEventListener("click", () => addToCart(item.id));
  }

  /* ---------- Newsletter ---------- */
  function initNewsletter() {
    const form = document.querySelector(".newsletter-form");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = form.querySelector("input")?.value;
      if (email && email.includes("@")) {
        showToast("Thanks for subscribing!", "success");
        form.reset();
      } else {
        showToast("Please enter a valid email", "error");
      }
    });
  }

  /* ---------- Featured Carousel (simple auto-scroll) ---------- */
  function initFeaturedCarousel() {
    // Featured dishes on home use the same card structure; tilt already applied via global
    // Just ensure add-to-cart works on home page featured items
    document.querySelectorAll(".featured-grid .add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => addToCart(+btn.dataset.id));
    });

    document.querySelectorAll(".featured-grid .fav-btn").forEach((btn) => {
      const id = +btn.dataset.id;
      if (favorites.includes(id)) btn.classList.add("active");
      btn.addEventListener("click", () => toggleFavorite(id, btn));
    });

    initTiltCards();
  }

  /* ---------- Utility ---------- */
  function debounce(fn, ms) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), ms);
    };
  }
})();