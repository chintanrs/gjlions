const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");

const items = [...document.querySelectorAll(".menu-item")];

const paths = {
  squad: document.getElementById("arc-squad"),
  fixtures: document.getElementById("arc-fixtures"),
  gallery: document.getElementById("arc-gallery"),
};

const dots = {
  squad: document.getElementById("dot-squad"),
  fixtures: document.getElementById("dot-fixtures"),
  gallery: document.getElementById("dot-gallery"),
};

const grads = {
  squad: document.getElementById("grad-squad"),
  fixtures: document.getElementById("grad-fixtures"),
  gallery: document.getElementById("grad-gallery"),
};

// ---------- Helpers ----------
function setGradient(gradEl, x1, y1, x2, y2) {
  gradEl.setAttribute("x1", x1);
  gradEl.setAttribute("y1", y1);
  gradEl.setAttribute("x2", x2);
  gradEl.setAttribute("y2", y2);

  // IMPORTANT: start visible (not transparent), then taper near the end
  gradEl.innerHTML = `
    <stop offset="0%" stop-color="#ffd27d" stop-opacity="1"/>
    <stop offset="70%" stop-color="#f5a623" stop-opacity="1"/>
    <stop offset="92%" stop-color="#f5a623" stop-opacity="0.45"/>
    <stop offset="100%" stop-color="#f5a623" stop-opacity="0"/>
  `;
}

function logoCenter() {
  const r = logo.getBoundingClientRect();
  return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width };
}

// ---------- Open/Close ----------
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = !scene.classList.contains("is-open");
  scene.classList.toggle("is-open", open);

  if (open) {
    positionMenu();
    drawArcs();
  }
});

// Click outside closes
scene.addEventListener("pointerdown", (e) => {
  if (!e.target.closest("#logoCore") && !e.target.closest(".menu-item")) {
    scene.classList.remove("is-open");
  }
}, { passive: true });

// Prevent menu clicks from closing
items.forEach(btn => {
  btn.addEventListener("pointerdown", (e) => e.stopPropagation());
  btn.addEventListener("click", (e) => e.stopPropagation());
});

// ---------- Menu positioning (safe + always clickable) ----------
function positionMenu() {
  const { cx, cy } = logoCenter();
  const minDim = Math.min(window.innerWidth, window.innerHeight);

  // Smaller radius to keep items reachable on all screens
  const radius = Math.min(minDim * 0.28, 280);

  const anglesDeg = { squad: -90, fixtures: 35, gallery: 215 };

  items.forEach(el => {
    const a = (anglesDeg[el.dataset.key] * Math.PI) / 180;
    el.style.left = `${cx + Math.cos(a) * radius}px`;
    el.style.top  = `${cy + Math.sin(a) * radius}px`;
  });
}

// ---------- Arc drawing (tight + aligned) ----------
function drawArcs() {
  const { cx, cy, w } = logoCenter();

  // Start behind logo edge
  const startRadius = w / 2 + 10;

  items.forEach(el => {
    const key = el.dataset.key;
    const b = el.getBoundingClientRect();

    // End at option center, then pull back so it doesn't touch text
    let ex = b.left + b.width / 2;
    let ey = b.top + b.height / 2;

    const dx = ex - cx;
    const dy = ey - cy;
    const len = Math.hypot(dx, dy) || 1;

    // Start point outside logo
    const sx = cx + (dx / len) * startRadius;
    const sy = cy + (dy / len) * startRadius;

    // Stop before label
    const stopOffset = 44;
    ex -= (dx / len) * stopOffset;
    ey -= (dy / len) * stopOffset;

    // Very subtle curvature (connector, not decoration)
    const nx = -dy / len;
    const ny =  dx / len;
    const bend = 14;

    const c1x = sx + (dx * 0.33) + nx * bend;
    const c1y = sy + (dy * 0.33) + ny * bend;
    const c2x = sx + (dx * 0.66) + nx * bend;
    const c2y = sy + (dy * 0.66) + ny * bend;

    paths[key].setAttribute("d", `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${ex} ${ey}`);

    // Apply gradient stroke so it’s visible
    setGradient(grads[key], sx, sy, ex, ey);
    paths[key].setAttribute("stroke", `url(#grad-${key})`);

    // End dot
    dots[key].setAttribute("cx", ex);
    dots[key].setAttribute("cy", ey);
    dots[key].setAttribute("r", 4);
  });
}

// Recompute on resize
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});
``
