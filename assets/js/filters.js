(function () {
  const buttons = Array.from(document.querySelectorAll(".filter-btn"));

  function apply(role) {
    document.querySelectorAll(".player-card").forEach(card => {
      const show = role === "all" || card.dataset.role === role;
      card.classList.toggle("is-hidden", !show);
    });
  }

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      apply(btn.dataset.role || "all");
    });
  });

  window.addEventListener("squad:rendered", () => {
    const active = document.querySelector(".filter-btn.is-active");
    apply(active ? active.dataset.role : "all");
  });
})();
