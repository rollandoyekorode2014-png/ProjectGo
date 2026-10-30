/* ============================================
   ProjectGo — main.js
   Shared logic: navbar, scroll, cursor, loader, theme
   ============================================ */

(function () {
  "use strict";

  /* ---------- DOM Ready ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initLoader();
    initTheme();
    initNavbar();
    initCustomCursor();
    initScrollProgress();
    initRevealAnimations();
    initBackToTop();
    initMagneticButtons();
    initRippleEffect();
    initOpenIndicator();
    initKonamiCode();
    initPageTransition();
  });

  /* ---------- Page Loader ---------- */
  function initLoader() {
    const loader = document.querySelector(".loader");
    if (!loader) return;

    const bar = loader.querySelector(".loader-bar-fill");
    let progress = 0;

    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setTimeout(() => {
          loader.classList.add("hidden");
          document.body.classList.remove("loading");
          // Trigger hero animation
          const hero = document.querySelector(".hero");
          if (hero) hero.classList.add("loaded");
        }, 300);
      }
      if (bar) bar.style.width = progress + "%";
    }, 80);
  }

  /* ---------- Theme Toggle ---------- */
  function initTheme() {
    const saved = localStorage.getItem("pg-theme");
    if (saved) {
      document.documentElement.setAttribute("data-theme", saved);
    }

    const toggles = document.querySelectorAll(".theme-toggle");
    toggles.forEach((btn) => {
      updateThemeIcon(btn);
      btn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme");
        const next = current === "light" ? "dark" : "light";
        document.documentElement.setAttribute("data-theme", next);
        localStorage.setItem("pg-theme", next);
        toggles.forEach(updateThemeIcon);
      });
    });
  }

  function updateThemeIcon(btn) {
    const theme = document.documentElement.getAttribute("data-theme");
    btn.textContent = theme === "light" ? "🌙" : "☀️";
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark mode" : "Switch to light mode");
  }

  /* ---------- Navbar ---------- */
  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const mobileNav = document.querySelector(".mobile-nav");

    if (!navbar) return;

    // Scroll shrink
    let lastScroll = 0;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        if (y > 50) {
          navbar.classList.add("scrolled");
        } else {
          navbar.classList.remove("scrolled");
        }
        lastScroll = y;
      },
      { passive: true }
    );

    // Hamburger
    if (hamburger && mobileNav) {
      hamburger.addEventListener("click", () => {
        hamburger.classList.toggle("active");
        mobileNav.classList.toggle("open");
        document.body.style.overflow = mobileNav.classList.contains("open") ? "hidden" : "";
      });

      mobileNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          hamburger.classList.remove("active");
          mobileNav.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
    }

    // Active link
    const path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a, .mobile-nav a").forEach((a) => {
      const href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.classList.add("active");
      }
    });
  }

  /* ---------- Custom Cursor ---------- */
  function initCustomCursor() {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const cursor = document.querySelector(".cursor");
    const trail = document.querySelector(".cursor-trail");
    if (!cursor || !trail) return;

    let mouseX = 0,
      mouseY = 0;
    let trailX = 0,
      trailY = 0;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    });

    function animateTrail() {
      trailX += (mouseX - trailX) * 0.15;
      trailY += (mouseY - trailY) * 0.15;
      trail.style.left = trailX + "px";
      trail.style.top = trailY + "px";
      requestAnimationFrame(animateTrail);
    }
    animateTrail();

    // Grow on interactive elements
    const growTargets = "a, button, .btn, .filter-tab, .fav-btn, .qty-btn, .testimonial-dot, input, select, textarea, .dish-card, .gallery-item";
    document.querySelectorAll(growTargets).forEach((el) => {
      el.addEventListener("mouseenter", () => {
        cursor.classList.add("grow");
        trail.classList.add("grow");
      });
      el.addEventListener("mouseleave", () => {
        cursor.classList.remove("grow");
        trail.classList.remove("grow");
      });
    });
  }

  /* ---------- Scroll Progress ---------- */
  function initScrollProgress() {
    const bar = document.querySelector(".scroll-progress");
    if (!bar) return;

    window.addEventListener(
      "scroll",
      () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = progress + "%";
      },
      { passive: true }
    );
  }

  /* ---------- Reveal Animations (IntersectionObserver) ---------- */
  function initRevealAnimations() {
    const reveals = document.querySelectorAll(
      ".reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger"
    );
    if (!reveals.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      reveals.forEach((el) => el.classList.add("visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ---------- Back to Top ---------- */
  function initBackToTop() {
    const btn = document.querySelector(".back-to-top");
    if (!btn) return;

    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 400) {
          btn.classList.add("visible");
        } else {
          btn.classList.remove("visible");
        }
      },
      { passive: true }
    );

    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Magnetic Buttons ---------- */
  function initMagneticButtons() {
    if (window.matchMedia("(max-width: 768px)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    document.querySelectorAll(".btn-primary, .btn-outline").forEach((btn) => {
      btn.classList.add("magnetic");
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ---------- Ripple Effect ---------- */
  function initRippleEffect() {
    document.querySelectorAll(".btn").forEach((btn) => {
      btn.classList.add("ripple-effect");
      btn.addEventListener("click", function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement("span");
        ripple.classList.add("ripple");
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + "px";
        ripple.style.left = e.clientX - rect.left - size / 2 + "px";
        ripple.style.top = e.clientY - rect.top - size / 2 + "px";
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);

        // Button position for gradient
        this.style.setProperty("--x", ((e.clientX - rect.left) / rect.width) * 100 + "%");
        this.style.setProperty("--y", ((e.clientY - rect.top) / rect.height) * 100 + "%");
      });
    });
  }

  /* ---------- Open / Closed Indicator ---------- */
  function initOpenIndicator() {
    const indicator = document.querySelector(".open-indicator");
    if (!indicator) return;

    const now = new Date();
    const day = now.getDay(); // 0=Sun
    const hour = now.getHours();
    const minutes = now.getMinutes();
    const time = hour + minutes / 60;

    // Hours: Mon-Thu 11-22, Fri-Sat 11-23, Sun 12-21
    let isOpen = false;
    if (day >= 1 && day <= 4) {
      isOpen = time >= 11 && time < 22;
    } else if (day === 5 || day === 6) {
      isOpen = time >= 11 && time < 23;
    } else {
      isOpen = time >= 12 && time < 21;
    }

    indicator.classList.add(isOpen ? "open" : "closed");
    indicator.innerHTML = isOpen
      ? '<span class="dot"></span> We\'re open now'
      : '<span class="dot"></span> Currently closed';
  }

  /* ---------- Konami Code Easter Egg ---------- */
  function initKonamiCode() {
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "b",
      "a",
    ];
    let index = 0;

    document.addEventListener("keydown", (e) => {
      if (e.key === sequence[index] || e.key.toLowerCase() === sequence[index]) {
        index++;
        if (index === sequence.length) {
          document.body.classList.add("easter-egg");
          showToast("🎉 Konami code activated! Enjoy the colors!", "info");
          setTimeout(() => document.body.classList.remove("easter-egg"), 2000);
          index = 0;
        }
      } else {
        index = 0;
      }
    });
  }

  /* ---------- Page Transition ---------- */
  function initPageTransition() {
    document.querySelectorAll('a[href$=".html"]').forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = link.getAttribute("href");
        if (href.startsWith("http") || link.target === "_blank") return;
        // Simple fade out
        e.preventDefault();
        document.body.style.opacity = "0";
        document.body.style.transition = "opacity 0.3s ease";
        setTimeout(() => {
          window.location.href = href;
        }, 300);
      });
    });
  }

  /* ---------- Toast Helper (global) ---------- */
  window.showToast = function (message, type = "info") {
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    const icons = { success: "✅", error: "❌", info: "ℹ️" };
    toast.innerHTML = `<span>${icons[type] || "ℹ️"}</span> ${message}`;
    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  };

  /* ---------- Number Counter ---------- */
  window.animateCounters = function () {
    const counters = document.querySelectorAll(".stat-number[data-target]");
    if (!counters.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const target = parseInt(el.getAttribute("data-target"), 10);
            const duration = 2000;
            const start = performance.now();

            function update(now) {
              const elapsed = now - start;
              const progress = Math.min(elapsed / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              el.textContent = Math.floor(eased * target).toLocaleString();
              if (progress < 1) {
                requestAnimationFrame(update);
              } else {
                el.textContent = target.toLocaleString() + (el.dataset.suffix || "");
              }
            }
            requestAnimationFrame(update);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((c) => observer.observe(c));
  };

  // Auto-run counters if present
  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector(".stat-number[data-target]")) {
      window.animateCounters();
    }
  });
})();