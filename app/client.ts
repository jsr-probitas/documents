/**
 * Client-side JavaScript for the documentation site
 *
 * This file is bundled by Vite and loaded in the browser.
 * It handles theme switching, code highlighting, and interactive UI elements.
 */

const HLJS_CDN =
  "https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build";

const HLJS_THEMES = {
  dark: `${HLJS_CDN}/styles/github-dark.min.css`,
  light: `${HLJS_CDN}/styles/github.min.css`,
};

type Theme = "light" | "dark";

/**
 * Dynamically load a script from URL
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

/**
 * Ensure highlight.js is loaded
 */
async function ensureHljs(): Promise<void> {
  if ((window as unknown as { hljs?: unknown }).hljs) return;
  await loadScript(`${HLJS_CDN}/highlight.min.js`);
  await loadScript(`${HLJS_CDN}/languages/typescript.min.js`);
  await loadScript(`${HLJS_CDN}/languages/json.min.js`);
}

/**
 * Update highlight.js theme based on current theme
 */
function updateHljsTheme(theme: Theme): void {
  const themeLink = document.getElementById("hljs-theme") as HTMLLinkElement;
  if (!themeLink) return;
  themeLink.href = HLJS_THEMES[theme];
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme(): void {
  const current = document.documentElement.getAttribute("data-theme") as Theme;
  const next: Theme = current === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  updateHljsTheme(next);
}

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu(): void {
  const header = document.querySelector(".global-header");
  header?.classList.toggle("menu-open");
  document.body.classList.toggle("menu-open");
}

/**
 * Close mobile menu
 */
function closeMobileMenu(): void {
  const header = document.querySelector(".global-header");
  header?.classList.remove("menu-open");
  document.body.classList.remove("menu-open");
}

/**
 * Initialize carousel navigation
 */
function initCarousel(): void {
  const tabs = document.querySelectorAll<HTMLElement>(".carousel-tab");
  const slides = document.querySelectorAll<HTMLElement>(".carousel-slide");
  const prevBtn = document.querySelector<HTMLElement>(".carousel-prev");
  const nextBtn = document.querySelector<HTMLElement>(".carousel-next");

  if (!tabs.length || !slides.length || !prevBtn || !nextBtn) return;

  const totalSlides = slides.length;
  const hljs = (window as unknown as {
    hljs?: { highlightElement: (el: Element) => void };
  }).hljs;

  function goToSlide(index: number): void {
    tabs.forEach((t) => t.classList.remove("active"));
    tabs[index].classList.add("active");
    slides.forEach((s) => s.classList.remove("active"));
    slides[index].classList.add("active");

    if (hljs) {
      slides[index]
        .querySelectorAll("pre code:not([data-highlighted])")
        .forEach((block) => hljs.highlightElement(block));
    }
  }

  function getCurrentIndex(): number {
    return [...tabs].findIndex((t) => t.classList.contains("active"));
  }

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      goToSlide(parseInt(tab.dataset.index ?? "0"));
    });
  });

  prevBtn.addEventListener("click", () => {
    const current = getCurrentIndex();
    goToSlide((current - 1 + totalSlides) % totalSlides);
  });

  nextBtn.addEventListener("click", () => {
    const current = getCurrentIndex();
    goToSlide((current + 1) % totalSlides);
  });
}

/**
 * Initialize scroll fade effect for scrollable navigation
 */
function initScrollableNavFade(): void {
  document.querySelectorAll<HTMLElement>(".scrollable-nav").forEach((el) => {
    function updateFade(): void {
      const atTop = el.scrollTop <= 10;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 10;

      el.classList.toggle("scroll-top", atTop);
      el.classList.toggle("scroll-bottom", atBottom);
    }

    updateFade();
    el.addEventListener("scroll", updateFade, { passive: true });
  });
}

/**
 * Initialize copy-to-clipboard buttons for code blocks
 */
