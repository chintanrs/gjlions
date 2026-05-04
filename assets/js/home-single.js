const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

/* Fixed layout angles (tight, centered cluster) */
const layoutDeg = {
  squad:   -90,  // top
  gallery: 180,  // left
  fixtures: 35   // bottom-right
};

/* Toggle menu */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    // Wait one frame so layout + scale are applied
    requestAnimationFrame(() => {
      positionItemsTight();
    });
  }
});

/* Close when clicking outside */
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

/* Prevent option clicks from closing menu */
items.forEach(item => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${item.dataset.key} clicked`);
  });
});

/* ✅ FINAL, CORRECTED POSITIONING LOGIC */
function positionItemsTight() {
  const logoRect = logo.getBoundingClientRect();
  const cx = logoRect.left + logoRect.width / 2;
  const cy = logoRect.top + logoRect.height / 2;

  /*
    FIX (as you correctly identified):
    - Use a much smaller visual radius
    - Do NOT base it on 40–50% of logo width
  */
  const visualLogoRadius = logoRect.width * 0.25; // ✅ tight and stable
  const baseGap = 15;                             // ✅ small breathing room

  let radius = visualLogoRadius + baseGap;

  /*
    Expand ONLY if something overlaps the logo.
    This keeps the cluster as tight as physically possible.
  */
  for (let step = 0; step < 15; step++) {
    placeAtRadius(cx, cy, radius);

    if (!anyOverlapsLogo(logoRect, baseGap)) {
      break;
    }
    radius += 8; // small, controlled expansion
  }
}

/* Place items at a given radius */
function placeAtRadius(cx, cy, radius) {
  items.forEach(item => {
    const angle = layoutDeg[item.dataset.key] * Math.PI / 180;
    item.style.left = `${cx + Math.cos(angle) * radius}px`;
    item.style.top  = `${cy + Math.sin(angle) * radius}px`;
  });
}

/* Collision check to prevent overlap */
function anyOverlapsLogo(logoRect, padding) {
  const L = logoRect.left - padding;
  const T = logoRect.top - padding;
  const R = logoRect.right + padding;
  const B = logoRect.bottom + padding;

  return items.some(item => {
    const r = item.getBoundingClientRect();
    return !(r.right < L || r.left > R || r.bottom < T || r.top > B);
  });
}

/* Stay correct on resize */
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(() => {
      positionItemsTight();
    });
  }
});
