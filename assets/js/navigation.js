document.querySelectorAll(".nav__btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav__btn").forEach(b => b.classList.remove("is-active"));
    document.querySelectorAll(".page").forEach(p => p.classList.remove("is-active"));

    btn.classList.add("is-active");
    document.getElementById(btn.dataset.tab).classList.add("is-active");

    document.getElementById("content").scrollIntoView({ behavior: "smooth" });
  });
});
``
