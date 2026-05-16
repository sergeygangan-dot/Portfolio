/**
 * Blob Cursor — адаптация React Bits (reactbits.dev/animations/blob-cursor)
 * Organic blob trail with SVG goo filter; цвета под палитру сайта.
 */
(function () {
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!finePointer || prefersReduced) return;

  const config = {
    trailCount: 3,
    sizes: [48, 108, 68],
    innerSize: 7,
    opacities: [0.5, 0.32, 0.2],
    fillColor: "#3dffc8",
    fillColorTrail: "#8b7cf8",
    /** Скорость сглаживания: лидер быстрее, хвост медленнее (аналог fast/slow GSAP) */
    ease: [0.42, 0.14, 0.09],
    filterStdDeviation: 28,
  };

  const root = document.createElement("div");
  root.className = "blob-cursor-root";
  root.setAttribute("aria-hidden", "true");
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("aria-hidden", "true");
  const filter = document.createElementNS(svgNS, "filter");
  filter.setAttribute("id", "blob-cursor-filter");
  const blur = document.createElementNS(svgNS, "feGaussianBlur");
  blur.setAttribute("in", "SourceGraphic");
  blur.setAttribute("stdDeviation", String(config.filterStdDeviation));
  blur.setAttribute("result", "blur");
  const matrix = document.createElementNS(svgNS, "feColorMatrix");
  matrix.setAttribute("in", "blur");
  matrix.setAttribute("values", "1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -10");
  filter.appendChild(blur);
  filter.appendChild(matrix);
  svg.appendChild(filter);
  root.appendChild(svg);

  const main = document.createElement("div");
  main.className = "blob-main";
  root.appendChild(main);
  const blobs = [];
  const state = [];

  for (let i = 0; i < config.trailCount; i++) {
    const el = document.createElement("div");
    el.className = "blob";
    const size = config.sizes[i];
    el.style.width = size + "px";
    el.style.height = size + "px";
    el.style.backgroundColor = i === 0 ? config.fillColor : config.fillColorTrail;
    el.style.opacity = String(config.opacities[i]);

    if (i === 0) {
      const dot = document.createElement("span");
      dot.className = "inner-dot";
      dot.style.width = config.innerSize + "px";
      dot.style.height = config.innerSize + "px";
      el.appendChild(dot);
    }

    main.appendChild(el);
    blobs.push(el);
    state.push({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  }

  document.body.appendChild(root);
  document.body.classList.add("has-blob-cursor");

  let targetX = state[0].x;
  let targetY = state[0].y;
  let visible = false;
  let rafId = null;

  function tick() {
    let settled = true;

    blobs.forEach((el, i) => {
      const ease = config.ease[i];
      const dx = targetX - state[i].x;
      const dy = targetY - state[i].y;

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) settled = false;

      state[i].x += dx * ease;
      state[i].y += dy * ease;
      el.style.transform = "translate(" + state[i].x + "px, " + state[i].y + "px) translate(-50%, -50%)";
    });

    if (!visible && settled) {
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(tick);
  }

  function ensureLoop() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  function onMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    visible = true;
    root.style.opacity = "1";
    ensureLoop();
  }

  function onLeave() {
    visible = false;
    root.style.opacity = "0";
    ensureLoop();
  }

  root.style.opacity = "0";
  root.style.transition = "opacity 0.35s ease";

  window.addEventListener("pointermove", onMove, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  onMove({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 });
})();
