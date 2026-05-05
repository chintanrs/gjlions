const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menuItems = document.querySelectorAll(".menu-item");

const overlay = document.getElementById("overlay");
const overlayBody = document.getElementById("overlayBody");
const closeBtn = document.getElementById("closeOverlay");

/* Radial angles */
const angles = {
  squad: -90,
  gallery: 180,
  fixtures: 35
};

/* Toggle menu */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if (scene.classList.contains("is-open")) {
    positionMenu();
  }
});

/* Close menu */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Menu item click */
menuItems.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    openOverlay(btn.dataset.key);
  });
});

/* Position menu around logo */
function positionMenu() {
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;

  const radius = Math.min(180, Math.min(innerWidth, innerHeight) * 0.32);

  menuItems.forEach(b => {
    const angle = angles[b.dataset.key] * Math.PI / 180;
    b.style.left = `${cx + Math.cos(angle) * radius}px`;
    b.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* Open overlay */
async function openOverlay(type) {
  overlay.classList.add("active");
  scene.classList.remove("is-open");

  if (type === "gallery") {
    overlayBody.innerHTML = "<h1>Gallery</h1><p>Coming soon</p>";
    return;
  }

  if (type === "squad") {
    const res = await fetch("data/squad.json");
    const data = await res.json();

    overlayBody.innerHTML = `
      <h1>Squad</h1>
      <ul>
        ${data.items.map(p => `<li>${p.name} — ${p.role}</li>`).join("")}
      </ul>
    `;
    return;
  }

  if (type === "fixtures") {
    const res = await fetch("data/fixtures.json");
    const data = await res.json();

    let html = "<h1>Fixtures</h1>";
    data.tournaments.forEach(t => {
      html += `<h2>${t.name} ${t.season}</h2><ul>`;
      t.fixtures.forEach(f => {
        html += `
          <li>
            <strong>${f.date} • ${f.time}</strong><br>
            ${f.teamA} vs ${f.teamB}<br>
            ${f.venue}
          </li>
        `;
      });
      html += "</ul>";
    });

    overlayBody.innerHTML = html;
  }
}

/* Close overlay */
closeBtn.addEventListener("click", () => {
  overlay.classList.remove("active");
});
