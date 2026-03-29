const THEME_STORAGE_KEY = "sergio-sanctuary-theme";
const NAV_COLLAPSE_WIDTH = 1180;
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

applyTheme(getPreferredTheme());

if (typeof systemThemeQuery.addEventListener === "function") {
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);
} else if (typeof systemThemeQuery.addListener === "function") {
  systemThemeQuery.addListener(handleSystemThemeChange);
}

document.addEventListener("DOMContentLoaded", () => {
  const motionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  setupThemeToggle();
  setupScrollProgress();
  setupHeaderState();
  setupMobileMenu();
  setupActiveNav();
  setupHeadlineRotator(motionAllowed);
  setupHeroMotion(motionAllowed);
  setupRevealOnScroll();
  setupMetricCountUp(motionAllowed);
  setupTiltEffects(motionAllowed);
  setupAttractionCarousel();
  setupSmoothAnchorScroll();
  setupWeatherWidget(motionAllowed);
  setupFormPrefillLinks();
  setupStaticForms();
  setupContactFormValidation();
  setupLightbox();
});

function getStoredTheme() {
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage errors in restricted browsers.
  }
}

function getPreferredTheme() {
  const storedTheme = getStoredTheme();
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;
  return systemThemeQuery.matches ? "dark" : "light";
}

function applyTheme(theme) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  document.documentElement.style.colorScheme = nextTheme;
}

function syncThemeToggleButtons() {
  const theme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const nextTheme = theme === "dark" ? "light" : "dark";

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    const label = button.querySelector(".theme-toggle__label");
    if (label) label.textContent = theme === "dark" ? "Dark" : "Light";
    button.setAttribute("aria-label", `Switch to ${nextTheme} mode`);
    button.setAttribute("aria-pressed", String(theme === "dark"));
  });
}

function handleSystemThemeChange(event) {
  const storedTheme = getStoredTheme();
  if (storedTheme === "dark" || storedTheme === "light") return;
  applyTheme(event.matches ? "dark" : "light");
  syncThemeToggleButtons();
}

function setupThemeToggle() {
  const navShell = document.querySelector(".nav-shell");
  if (!navShell || navShell.querySelector("[data-theme-toggle]")) {
    syncThemeToggleButtons();
    return;
  }

  const button = document.createElement("button");
  button.type = "button";
  button.className = "theme-toggle";
  button.dataset.themeToggle = "true";
  button.innerHTML = `
    <span class="theme-toggle__track" aria-hidden="true">
      <span class="theme-toggle__thumb"></span>
    </span>
    <span class="theme-toggle__label"></span>
  `;

  const navCta = navShell.querySelector(".nav-cta");
  if (navCta) {
    navShell.insertBefore(button, navCta);
  } else {
    navShell.appendChild(button);
  }

  button.addEventListener("click", () => {
    const currentTheme = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    setStoredTheme(nextTheme);
    syncThemeToggleButtons();
  });

  syncThemeToggleButtons();
}

function setupScrollProgress() {
  if (document.querySelector(".site-progress")) return;

  const bar = document.createElement("div");
  bar.className = "site-progress";
  document.body.prepend(bar);

  const syncProgress = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
    document.documentElement.style.setProperty("--scroll-progress", progress.toFixed(4));
  };

  syncProgress();
  window.addEventListener("scroll", syncProgress, { passive: true });
  window.addEventListener("resize", syncProgress);
}

function setupHeaderState() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const syncHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 20);
  };

  syncHeader();
  window.addEventListener("scroll", syncHeader, { passive: true });
}

function setupMobileMenu() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const menu = document.querySelector("[data-menu]");
  if (!toggle || !menu) return;

  const desktopCta = document.querySelector(".nav-shell > .nav-cta");
  if (desktopCta && !menu.querySelector(".nav-menu-cta")) {
    const mobileCta = desktopCta.cloneNode(true);
    mobileCta.classList.add("nav-menu-cta");
    menu.appendChild(mobileCta);
  }

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    menu.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isExpanded = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isExpanded));
    menu.classList.toggle("is-open", !isExpanded);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > NAV_COLLAPSE_WIDTH) closeMenu();
  });
}

