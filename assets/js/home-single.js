const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const menu = document.getElementById("radialMenu");

const contentLayer = document.getElementById("contentLayer");
const contentInner = document.getElementById("contentInner");
const contentClose = document.getElementById("contentClose");

const svg = document.getElementById("energyArcs");

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

const items = [...document.querySelectorAll(".menu-item")];

const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let particles = [];

/* ---------- sizing ---------- */
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", () => {
  resizeCanvas();
  if (scene.classList.contains("is-open")) {
    positionMenu();
    drawArcs();
  }
});

/* ---------- click behavior ---------- */
logo.addEventListener("click", (e) => {
  e.stopPropagation();
  const open = !scene.classList.contains("is-open");
  if (open) {
    scene.classList.add("is-open");
    positionMenu();
    drawArcs();
    burst();
  } else {
    scene.classList.remove("is-open");
  }
});

scene.addEventListener("pointerdown", (e) => {
  // Click outside closes menu + overlay
  if (!e.target.closest("#logoCore") && !e.target.closest(".menu-item") && !e.target.closest("#contentLayer")) {
    scene.classList.remove("is-open");
    hideOverlay();
  }
}, { passive: true });

contentClose.addEventListener("click", () => hideOverlay());

/* Menu clicks */
items.forEach(btn => {
  btn.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
  });
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    scene.classList.remove("is-open");
    showOverlay(btn.dataset.key);
  });
});

/* ESC closes */
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    scene.classList.remove("is-open");
    hideOverlay();
  }
});

/* ---------- menu positioning (always reachable) ---------- */
function positionMenu(){
  const r = logo.getBoundingClientRect();
  const cx = r.left + r.width/2;
  const cy = r.top + r.height/2;

  const minDim = Math.min(window.innerWidth, window.innerHeight);

  // Safe radius so options never fly off-screen
  const radius = Math.min(minDim * 0.32, 320);

  const layoutDeg = {
    squad: -90,
    fixtures: 35,
    gallery: 215,
  };

  items.forEach(btn => {
    const angle = (layoutDeg[btn.dataset.key] * Math.PI) / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    btn.style.left = `${x}px`;
    btn.style.top  = `${y}px`;
  });
}

/* ---------- supernova arcs (flow + taper + dot) ---------- */
function setGradient(gradEl, x1, y1, x2, y2){
  gradEl.setAttribute("x1", x1);
  gradEl.setAttribute("y1", y1);
  gradEl.setAttribute("x2", x2);
  gradEl.setAttribute("y2", y2);
  gradEl.innerHTML = `
    <stop offset="0%" stop-color="#ffd27d" stop-opacity="1"/>
    <stop offset="70%" stop-color="#f5a623" stop-opacity="0.95"/>
    <stop offset="92%" stop-color="#f5a623" stop-opacity="0.35"/>
    <stop offset="100%" stop-color="#f5a623" stop-opacity="0"/>
  `;
}

function drawArcs(){
  const a = logo.getBoundingClientRect();
  const x1 = a.left + a.width/2;
  const y1 = a.top + a.height/2;

  items.forEach(btn => {
    const key = btn.dataset.key;
    const b = btn.getBoundingClientRect();

    let x2 = b.left + b.width/2;
    let y2 = b.top + b.height/2;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.hypot(dx, dy) || 1;

    // Stop before text so arc doesn't overlap labels
    const stopOffset = 62;
    x2 -= (dx/len) * stopOffset;
    y2 -= (dy/len) * stopOffset;

    // Supernova curve: asymmetric controls
    const c1x = x1 + dx * 0.28 - dy * 0.42;
    const c1y = y1 + dy * 0.28 + dx * 0.42;
    const c2x = x1 + dx * 0.72 + dy * 0.30;
    const c2y = y1 + dy * 0.72 - dx * 0.30;

    paths[key].setAttribute("d", `M ${x1} ${y1} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}`);
    paths[key].setAttribute("stroke", `url(#grad-${key})`);

    // Apply taper gradient along the direction
    setGradient(grads[key], x1, y1, x2, y2);

    // Endpoint dot
    dots[key].setAttribute("cx", x2);
    dots[key].setAttribute("cy", y2);
  });
}

/* ---------- particles ---------- */
function burst(){
  const x = window.innerWidth/2;
  const y = window.innerHeight/2;
  for (let i=0;i<46;i++){
    const a = Math.random()*Math.PI*2;
    const s = 2.2 + Math.random()*4.8;
    particles.push({
      x,y,
      vx: Math.cos(a)*s,
      vy: Math.sin(a)*s,
      life: 38 + Math.random()*18,
      r: 1.8 + Math.random()*2.2
    });
  }
}

function tick(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles = particles.filter(p => p.life > 0);

  for (const p of particles){
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.985;
    p.vy *= 0.985;
    p.life -= 1;

    ctx.beginPath();
    ctx.fillStyle = `rgba(245,166,35,${Math.max(0,p.life/56)})`;
    ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fill();
  }

  requestAnimationFrame(tick);
}
tick();

/* ---------- overlay content from JSON ---------- */
async function showOverlay(type){
  contentLayer.classList.add("is-visible");
  contentLayer.setAttribute("aria-hidden", "false");

  if (type === "gallery"){
    contentInner.innerHTML = `<h1>Gallery</h1><div class="card">Coming soon 📸</div>`;
    return;
  }

  if (type === "squad"){
    try{
      const d = await fetch("assets/data/squad.json", { cache: "no-store" }).then(r=>r.json());
      const rows = (d.items || []).map(p => `<div class="card">${p.name} <span class="subtle">— ${p.role}</span></div>`).join("");
      contentInner.innerHTML = `<h1>Squad</h1><div class="subtle">Tap outside or press ESC to close.</div><div class="list">${rows}</div>`;
    }catch{
      contentInner.innerHTML = `<h1>Squad</h1><div class="card">Could not load squad.json</div>`;
    }
    return;
  }

  if (type === "fixtures"){
    try{
      const d = await fetch("assets/data/fixtures.json", { cache: "no-store" }).then(r=>r.json());
      const tournaments = d.tournaments || [];
      const blocks = tournaments.map(t => {
        const matches = (t.fixtures || []).map(m =>
          `<div class="card">${m.teamA} vs ${m.teamB}<div class="subtle">${m.date} • ${m.time || "TBD"} • ${m.venue || ""}</div></div>`
        ).join("");
        return `<div class="card"><strong style="color:#ffd27d;">${t.name} ${t.season || ""}</strong></div><div class="list">${matches}</div>`;
      }).join("");

      contentInner.innerHTML = `<h1>Fixtures</h1><div class="subtle">Tap outside or press ESC to close.</div>${blocks || `<div class="card">No tournaments yet.</div>`}`;
    }catch{
      contentInner.innerHTML = `<h1>Fixtures</h1><div class="card">Could not load fixtures.json</div>`;
    }
  }
}

function hideOverlay(){
  contentLayer.classList.remove("is-visible");
  contentLayer.setAttribute("aria-hidden","true");
}
