(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;

  const header = document.getElementById("header");
  const progressBar = document.querySelector(".scroll-progress__bar");
  const bgMesh = document.querySelector(".bg-mesh");
  const navLinks = document.querySelectorAll(".nav a[data-nav]");
  const navSections = ["about", "skills", "projects", "contact"]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  /* ——— Scroll progress + header ——— */
  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

    if (progressBar) {
      progressBar.style.width = progress + "%";
    }

    if (header) {
      header.classList.toggle("is-scrolled", scrollTop > 48);
    }

    if (bgMesh && !prefersReduced) {
      bgMesh.style.transform = "translate3d(0, " + scrollTop * 0.04 + "px, 0)";
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ——— Section reveal ——— */
  if (prefersReduced) {
    document.querySelectorAll(".reveal, .stagger-item, .quote-line").forEach((el) => {
      el.classList.add("is-visible");
    });
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

    /* ——— Stagger grids & steps ——— */
    const staggerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const items = entry.target.querySelectorAll(".stagger-item");
          items.forEach((item, index) => {
            setTimeout(() => item.classList.add("is-visible"), index * 90);
          });
          staggerObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );

    document.querySelectorAll(".reveal-stagger").forEach((el) => staggerObserver.observe(el));

    /* ——— Quote lines ——— */
    const quoteBlock = document.querySelector(".quote-reveal");
    if (quoteBlock) {
      const quoteObserver = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          quoteBlock.querySelectorAll(".quote-line").forEach((line, index) => {
            setTimeout(() => line.classList.add("is-visible"), 200 + index * 180);
          });
          quoteObserver.disconnect();
        },
        { threshold: 0.35 }
      );
      quoteObserver.observe(quoteBlock);
    }
  }

  /* ——— Active nav ——— */
  if (navLinks.length && navSections.length && !prefersReduced) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach((link) => {
              link.classList.toggle("is-active", link.dataset.nav === id);
            });
          }
        });
      },
      { rootMargin: "-42% 0px -48% 0px", threshold: 0 }
    );

    navSections.forEach((section) => navObserver.observe(section));
  } else if (navLinks.length) {
    navLinks[0]?.classList.add("is-active");
  }

  /* ——— Hero photo tilt ——— */
  const heroPhoto = document.querySelector("[data-tilt]");
  const heroFrame = heroPhoto?.querySelector(".hero-photo-frame");

  if (heroPhoto && heroFrame && finePointer && !prefersReduced) {
    let rafId = null;

    heroPhoto.addEventListener("mousemove", (event) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const rect = heroPhoto.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        heroFrame.style.transform =
          "perspective(900px) rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg) scale3d(1.02, 1.02, 1.02)";
      });
    });

    heroPhoto.addEventListener("mouseleave", () => {
      if (rafId) cancelAnimationFrame(rafId);
      heroFrame.style.transform = "";
    });
  }
})();