function setupActiveNav() {
  const links = document.querySelectorAll("[data-nav-link]");
  if (!links.length) return;

  const path = window.location.pathname.split("/").pop() || "index.html";
  links.forEach((link) => {
    link.classList.toggle("is-active", link.getAttribute("href") === path);
  });
}

function setupHeadlineRotator(motionAllowed) {
  const el = document.querySelector("[data-hero-rotator]");
  if (!el || !motionAllowed) return;

  const headlines = (el.dataset.headlines || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  if (headlines.length < 2) return;

  let index = 0;
  window.setInterval(() => {
    el.classList.add("is-fading");
    window.setTimeout(() => {
      index = (index + 1) % headlines.length;
      el.textContent = headlines[index];
      el.classList.remove("is-fading");
    }, 220);
  }, 3200);
}

function setupHeroMotion(motionAllowed) {
  if (!motionAllowed) return;

  const hero = document.querySelector(".hero");
  if (!hero) return;

  let pointerX = 0;
  let pointerY = 0;
  let scrollOffset = 0;
  let frame = null;

  const render = () => {
    frame = null;
    hero.style.setProperty("--hero-pan-x", `${pointerX * -18}px`);
    hero.style.setProperty("--hero-pan-y", `${pointerY * -12 + scrollOffset}px`);
    hero.style.setProperty("--panel-shift", `${pointerY * -12 + scrollOffset * 0.4}px`);
  };

  const queueRender = () => {
    if (frame !== null) return;
    frame = requestAnimationFrame(render);
  };

  hero.addEventListener("mousemove", (event) => {
    const bounds = hero.getBoundingClientRect();
    pointerX = event.clientX / bounds.width - 0.5;
    pointerY = event.clientY / bounds.height - 0.5;
    queueRender();
  });

  hero.addEventListener("mouseleave", () => {
    pointerX = 0;
    pointerY = 0;
    queueRender();
  });

  const onScroll = () => {
    const bounds = hero.getBoundingClientRect();
    const ratio = Math.max(-1, Math.min(1, bounds.top / window.innerHeight));
    scrollOffset = ratio * -18;
    queueRender();
  };

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupRevealOnScroll() {
  const targets = Array.from(document.querySelectorAll("[data-reveal]:not(.form-surface)"));
  if (!targets.length) return;

  const grouped = new Map();
  targets.forEach((el) => {
    const parent = el.parentElement;
    if (!grouped.has(parent)) grouped.set(parent, []);
    grouped.get(parent).push(el);
  });

  grouped.forEach((items) => {
    items.forEach((el, index) => {
      el.style.setProperty("--reveal-delay", `${Math.min(index * 90, 360)}ms`);
    });
  });

  if (!("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-revealed");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

function setupMetricCountUp(motionAllowed) {
  const metrics = Array.from(document.querySelectorAll(".metric strong"));
  if (!metrics.length) return;

  const parseMetric = (text) => {
    const match = text.trim().match(/^([^\d-]*)(-?\d+(?:\.\d+)?)(.*)$/);
    if (!match) return null;

    const [, prefix, value, suffix] = match;
    return {
      prefix,
      suffix,
      value: Number(value),
      decimals: (value.split(".")[1] || "").length,
    };
  };

  const renderValue = (el, parsed, value) => {
    const output = parsed.decimals > 0 ? value.toFixed(parsed.decimals) : Math.round(value).toString();
    el.textContent = `${parsed.prefix}${output}${parsed.suffix}`;
  };

  const animateMetric = (el) => {
    const parsed = parseMetric(el.dataset.countUp || el.textContent);
    if (!parsed) return;
    if (!motionAllowed) {
      renderValue(el, parsed, parsed.value);
      return;
    }

    const start = performance.now();
    const duration = 1200;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const current = parsed.value * easeOut(progress);
      renderValue(el, parsed, current);
      if (progress < 1) requestAnimationFrame(step);
    };

    renderValue(el, parsed, 0);
    requestAnimationFrame(step);
  };

  if (!motionAllowed || !("IntersectionObserver" in window)) {
    metrics.forEach((metric) => animateMetric(metric));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateMetric(entry.target);
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  metrics.forEach((metric) => observer.observe(metric));
}

function setupTiltEffects(motionAllowed) {
  if (!motionAllowed) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const nodes = document.querySelectorAll(".card:not(.card--flip), .gallery-button, .metric, .info-strip, .video-frame");

  nodes.forEach((node) => {
    node.classList.add("is-tilting");

    node.addEventListener("mousemove", (event) => {
      const bounds = node.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      node.classList.add("is-tilt-active");
      node.style.transform =
        `perspective(900px) rotateX(${(-y * 7).toFixed(2)}deg) ` +
        `rotateY(${(x * 7).toFixed(2)}deg) translateY(-6px) scale(1.01)`;
    });

    node.addEventListener("mouseleave", () => {
      node.classList.remove("is-tilt-active");
      node.style.removeProperty("transform");
    });
  });
}

function setupSmoothAnchorScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function setupWeatherWidget(motionAllowed) {
  const weatherWidget = document.querySelector("#weather-widget");
  if (!weatherWidget) return;

  const status = weatherWidget.querySelector(".weather-status");
  const grid = weatherWidget.querySelector(".weather-grid");
  if (!status || !grid) return;

  const latitude = weatherWidget.dataset.lat || "9.95";
  const longitude = weatherWidget.dataset.lon || "123.4";
  const endpoint =
    "https://api.open-meteo.com/v1/forecast" +
    `?latitude=${latitude}&longitude=${longitude}` +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max" +
    "&timezone=auto&forecast_days=16";

  const weatherLabel = (code) => {
    if (code === 0) return "Clear";
    if (code <= 3) return "Partly cloudy";
    if (code <= 48) return "Fog";
    if (code <= 67) return "Rain";
    if (code <= 77) return "Showers";
    if (code <= 82) return "Heavy rain";
    if (code <= 99) return "Storm";
    return "Mixed";
  };

  const weatherIcon = (code) => {
    if (code === 0) return { src: "images/icons/sunny.webp", alt: "Sunny weather icon" };
    if (code <= 48) return { src: "images/icons/cloudy.webp", alt: "Cloudy weather icon" };
    if (code >= 95) return { src: "images/icons/storm.webp", alt: "Storm weather icon" };
    if (code <= 82) return { src: "images/icons/rain.webp", alt: "Rain weather icon" };
    return { src: "images/icons/cloudy.webp", alt: "Mixed weather icon" };
  };

  const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const getSundayToSaturdayDates = () => {
    const today = startOfDay(new Date());
    const nextSunday = new Date(today);
    const dayIndex = today.getDay();
    const daysUntilSunday = (7 - dayIndex) % 7;
    nextSunday.setDate(today.getDate() + daysUntilSunday);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(nextSunday);
      date.setDate(nextSunday.getDate() + index);
      return date.toISOString().slice(0, 10);
    });
  };

  const pickSundayToSaturdayForecast = (forecast) => {
    const byDate = new Map(forecast.map((entry) => [entry.date, entry]));
    const weekDates = getSundayToSaturdayDates();
    const weekly = weekDates.map((date) => byDate.get(date)).filter(Boolean);
    if (weekly.length === 7) return weekly;
    return forecast.slice(0, 7);
  };

  const makeOfflineForecast = () => {
    const weekDates = getSundayToSaturdayDates();
    const maxValues = [27, 28, 29, 28, 27, 28, 29];
    const minValues = [21, 22, 22, 21, 21, 22, 22];
    const rainValues = [20, 25, 35, 30, 28, 24, 22];
    const weatherCodes = [1, 2, 61, 3, 63, 2, 95];

    return weekDates.map((date, index) => {
      return {
        date,
        max: maxValues[index],
        min: minValues[index],
        rain: rainValues[index],
        code: weatherCodes[index],
      };
    });
  };

  const renderForecast = (forecast, sourceLabel) => {
    grid.innerHTML = "";
    forecast.forEach((item, index) => {
      const icon = weatherIcon(item.code);
      const dayName = new Date(item.date).toLocaleDateString("en-US", {
        weekday: "short",
      });

      const card = document.createElement("article");
      card.className = "weather-day";
      card.innerHTML = `
        <strong>${dayName}</strong>
        <img class="weather-day__icon" src="${icon.src}" alt="${icon.alt}" loading="lazy">
        <span>${weatherLabel(item.code)}</span>
        <span>${Math.round(item.max)}°C / ${Math.round(item.min)}°C</span>
        <span>Rain ${Math.round(item.rain)}%</span>
      `;
      grid.appendChild(card);

      if (motionAllowed && typeof card.animate === "function") {
        card.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          {
            duration: 420,
            delay: index * 90,
            easing: "cubic-bezier(0.22, 1, 0.36, 1)",
            fill: "both",
          }
        );
      }
    });

    status.textContent = sourceLabel;
  };

  const fromApi = (payload) => {
    const daily = payload?.daily;
    if (
      !daily ||
      !Array.isArray(daily.time) ||
      !Array.isArray(daily.weather_code) ||
      !Array.isArray(daily.temperature_2m_max) ||
      !Array.isArray(daily.temperature_2m_min)
    ) {
      throw new Error("Weather payload incomplete");
    }

    return daily.time.map((date, index) => ({
      date,
      code: daily.weather_code[index],
      max: daily.temperature_2m_max[index],
      min: daily.temperature_2m_min[index],
      rain: daily.precipitation_probability_max?.[index] ?? 0,
    }));
  };

  let loaded = false;
  let idleTimer = null;

  const loadForecast = () => {
    if (loaded) return;
    loaded = true;
    if (idleTimer !== null) window.clearTimeout(idleTimer);

    status.textContent = "Loading live weather forecast...";
    fetch(endpoint)
      .then((response) => {
        if (!response.ok) throw new Error("Weather request failed");
        return response.json();
      })
      .then((payload) => {
        renderForecast(
          pickSundayToSaturdayForecast(fromApi(payload)),
          "Live weekly weather (Sunday to Saturday) powered by Open-Meteo."
        );
      })
      .catch(() => {
        renderForecast(
          makeOfflineForecast(),
          "Offline mode: showing sample Sunday-to-Saturday weather."
        );
      });
  };

  status.textContent = "Forecast will load when this section comes into view.";

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          currentObserver.unobserve(entry.target);
          loadForecast();
        });
      },
      { rootMargin: "240px 0px" }
    );

    observer.observe(weatherWidget);
    idleTimer = window.setTimeout(loadForecast, 3500);
    return;
  }

  idleTimer = window.setTimeout(loadForecast, 1200);
}

