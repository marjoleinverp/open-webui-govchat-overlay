/**
 * Open WebUI Help Overlay - loader.js
 *
 * Drop-in help button + modal for standard Open WebUI deployments.
 * Place this file at /app/build/static/loader.js in your Docker image.
 *
 * Help content is loaded from a JSON file (help-content.json) served
 * alongside this script, or embedded inline below.
 */
(function () {
  "use strict";

  // ── Configuration ──────────────────────────────────────────────────
  const CONFIG = {
    // Where to fetch help content JSON. Relative to /static/.
    helpContentUrl: "/static/help-content.json",
    // App name placeholder replacement ({{APP_NAME}} in content)
    appName: document.title || "Open WebUI",
    // LocalStorage key to remember "don't show on startup"
    storageKey: "helpOverlay_dontShow",
    // Show on first visit?
    showOnFirstVisit: true,
  };

  // ── Wait for DOM ───────────────────────────────────────────────────
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    // Small delay to let Open WebUI's SvelteKit app mount first
    setTimeout(bootstrap, 800);
  }

  // ── State ──────────────────────────────────────────────────────────
  let helpData = null;
  let activeSection = null;
  let openSectionId = null;
  let isFullScreen = false;

  // ── Bootstrap ──────────────────────────────────────────────────────
  function bootstrap() {
    createFloatingButton();
    loadHelpContent().then(() => {
      // Show on first visit if configured
      if (CONFIG.showOnFirstVisit) {
        const dontShow = localStorage.getItem(CONFIG.storageKey);
        if (!dontShow) {
          openModal();
        }
      }
    });
  }

  // ── Load help content ──────────────────────────────────────────────
  async function loadHelpContent() {
    try {
      const resp = await fetch(CONFIG.helpContentUrl);
      if (resp.ok) {
        helpData = await resp.json();
      } else {
        console.warn("[HelpOverlay] Could not load help content:", resp.status);
        helpData = getFallbackContent();
      }
    } catch (err) {
      console.warn("[HelpOverlay] Error loading help content:", err);
      helpData = getFallbackContent();
    }
  }

  function getFallbackContent() {
    return {
      title: "Handleiding",
      subtitle: "Welkom! Hier vind je informatie over het gebruik van deze applicatie.",
      sections: [
        {
          id: "sec1",
          emoji: "\uD83D\uDCD6",
          title: "Welkom",
          content:
            '<h2 class="ho-chapter-title">Welkom</h2><p>Het help-bestand kon niet geladen worden. Neem contact op met je beheerder.</p>',
        },
      ],
    };
  }

  function r(text) {
    // Replace {{APP_NAME}} placeholders
    return (text || "").replace(/\{\{APP_NAME\}\}/g, CONFIG.appName);
  }

  // ── Floating button ────────────────────────────────────────────────
  function createFloatingButton() {
    const btn = document.createElement("button");
    btn.id = "ho-float-btn";
    btn.setAttribute("aria-label", "Help");
    btn.title = "Help";
    btn.textContent = "?";
    btn.addEventListener("click", openModal);
    document.body.appendChild(btn);
  }

  // ── Modal ──────────────────────────────────────────────────────────
  function openModal() {
    if (!helpData) return;
    if (document.getElementById("ho-backdrop")) return; // already open

    activeSection = helpData.sections[0]?.id || null;
    openSectionId = null;
    isFullScreen = false;

    const backdrop = document.createElement("div");
    backdrop.id = "ho-backdrop";
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeModal();
    });

    const modal = document.createElement("div");
    modal.id = "ho-modal";
    modal.classList.add("ho-modal-lg");

    modal.innerHTML = buildModalHTML();
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Wire up events after DOM insert
    wireModalEvents(modal);

    // Prevent body scroll
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    const backdrop = document.getElementById("ho-backdrop");
    if (backdrop) {
      backdrop.remove();
      document.body.style.overflow = "";
    }
  }

  function buildModalHTML() {
    const sections = helpData.sections;

    // Sidebar items
    let sidebarItems = "";
    for (const sec of sections) {
      const isActive = activeSection === sec.id;
      const hasItems = sec.items && sec.items.length > 0;
      const isOpen = openSectionId === sec.id;

      sidebarItems += `
        <li class="ho-nav-item">
          <a href="#" data-section="${sec.id}" class="ho-nav-link ${isActive ? "ho-active" : ""}">
            <span>${sec.emoji || ""}</span>
            <span>${r(sec.title)}</span>
            ${
              hasItems
                ? `<span class="ho-nav-chevron ${isOpen ? "ho-open" : ""}" data-toggle="${sec.id}">
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M7 7l3 3 3-3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>`
                : ""
            }
          </a>
          ${
            hasItems && isOpen
              ? `<ul class="ho-subnav">${sec.items
                  .map(
                    (item) => `
                  <li><a href="#" data-section="${sec.id}" data-item="${item.id}" class="ho-nav-link ho-sub">
                    <span>${item.emoji || ""}</span>
                    <span>${r(item.title)}</span>
                  </a></li>`
                  )
                  .join("")}</ul>`
              : ""
          }
        </li>`;
    }

    // Content
    let contentHTML = "";
    for (const sec of sections) {
      if (sec.id === activeSection) {
        contentHTML += `<section id="ho-${sec.id}" class="ho-section">${r(sec.content)}</section>`;
        if (sec.items) {
          for (const item of sec.items) {
            contentHTML += `
              <section id="ho-${item.id}" class="ho-section">
                <h3 class="ho-section-title">${item.emoji || ""} ${r(item.title)}</h3>
                ${r(item.content)}
              </section>`;
          }
        }
      }
    }

    const dontShow = localStorage.getItem(CONFIG.storageKey) === "1";

    return `
      <div class="ho-header">
        <div class="ho-title">
          <svg class="ho-info-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          ${r(helpData.title)}
        </div>
        <div class="ho-header-actions">
          <button id="ho-btn-print" title="Print handleiding" aria-label="Print handleiding">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2m-8 0h8M6 18v2h12v-2"/>
            </svg>
          </button>
          <button id="ho-btn-fullscreen" title="Volledig scherm" aria-label="Volledig scherm">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 20 20" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 7V3.75h3.25M16.25 7V3.75h-3.25M3.75 13V16.25h3.25M16.25 13V16.25h-3.25"/>
            </svg>
          </button>
          <button id="ho-btn-close" title="Sluiten" aria-label="Sluiten">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
            </svg>
          </button>
        </div>
      </div>
      <div class="ho-subtitle">${r(helpData.subtitle)}</div>
      <div class="ho-body">
        <nav class="ho-sidebar" aria-label="Help navigatie">
          <ul>${sidebarItems}</ul>
        </nav>
        <div class="ho-content" id="ho-content-area">
          ${contentHTML}
        </div>
      </div>
      <div class="ho-footer">
        <label class="ho-checkbox-label">
          <input type="checkbox" id="ho-dont-show" ${dontShow ? "checked" : ""} />
          <span>Niet meer automatisch tonen</span>
        </label>
        <button id="ho-btn-close-footer" class="ho-btn-primary">Sluiten</button>
      </div>`;
  }

  function wireModalEvents(modal) {
    // Close buttons
    modal.querySelector("#ho-btn-close").addEventListener("click", closeModal);
    modal.querySelector("#ho-btn-close-footer").addEventListener("click", () => {
      const cb = modal.querySelector("#ho-dont-show");
      if (cb && cb.checked) {
        localStorage.setItem(CONFIG.storageKey, "1");
      }
      closeModal();
    });

    // Fullscreen
    modal.querySelector("#ho-btn-fullscreen").addEventListener("click", () => {
      isFullScreen = !isFullScreen;
      modal.classList.toggle("ho-modal-full", isFullScreen);
      modal.classList.toggle("ho-modal-lg", !isFullScreen);
    });

    // Print
    modal.querySelector("#ho-btn-print").addEventListener("click", () => {
      printHelp();
    });

    // Navigation links
    modal.querySelectorAll("a[data-section]").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = link.dataset.section;
        const itemId = link.dataset.item;

        // Update active section if different
        if (sectionId !== activeSection || itemId) {
          activeSection = sectionId;
          openSectionId = sectionId;
          rerenderModal();

          // Scroll to item if specified
          if (itemId) {
            setTimeout(() => {
              const el = document.getElementById("ho-" + itemId);
              const container = document.getElementById("ho-content-area");
              if (el && container) {
                const containerTop = container.getBoundingClientRect().top;
                const elTop = el.getBoundingClientRect().top;
                container.scrollBy({ top: elTop - containerTop, behavior: "smooth" });
              }
            }, 50);
          }
        }
      });
    });

    // Chevron toggles
    modal.querySelectorAll(".ho-nav-chevron").forEach((chevron) => {
      chevron.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const toggleId = chevron.dataset.toggle;
        openSectionId = openSectionId === toggleId ? null : toggleId;
        rerenderModal();
      });
    });

    // Don't-show checkbox
    const cb = modal.querySelector("#ho-dont-show");
    if (cb) {
      cb.addEventListener("change", () => {
        if (cb.checked) {
          localStorage.setItem(CONFIG.storageKey, "1");
        } else {
          localStorage.removeItem(CONFIG.storageKey);
        }
      });
    }

    // Escape key
    const escHandler = (e) => {
      if (e.key === "Escape") {
        closeModal();
        document.removeEventListener("keydown", escHandler);
      }
    };
    document.addEventListener("keydown", escHandler);
  }

  function rerenderModal() {
    const modal = document.getElementById("ho-modal");
    if (!modal) return;
    const wasFull = isFullScreen;
    modal.innerHTML = buildModalHTML();
    modal.classList.toggle("ho-modal-full", wasFull);
    modal.classList.toggle("ho-modal-lg", !wasFull);
    wireModalEvents(modal);
  }

  // ── Print ──────────────────────────────────────────────────────────
  function printHelp() {
    if (!helpData) return;
    let html = "";
    for (const sec of helpData.sections) {
      html += r(sec.content);
      if (sec.items) {
        for (const item of sec.items) {
          html += `<h3>${item.emoji || ""} ${r(item.title)}</h3>`;
          html += r(item.content);
        }
      }
    }
    const win = window.open();
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html><head><title>${r(helpData.title)}</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; max-width: 800px; margin: 2rem auto; padding: 0 1rem; color: #333; }
h1 { border-bottom: 2px solid #2563eb; padding-bottom: .5rem; }
h2 { margin-top: 2rem; border-bottom: 1px solid #ddd; padding-bottom: .3rem; }
h3 { margin-top: 1.5rem; }
ul, ol { padding-left: 1.5rem; }
li { margin-bottom: .3rem; }
</style></head><body>
<h1>${r(helpData.title)}</h1>
${html}
</body></html>`);
    win.document.close();
    win.print();
  }
})();
