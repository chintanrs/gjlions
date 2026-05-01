(async function () {
  const grid = document.getElementById("fixturesGrid");
  const subtitle = document.getElementById("fixturesSubtitle");

  if (!grid) return;

  let data;
  try {
    const res = await fetch("assets/data/fixtures.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load fixtures.json");
    data = await res.json();
  } catch (e) {
    grid.innerHTML = `<div class="data-error">Could not load fixtures data.</div>`;
    return;
  }

  if (subtitle) subtitle.textContent = data.tournament || "Fixtures";

  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  // Optional: sort by date ascending
  const items = [...(data.items || [])].sort((a, b) => {
    const da = new Date((a.date || "1970-01-01") + "T00:00:00").getTime();
    const db = new Date((b.date || "1970-01-01") + "T00:00:00").getTime();
    return da - db;
  });

  grid.innerHTML = "";

  items.forEach((item, idx) => {
    const dateStr = item.date ? fmt.format(new Date(item.date + "T00:00:00")) : "";
    const timeStr = (item.time && String(item.time).trim()) ? item.time : "TBD";
    const matchup = `${item.teamA} vs ${item.teamB}`;

    // Native disclosure widget (<details>/<summary>) 【1-73b520】【2-03f337】
    const details = document.createElement("details");
    details.className = "fixture-item reveal";
    details.dataset.fixtureIndex = String(idx);

    const summary = document.createElement("summary");
    summary.className = "fixture-summary";

    // COLLAPSED TILE: ONLY date + matchup (as you requested)
    summary.innerHTML = `
      <div class="fixture-summary__left">
        <div class="fixture-summary__date">${dateStr}</div>
        <div class="fixture-summary__match">${matchup}</div>
      </div>
      <div class="fixture-summary__icon" aria-hidden="true"></div>
    `;

    // EXPANDED PANEL: tournament, venue, date & time
    const panel = document.createElement("div");
    panel.className = "fixture-panel";
    panel.innerHTML = `
      <div class="fixture-row">
        <div class="fixture-label">Tournament</div>
        <div class="fixture-value">${data.tournament || ""}</div>
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

    // ✅ Only one open at a time (accordion behavior) 【3-0e05bb】
    details.addEventListener("toggle", () => {
      if (!details.open) return; // only act when opening
      const all = grid.querySelectorAll("details.fixture-item[open]");
      all.forEach(d => {
        if (d !== details) d.removeAttribute("open");
      });
    });

    grid.appendChild(details);
  });

  // Trigger reveal animations if your main.js listens for this event
  window.dispatchEvent(new CustomEvent("page:changed"));
})();