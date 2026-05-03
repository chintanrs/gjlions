const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const items = [...document.querySelectorAll(".menu-item")];

logo.addEventListener("click", (e) => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
  if(scene.classList.contains("is-open")){
    positionItems();
  }
});

// Close when clicking outside
scene.addEventListener("click", () => {
  scene.classList.remove("is-open");
});

// Stop option clicks from closing
items.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    console.log(`${btn.dataset.key} clicked`);
    // future overlay logic can go here
  });
});

function positionItems(){
  const rect = logo.getBoundingClientRect();
  const cx = rect.left + rect.width/2;
  const cy = rect.top + rect.height/2;

  // ✅ radius safely OUTSIDE logo
  const radius = rect.width/2 + 120;

  const layout = {
    squad: -90,
    gallery: 180,
    fixtures: 40
  };

  items.forEach(item => {
    const angle = layout[item.dataset.key] * Math.PI / 180;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;

    item.style.left = `${x}px`;
    item.style.top  = `${y}px`;
  });
}

window.addEventListener("resize", () => {
  if(scene.classList.contains("is-open")){
    positionItems();
  }
});
