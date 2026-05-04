const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

// Angles define the layout around the logo (tight, centered group)
const layoutDeg = {
  squad:   -90,  // Directly above the logo
  gallery: 180,  // Directly to the left
  fixtures: 35   // Bottom-right quadrant
};

// Toggle menu
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");

  if (scene.classList.contains("is-open")) {
    // Wait for CSS to apply open-state sizing before measuring
    requestAnimationFrame(() => {
      positionItemsTight();
    });
  }
});

// Close when clicking outside
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

// Prevent option clicks from closing
items.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${btn.dataset.key} clicked`);
  });
});

function positionItemsTight() {
  const logoRect = logo.getBoundingClientRect();
  const cx = logoRect.left + logoRect.width / 2;
  const cy = logoRect.top + logoRect.height / 2;

  /**
   * ADJUSTMENT MADE HERE:
   * We reduced visualLogoRadius from 0.40 to 0.25 to pull items closer to center.
   * We reduced baseGap from 22 to 12 for a tighter cluster.
   */
  const visualLogoRadius = logoRect.width * 0.25; 
  const baseGap = 12; 

  // Start with the tightest possible radius
  let radius = visualLogoRadius + baseGap;

  // Place items, then check overlap; expand radius minimally until no overlap.
  // Max 15 iterations for fine-tuned precision.
  for (let step = 0; step < 15; step++) {
    placeAtRadius(cx, cy, radius);

    if (!anyOverlapsLogo(logoRect, baseGap)) {
      break; // Stop as soon as items are clear of the logo
    }
    radius += 8; // Expand in small increments to maintain the "tight" look
  }
}

function placeAtRadius(cx, cy, radius) {
  items.forEach(item => {
    const key = item.dataset.key;
    const angle = (layoutDeg[key] * Math.PI) / 180;

    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    item.style.left = `${x}px`;
    item.style.top  = `${y}px`;
  });
}

// Checks whether any menu item overlaps the logo bounding box
function anyOverlapsLogo(logoRect, padding) {
  // Inflate the logo rect slightly so the gap feels clean
  const L = logoRect.left - padding;
  const T = logoRect.top - padding;
  const R = logoRect.right + padding;
  const B = logoRect.bottom + padding;

  return items.some(item => {
    const r = item.getBoundingClientRect();
    // Standard collision detection logic
    return !(r.right < L || r.left > R || r.bottom < T || r.top > B);
  });
}

// Keep it stable on resize
window.addEventListener("resize", () => {
  if (scene.classList.contains("is-open")) {
    requestAnimationFrame(() => positionItemsTight());
  }
});
