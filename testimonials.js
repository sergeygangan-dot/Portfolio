(function () {
  const slider = document.querySelector("[data-testimonials-slider]");
  if (!slider) return;

  const track = slider.querySelector(".testimonials-track");
  const viewport = slider.querySelector(".testimonials-viewport");
  const cards = [...slider.querySelectorAll(".testimonial-card")];
  const prevBtn = slider.querySelector(".testimonials-btn--prev");
  const nextBtn = slider.querySelector(".testimonials-btn--next");
  const dotsRoot = slider.querySelector(".testimonials-dots");

  if (!track || !viewport || !cards.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced) slider.classList.add("is-reduced-motion");

  let index = 0;
  let autoplayId = null;
  const intervalMs = 4500;

  cards.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "testimonials-dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Отзыв ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsRoot.appendChild(dot);
  });

  const dots = [...dotsRoot.querySelectorAll(".testimonials-dot")];

  function goTo(nextIndex, userTriggered) {
    index = (nextIndex + cards.length) % cards.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    cards.forEach((card, i) => card.classList.toggle("is-active", i === index));
    dots.forEach((dot, i) => {
      dot.classList.toggle("is-active", i === index);
      dot.setAttribute("aria-selected", i === index ? "true" : "false");
    });
    if (userTriggered) resetAutoplay();
  }

  function step(delta, userTriggered) {
    goTo(index + delta, userTriggered);
  }

  function resetAutoplay() {
    if (prefersReduced) return;
    clearInterval(autoplayId);
    autoplayId = setInterval(() => step(1, false), intervalMs);
  }

  prevBtn?.addEventListener("click", () => step(-1, true));
  nextBtn?.addEventListener("click", () => step(1, true));

  slider.addEventListener("mouseenter", () => clearInterval(autoplayId));
  slider.addEventListener("mouseleave", resetAutoplay);
  slider.addEventListener("focusin", () => clearInterval(autoplayId));
  slider.addEventListener("focusout", (e) => {
    if (!slider.contains(e.relatedTarget)) resetAutoplay();
  });

  goTo(0, false);
  resetAutoplay();
})();