function setupFormPrefillLinks() {
  const links = document.querySelectorAll("[data-fill-target][data-fill-value]");
  if (!links.length) return;

  links.forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.getElementById(link.dataset.fillTarget);
      if (!target) return;
      target.value = link.dataset.fillValue || "";
      target.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
}

function setupStaticForms() {
  const forms = document.querySelectorAll("[data-static-form]");
  if (!forms.length) return;

  forms.forEach((form) => {
    const status = form.querySelector(".form-status");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      if (!status) return;

      status.classList.add("is-visible", "is-success");
      status.classList.remove("is-error");
      status.textContent = "Sample only. This request is saved on the page for preview and is not sent anywhere yet.";
      form.reset();
    });
  });
}

function setupContactFormValidation() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const status = form.querySelector(".form-status");
  const nameField = form.querySelector("#full-name");
  const emailField = form.querySelector("#email");
  const phoneField = form.querySelector("#phone");
  const dateField = form.querySelector("#visit-date");
  const messageField = form.querySelector("#message");

  const setFieldError = (field, message) => {
    const msg = form.querySelector(`[data-error-for="${field.id}"]`);
    field.classList.toggle("field-error", Boolean(message));
    if (msg) msg.textContent = message || "";
  };

  const validate = () => {
    let isValid = true;

    const name = nameField.value.trim();
    const email = emailField.value.trim();
    const phone = phoneField.value.trim();
    const visitDate = dateField.value.trim();
    const message = messageField.value.trim();

    [nameField, emailField, phoneField, dateField, messageField].forEach((field) => {
      setFieldError(field, "");
    });

    if (name.length < 2) {
      setFieldError(nameField, "Please enter your full name.");
      isValid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setFieldError(emailField, "Please provide a valid email address.");
      isValid = false;
    }

    const phonePattern = /^[0-9+\-\s()]{7,20}$/;
    if (phone && !phonePattern.test(phone)) {
      setFieldError(phoneField, "Phone number format looks invalid.");
      isValid = false;
    }

    if (!visitDate) {
      setFieldError(dateField, "Please select your preferred visit date.");
      isValid = false;
    }

    if (message.length < 12) {
      setFieldError(messageField, "Please add more detail so the team can assist you.");
      isValid = false;
    }

    return isValid;
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const valid = validate();

    if (!status) return;
    status.classList.add("is-visible");

    if (!valid) {
      status.classList.remove("is-success");
      status.classList.add("is-error");
      status.textContent = "Please fix the highlighted fields before submitting.";
      return;
    }

    status.classList.remove("is-error");
    status.classList.add("is-success");
    status.textContent =
      "Inquiry saved locally. In live hosting, connect this form to your preferred email/form service.";
    form.reset();
  });
}

