const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeOverlay = document.getElementById("closeOverlay");

/* Radial angles */
const angles = {
  squad: -90,
  gallery: 180,
  fixtures: 35
};

/* Toggle radial menu */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});

/* Close menu if clicking outside */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Menu item click */
items.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    openSection(item.dataset.key);
  });
});

/* Position radial menu */
function positionRadialMenu() {
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const minViewport = Math.min(window.innerWidth, window.innerHeight);
  const radius = Math.min(180, minViewport * 0.32);

  items.forEach(item => {
    const angle = angles[item.dataset.key] * Math.PI / 180;
    item.style.left = `${cx + Math.cos(angle) * radius}px`;
    item.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* ================= OVERLAY CONTENT ================= */

async function openSection(type) {
  overlay.classList.add("active");
  scene.classList.remove("is-open");
  overlayBody.innerHTML = "<p>Loading…</p>";

  try {
    if (type === "gallery") {
      overlayBody.innerHTML = `
        <h1>Gallery</h1>
        <p>Photos coming soon 📸</p>
      `;
      return;
    }

    if (type === "squad") {
      const res = await fetch("assets/data/squad.json");
      if (!res.ok) throw new Error("squad.json not found");
      const data = await res.json();

      const groups = {};
      data.items.forEach(p => {
        if (!groups[p.role]) groups[p.role] = [];
        groups[p.role].push(p.name);
      });

      overlayBody.innerHTML = `
        <h1>Squad</h1>
        ${Object.keys(groups).map(role => `
          <h2 style="margin-top:20px;text-transform:capitalize;">
            ${role}
          </h2>
          <ul class="list">
            ${groups[role].map(name => `<li>${name}</li>`).join("")}
          </ul>
        `).join("")}
      `;
      return;
    }

    if (type === "fixtures") {
      const res = await fetch("assets/data/fixtures.json");
      if (!res.ok) throw new Error("fixtures.json not found");
      const data = await res.json();

      overlayBody.innerHTML = `
        <h1>Fixtures</h1>
        ${data.tournaments.map(t => `
          <h2 style="margin-top:24px;">
            ${t.name} ${t.season}
          </h2>
          <ul class="list">
            ${t.fixtures.map(f => `
              <li>
                <strong>${f.date}</strong> • ${f.time}<br/>
                ${f.teamA} vs ${f.teamB}<br/>
                <span style="opacity:.75">${f.venue}</span>
              </li>
            `).join("")}
          </ul>
        `).join("")}
      `;
    }
  } catch (err) {
    overlayBody.innerHTML = `
      <h2>Error loading content</h2>
      <p>${err.message}</p>
    `;
  }
}

/* Close overlay */
closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("active");
});

/* Recalculate on resize */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});
