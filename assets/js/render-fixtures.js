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

  function showTournamentList() {
    tournamentGrid.classList.remove("is-hidden");
    tournamentFixtures.classList.add("is-hidden");
    fixturesGrid.innerHTML = "";
    tournamentHeading.textContent = "";
    window.dispatchEvent(new CustomEvent("page:changed"));
  }

  function showFixturesForTournament(t) {
    // switch views
    tournamentGrid.classList.add("is-hidden");
    tournamentFixtures.classList.remove("is-hidden");

    tournamentHeading.textContent = t.season ? `${t.name} • ${t.season}` : t.name;

    // render fixtures
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

    fixtures.forEach((item) => {
      const dateStr = item.date ? fmt.format(new Date(item.date + "T00:00:00")) : "";
      const timeStr = (item.time && String(item.time).trim()) ? item.time : "TBD";
      const matchup = `${item.teamA} vs ${item.teamB}`;

      // Native disclosure widget <details>/<summary> 【1-544cd4】
      // Using name groups makes it accordion-style (only one open at a time) without extra JS. 【1-544cd4】
      const details = document.createElement("details");
      details.className = "fixture-item reveal";
      details.setAttribute("name", "fixture-accordion");

      const summary = document.createElement("summary");
      summary.className = "fixture-summary";
      summary.innerHTML = `
        <div class="fixture-summary__left">
          <div class="fixture-summary__date">${dateStr}</div>
          <div class="fixture-summary__match">${matchup}</div>
        </div>
        <div class="fixture-summary__icon" aria-hidden="true"></div>
      `;

      const panel = document.createElement("div");
      panel.className = "fixture-panel";
      panel.innerHTML = `
        <div class="fixture-row">
          <div class="fixture-label">Tournament</div>
          <div class="fixture-value">${t.name}</div>
        </div>
        <div class="fixture-row">
          <div class="fixture-label">Venue</div>
          <div class="fixture-value">${item.venue || ""}</div>
        </div>
        <div class="fixture-row">
          <div class="fixture-label">Date & Time</div>
          <div class="fixture-value">${dateStr} • ${timeStr}</div>
        </div>
      `;

      details.appendChild(summary);
      details.appendChild(panel);
      fixturesGrid.appendChild(details);
    });

    window.dispatchEvent(new CustomEvent("page:changed"));
  }

  // Render tournament tiles (square rounded cards)
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
})();
``