function initCodeCopyButtons(): void {
  document.querySelectorAll("pre").forEach((pre) => {
    const code = pre.querySelector("code");
    if (!code) return;

    const wrapper = document.createElement("div");
    wrapper.className = "code-block-wrapper";
    pre.parentNode?.insertBefore(wrapper, pre);
    wrapper.appendChild(pre);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy-btn";
    btn.title = "Copy code";
    btn.innerHTML = '<i class="ti ti-copy"></i>';
    wrapper.appendChild(btn);

    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent ?? "");
        btn.innerHTML = '<i class="ti ti-check"></i>';
        btn.classList.add("copied");
        setTimeout(() => {
          btn.innerHTML = '<i class="ti ti-copy"></i>';
          btn.classList.remove("copied");
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    });
  });
}

/**
 * Initialize scroll fade effect for API signature blocks
 */
function initSignatureScrollFade(): void {
  document
    .querySelectorAll<HTMLElement>(".api-signature pre code")
    .forEach((code) => {
      function updateFade(): void {
        const canScrollLeft = code.scrollLeft > 5;
        const canScrollRight =
          code.scrollLeft + code.clientWidth < code.scrollWidth - 5;

        code.classList.toggle("scroll-left", canScrollLeft);
        code.classList.toggle("scroll-right", canScrollRight);
      }

      updateFade();
      code.addEventListener("scroll", updateFade, { passive: true });
      window.addEventListener("resize", updateFade, { passive: true });
    });
}

/**
 * Scroll to top button functionality
 */
function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Initialize scroll-to-top button visibility
 */
function initScrollToTop(): void {
  window.addEventListener("scroll", () => {
    const btn = document.getElementById("scroll-to-top");
    if (window.scrollY > 300) {
      btn?.classList.add("visible");
    } else {
      btn?.classList.remove("visible");
    }
  });
}

/**
 * Search modal functionality
 */
let searchInitialized = false;

function openSearch(): void {
  const modal = document.getElementById("search-modal");
  modal?.classList.add("open");
  document.body.style.overflow = "hidden";

  const PagefindUI =
    (window as unknown as { PagefindUI?: new (opts: object) => void })
      .PagefindUI;
  if (!searchInitialized && PagefindUI) {
    new PagefindUI({
      element: "#search-container",
      showSubResults: true,
      showImages: false,
    });
    searchInitialized = true;
  }

  setTimeout(() => {
    const input = modal?.querySelector<HTMLInputElement>(
      ".pagefind-ui__search-input",
    );
    input?.focus();
  }, 100);
}

function closeSearch(): void {
  const modal = document.getElementById("search-modal");
  modal?.classList.remove("open");
  document.body.style.overflow = "";
}

function closeSearchOnBackdrop(event: Event): void {
  if ((event.target as HTMLElement).id === "search-modal") {
    closeSearch();
  }
}

// Expose functions to global scope for inline event handlers
Object.assign(window, {
  toggleTheme,
  toggleMobileMenu,
  closeMobileMenu,
  scrollToTop,
  openSearch,
  closeSearch,
  closeSearchOnBackdrop,
});

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  const currentTheme =
    (document.documentElement.getAttribute("data-theme") as Theme) ?? "dark";
  updateHljsTheme(currentTheme);

  initCarousel();
  initScrollableNavFade();
  initCodeCopyButtons();
  initSignatureScrollFade();
  initScrollToTop();

  // Keyboard shortcut for search
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      openSearch();
    }
    if (e.key === "Escape") {
      closeSearch();
    }
  });

  // Load highlight.js
  try {
    await ensureHljs();
    const hljs = (window as unknown as {
      hljs?: { highlightElement: (el: Element) => void };
    }).hljs;
    if (hljs) {
      document.querySelectorAll("pre code").forEach((block) => {
        hljs.highlightElement(block);
      });
    }
  } catch (err) {
    console.warn("Failed to load highlight.js", err);
  }
});
