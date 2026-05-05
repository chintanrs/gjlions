const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menuItems = [...document.querySelectorAll(".menu-item")];

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeOverlay = document.getElementById("closeOverlay");

/* Keep menu around logo on all screen sizes */
const angles = {
  squad:   -90,   // top
  gallery: 180,   // left
  fixtures: 35    // bottom-right
};

/* Open/close radial menu */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});

/* Close radial menu on background click */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Menu item click -> open overlay */
menuItems.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  });
});

/* Close overlay */
closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("active");
  overlay.setAttribute("aria-hidden", "true");
});

/* Positioning: same on desktop and mobile */
function positionRadialMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const minViewport = Math.min(window.innerWidth, window.innerHeight);

  /* Tight but safe: capped, scales down on small screens */
  const radius = Math.min(180, minViewport * 0.32);

  menuItems.forEach(item => {
    const a = (angles[item.dataset.key] * Math.PI) / 180;
    const x = cx + Math.cos(a) * radius;
    const y = cy + Math.sin(a) * radius;

    item.style.left = `${x}px`;
    item.style.top  = `${y}px`;
  });
}

/* Overlay router */
async function openOverlay(type){
  overlay.classList.add("active");
  overlay.setAttribute("aria-hidden", "false");
  scene.classList.remove("is-open");

  overlayBody.innerHTML = `<p class="muted">Loading…</p>`;

  try {
    if (type === "gallery") {
      overlayBody.innerHTML = `
        <h1>Gallery</h1>
        <p class="muted">Photos coming soon 📸</p>
      `;
      return;
    }

    if (type === "squad") {
      const res = await fetch("data/squad.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load data/squad.json");
      const data = await res.json();

      // data.items: [{name, role}]
      const grouped = {};
      (data.items || []).forEach(p => {
        const role = (p.role || "other").toLowerCase();
        if (!grouped[role]) grouped[role] = [];
        grouped[role].push(p.name);
      });

      const roleOrder = ["batsman","allrounder","bowler","other"];
      const roles = roleOrder.filter(r => grouped[r]).concat(
        Object.keys(grouped).filter(r => !roleOrder.includes(r))
      );

      overlayBody.innerHTML = `
        <h1>Squad</h1>
        <p class="muted">Tap ✕ to close</p>
        <div class="squad-grid">
          ${roles.map(role => `
            <div class="role-header">${role}</div>
            ${grouped[role].map(name => `
              <div class="player-pill">
                <span class="name">${name}</span>
                <span class="role">${role}</span>
              </div>
            `).join("")}
          `).join("")}
        </div>
      `;
      return;
    }

    if (type === "fixtures") {
      const res = await fetch("data/fixtures.json", { cache: "no-store" });
      if (!res.ok) throw new Error("Could not load data/fixtures.json");
      const data = await res.json();

      // data.tournaments: [{name, season, fixtures:[{date,time,teamA,teamB,venue}]}]
      const tournaments = data.tournaments || [];

      overlayBody.innerHTML = `
        <h1>Fixtures</h1>
        <p class="muted">Tap ✕ to close</p>

        ${tournaments.map((t, idx) => `
          <div class="section-title">${t.name} ${t.season}</div>
          <div class="fixture-grid">
            ${(t.fixtures || []).map(f => `
              <div class="fixture-card">
                <div class="fixture-meta">
                  ${f.date} • ${f.time}
                </div>
                <div class="fixture-line">
                  <strong>${f.teamA}</strong> vs <strong>${f.teamB}</strong>
                </div>
                <div class="fixture-line">
                  ${f.venue}
                </div>
              </div>
            `).join("")}
          </div>
          ${idx < tournaments.length - 1 ? `<hr class="sep">` : ``}
        `).join("")}
      `;
    }
  } catch (err) {
    overlayBody.innerHTML = `
      <h1>Error</h1>
      <p class="muted">${err.message}</p>
    `;
  }
}

/* Reposition on resize/orientation */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});
``
