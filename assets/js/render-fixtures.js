(async function () {
  const tournamentGrid = document.getElementById("tournamentGrid");
  const tournamentFixtures = document.getElementById("tournamentFixtures");
  const backBtn = document.getElementById("backToTournaments");
  const tournamentHeading = document.getElementById("tournamentHeading");
  const fixturesGrid = document.getElementById("fixturesGrid");

  if (!tournamentGrid || !tournamentFixtures || !backBtn || !tournamentHeading || !fixturesGrid) return;

  let data;
  try {
    const res = await fetch("assets/data/fixtures.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load fixtures.json");
    data = await res.json();
  } catch (e) {
    tournamentGrid.innerHTML = `<div class="data-error">Could not load fixtures data.</div>`;
    return;
  }

  const tournaments = Array.isArray(data.tournaments) ? data.tournaments : [];
  if (tournaments.length === 0) {
    tournamentGrid.innerHTML = `<div class="empty-state">No tournaments added yet.</div>`;
    return;
  }

  const fmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" });

  // ---------- Modal (tap card -> details) ----------
  const modal = createModal();
  document.body.appendChild(modal.root);

  function openModal(details) {
    modal.title.textContent = details.matchup;
    modal.meta.textContent = `${details.tournament}`;
    modal.rows.innerHTML = `
      <div class="modal-row">
        <div class="modal-label">Tournament</div>
        <div class="modal-value">${details.tournament}</div>
      </div>
      <div class="modal-row">
        <div class="modal-label">Venue</div>
        <div class="modal-value">${details.venue}</div>
      </div>
      <div class="modal-row">
        <div class="modal-label">Date & Time</div>
        <div class="modal-value">${details.dateStr} • ${details.timeStr}</div>
      </div>
    `;
    document.body.classList.add("modal-open"); // lock background scroll 【3-cafb5a】
    modal.root.classList.add("is-open");
    modal.root.removeAttribute("aria-hidden");
  }

  function closeModal() {
    modal.root.classList.remove("is-open");
    modal.root.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open"); // unlock background scroll 【3-cafb5a】
  }

  modal.closeBtn.addEventListener("click", closeModal);
  modal.backdrop.addEventListener("click", closeModal);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.root.classList.contains("is-open")) closeModal();
  });

  // ---------- Views ----------
  function showTournamentList() {
    tournamentGrid.classList.remove("is-hidden");
    tournamentFixtures.classList.add("is-hidden");
    fixturesGrid.innerHTML = "";
    tournamentHeading.textContent = "";
    window.dispatchEvent(new CustomEvent("page:changed"));
  }

  function showFixturesForTournament(t) {
    tournamentGrid.classList.add("is-hidden");
    tournamentFixtures.classList.remove("is-hidden");
    tournamentHeading.textContent = t.season ? `${t.name} • ${t.season}` : t.name;

    fixturesGrid.innerHTML = "";

    const fixtures = Array.isArray(t.fixtures) ? [...t.fixtures] : [];
    fixtures.sort((a, b) => {
      const da = new Date((a.date || "1970-01-01") + "T00:00:00").getTime();
      const db = new Date((b.date || "1970-01-01") + "T00:00:00").getTime();
      return da - db;
    });

    if (fixtures.length === 0) {
      fixturesGrid.innerHTML = `<div class="empty-state">No fixtures in this tournament yet.</div>`;
      return;
    }

    // ----- Carousel shell -----
    const wrap = document.createElement("div");
    wrap.className = "match-carousel";

    const leftBtn = document.createElement("button");
    leftBtn.type = "button";
    leftBtn.className = "carousel-arrow left is-hidden";
    leftBtn.setAttribute("aria-label", "Scroll left");
    leftBtn.innerHTML = "‹";

    const rightBtn = document.createElement("button");
    rightBtn.type = "button";
    rightBtn.className = "carousel-arrow right";
    rightBtn.setAttribute("aria-label", "Scroll right");
    rightBtn.innerHTML = "›";

    const scroller = document.createElement("div");
    scroller.className = "match-scroller";
    scroller.setAttribute("tabindex", "0"); // keyboard focusable

    // Build cards
    fixtures.forEach((item) => {
      const dateStr = item.date ? fmt.format(new Date(item.date + "T00:00:00")) : "";
      const timeStr = (item.time && String(item.time).trim()) ? item.time : "TBD";
      const matchup = `${item.teamA} vs ${item.teamB}`;

      const card = document.createElement("button");
      card.type = "button";
      card.className = "match-card";
      card.innerHTML = `
        <div class="match-card__date">${dateStr}</div>
        <div class="match-card__match">${matchup}</div>
        <div class="match-card__hint">Tap for details</div>
      `;

      card.addEventListener("click", () => {
        openModal({
          matchup,
          tournament: t.name,
          venue: item.venue || "",
          dateStr,
          timeStr
        });
      });

      scroller.appendChild(card);
    });

    wrap.appendChild(leftBtn);
    wrap.appendChild(scroller);
    wrap.appendChild(rightBtn);
    fixturesGrid.appendChild(wrap);

    // ----- Arrow behavior: show/hide at ends -----
    function updateArrows() {
      const maxScroll = scroller.scrollWidth - scroller.clientWidth;
      const atStart = scroller.scrollLeft <= 2;
      const atEnd = scroller.scrollLeft >= (maxScroll - 2);

      leftBtn.classList.toggle("is-hidden", atStart);
      rightBtn.classList.toggle("is-hidden", atEnd);
    }

    function scrollByCards(direction) {
      // Scroll by ~90% of visible width for a “page” feel
      const amount = Math.max(240, Math.floor(scroller.clientWidth * 0.9));
      scroller.scrollBy({ left: direction * amount, behavior: "smooth" });
    }

    leftBtn.addEventListener("click", () => scrollByCards(-1));
    rightBtn.addEventListener("click", () => scrollByCards(1));

    scroller.addEventListener("scroll", () => {
      // cheap throttle
      window.requestAnimationFrame(updateArrows);
    });

    window.addEventListener("resize", updateArrows);

    // Initial state
    updateArrows();

    window.dispatchEvent(new CustomEvent("page:changed"));
  }

  // Tournament tiles
  function renderTournamentTiles() {
    tournamentGrid.innerHTML = "";

    tournaments.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tournament-card reveal";

      const count = Array.isArray(t.fixtures) ? t.fixtures.length : 0;
      btn.innerHTML = `
        <div class="tournament-card__inner">
          <div class="tournament-card__name">${t.name}</div>
          <div class="tournament-card__meta">${t.season ? t.season : ""}</div>
          <div class="tournament-card__count">${count} match${count === 1 ? "" : "es"}</div>
        </div>
      `;
      btn.addEventListener("click", () => showFixturesForTournament(t));
      tournamentGrid.appendChild(btn);
    });

    window.dispatchEvent(new CustomEvent("page:changed"));
  }

  backBtn.addEventListener("click", showTournamentList);

  renderTournamentTiles();
  showTournamentList();

  // ---------- Helpers ----------
  function createModal() {
    const root = document.createElement("div");
    root.className = "match-modal";
    root.setAttribute("aria-hidden", "true");

    const backdrop = document.createElement("div");
    backdrop.className = "match-modal__backdrop";

    const panel = document.createElement("div");
    panel.className = "match-modal__panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "match-modal__close";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.textContent = "✕";

    const title = document.createElement("div");
    title.className = "match-modal__title";

    const meta = document.createElement("div");
    meta.className = "match-modal__meta";

    const rows = document.createElement("div");
    rows.className = "match-modal__rows";

    panel.appendChild(closeBtn);
    panel.appendChild(title);
    panel.appendChild(meta);
    panel.appendChild(rows);

    root.appendChild(backdrop);
    root.appendChild(panel);

    return { root, backdrop, panel, closeBtn, title, meta, rows };
  }
})();
