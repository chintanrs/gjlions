const scene = document.getElementById("scene");
const logo = document.getElementById("logoCore");
const content = document.getElementById("contentLayer");

logo.addEventListener("click", e => {
  e.stopPropagation();
  scene.classList.toggle("is-open");
});

document.addEventListener("click", () => {
  scene.classList.remove("is-open");
  content.classList.remove("is-visible");
});

document.querySelectorAll(".menu-item").forEach(btn => {
  btn.addEventListener("click", e => {
    e.stopPropagation();

    const target = btn.dataset.target;
    scene.classList.remove("is-open");

    content.innerHTML = renderContent(target);
    content.classList.add("is-visible");
  });
});

function renderContent(type) {
  if (type === "squad") {
    return `<h1>Squad</h1><p>Squad content goes here.</p>`;
  }
  if (type === "fixtures") {
    return `<h1>Fixtures</h1><p>Fixtures content goes here.</p>`;
  }
  if (type === "gallery") {
    return `<h1>Gallery</h1><p>Gallery coming soon.</p>`;
  }
  return "";
}

// Esc to close
window.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    scene.classList.remove("is-open");
    content.classList.remove("is-visible");
  }
});