function setupLightbox() {
  const buttons = document.querySelectorAll("[data-lightbox-src]");
  const modal = document.querySelector("#lightbox-modal");
  const image = document.querySelector("#lightbox-image");
  const closeButton = document.querySelector("[data-lightbox-close]");
  if (!buttons.length || !modal || !image || !closeButton) return;

  const closeModal = () => {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    image.removeAttribute("src");
    image.removeAttribute("alt");
    document.body.style.overflow = "";
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      image.src = button.dataset.lightboxSrc;
      image.alt = button.dataset.lightboxAlt || "Gallery preview";
      modal.classList.add("is-open");
      modal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}

function setupAttractionCarousel() {
  const carousels = document.querySelectorAll("[data-attraction-carousel]");
  if (!carousels.length) return;

  carousels.forEach((carousel) => {
    if (carousel.dataset.carouselReady === "true") return;
    carousel.dataset.carouselReady = "true";

    const track = carousel.querySelector(".carousel__track");
    const viewport = carousel.querySelector(".carousel__viewport");
    if (!track || !viewport) return;

    let slides = Array.from(track.querySelectorAll(".carousel__slide"));
    const originalCount = slides.length;
    if (!originalCount) return;

    if (!track.dataset.cloned) {
      slides.forEach((slide) => {
        const clone = slide.cloneNode(true);
        clone.setAttribute("data-clone", "true");
        track.appendChild(clone);
      });
      track.dataset.cloned = "true";
    }

    const pausedClass = "is-paused";
    const flippedClass = "is-flipped";

    slides = Array.from(track.querySelectorAll(".carousel__slide"));
    slides.forEach((slide) => {
      slide.classList.add("is-revealed");
      slide.removeAttribute("data-reveal");
    });

    const clearFlips = () => {
      slides.forEach((slide) => slide.classList.remove(flippedClass));
    };

    const toggleCard = (slide) => {
      const isActive = slide.classList.contains(flippedClass);
      clearFlips();
      if (isActive) {
        carousel.classList.remove(pausedClass);
        return;
      }
      slide.classList.add(flippedClass);
      carousel.classList.add(pausedClass);
    };

    const getGap = () => {
      const gap = parseFloat(window.getComputedStyle(track).gap);
      return Number.isNaN(gap) ? 0 : gap;
    };

    const getVisibleCount = () => {
      const value = parseInt(
        window.getComputedStyle(carousel).getPropertyValue("--carousel-visible"),
        10
      );
      return Number.isNaN(value) || value < 1 ? 1 : value;
    };

    slides.forEach((slide) => {
      slide.addEventListener("click", () => toggleCard(slide));
      slide.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        toggleCard(slide);
      });
    });

    const updateScrollVars = () => {
      const gap = getGap();
      const visibleCount = getVisibleCount();
      const viewportWidth = viewport.clientWidth;
      if (!viewportWidth) return;

      const slideWidth =
        (viewportWidth - gap * Math.max(visibleCount - 1, 0)) / visibleCount;
      const safeSlideWidth = Math.max(slideWidth, 220);
      const scrollDistance = originalCount * (safeSlideWidth + gap);

      track.style.setProperty("--carousel-slide-width", `${safeSlideWidth}px`);
      track.style.setProperty("--carousel-scroll", `${scrollDistance}px`);
      track.style.setProperty("--carousel-duration", `${Math.max(18, scrollDistance / 90)}s`);
    };

    const refresh = () => requestAnimationFrame(updateScrollVars);
    refresh();
    window.addEventListener("resize", refresh);
    window.addEventListener("load", refresh, { once: true });
  });
}
