const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeOverlay = document.getElementById("closeOverlay");

/* Radial angles */
const angles = {
  squad:   -90,
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

/* Close menu when clicking outside */
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

/* ---------------- Positioning ---------------- */

function positionRadialMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top  + r.height / 2;

  const minViewport = Math.min(window.innerWidth, window.innerHeight);

  const radius = Math.min(
    180,                // desktop sweet spot
    minViewport * 0.32  // mobile auto-scale
  );

  items.forEach(item => {
    const angle = angles[item.dataset.key] * Math.PI / 180;
    item.style.left = `${cx + Math.cos(angle) * radius}px`;
    item.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* ---------------- Overlay Logic ---------------- */

async function openSection(type){
  scene.classList.remove("is-open");
  overlay.classList.add("active");

  if (type === "gallery") {
    overlayBody.innerHTML = `
      <h1>Gallery</h1>
      <p>Match photos coming soon 📸</p>
    `;
    return;
  }

  if (type === "squad") {
    const res = await fetch("assets/data/squad.json");
    const data = await res.json();

    overlayBody.innerHTML = `
      <h1>${data.team} – Squad</h1>
      <ul class="list">
        ${data.players.map(p => `
          <li><strong>${p.name}</strong> — ${p.role}</li>
        `).join("")}
      </ul>
    `;
    return;
  }

  if (type === "fixtures") {
    const res = await fetch("assets/data/fixtures.json");
    const data = await res.json();

    overlayBody.innerHTML = `
      <h1>Fixtures</h1>
      <ul class="list">
        ${data.fixtures.map(f => `
          <li>
            <strong>${f.date}</strong><br/>
            vs ${f.opponent}<br/>
            ${f.venue} • ${f.time}
          </li>
        `).join("")}
      </ul>
    `;
  }
}

/* Close overlay */
closeOverlay.addEventListener("click", () => {
  overlay.classList.remove("active");
});

/* Keep radial layout stable on resize */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(positionRadialMenu);
  }
});
``
