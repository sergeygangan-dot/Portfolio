/**
 * Split Text — адаптация React Bits (reactbits.dev/text-animations/split-text)
 * chars + smartWrap: символы внутри слова, переносы только между словами
 */
(function () {
  const defaults = {
    splitType: "chars",
    delay: 50,
    duration: 1.25,
    baseDelay: 100,
    fromY: 40,
  };

  /** @returns {{ type: 'word', chars: string[], accent?: boolean } | { type: 'space', value: string }}[] */
  function parseSegments(container) {
    const segments = [];

    container.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const parts = node.textContent.split(/(\s+)/);
        parts.forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            segments.push({ type: "space", value: part });
          } else {
            segments.push({ type: "word", chars: [...part], accent: false });
          }
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        segments.push({
          type: "word",
          chars: [...node.textContent],
          accent: node.classList.contains("gradient-text"),
        });
      }
    });

    return segments;
  }

  function createCharUnit(char, index) {
    const wrap = document.createElement("span");
    wrap.className = "split-char";

    const inner = document.createElement("span");
    inner.className = "split-char-inner";
    inner.textContent = char;
    inner.style.setProperty("--split-i", String(index));

    wrap.appendChild(inner);
    return wrap;
  }

  function buildSplitDOM(element, options) {
    const segments = parseSegments(element);

    element.textContent = "";
    element.classList.add("split-parent");
    element.dataset.splitType = "chars";
    element.style.setProperty("--split-duration", options.duration + "s");
    element.style.setProperty("--split-stagger", options.delay / 1000 + "s");
    element.style.setProperty("--split-base-delay", options.baseDelay / 1000 + "s");
    element.style.setProperty("--split-from-y", options.fromY + "px");

    let charIndex = 0;

    segments.forEach((segment) => {
      if (segment.type === "space") {
        element.appendChild(document.createTextNode(segment.value));
        return;
      }

      const group = document.createElement("span");
      group.className = "split-word-group";
      if (segment.accent) {
        group.classList.add("split-word-group--accent");
      }

      segment.chars.forEach((char) => {
        group.appendChild(createCharUnit(char, charIndex));
        charIndex += 1;
      });

      element.appendChild(group);
    });

    return charIndex;
  }

  function initSplitText(selector, userOptions) {
    const element = typeof selector === "string" ? document.querySelector(selector) : selector;
    if (!element || element.dataset.splitDone === "true") return;

    const options = { ...defaults, ...userOptions };
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const run = () => {
      if (prefersReduced) {
        element.classList.add("split-parent", "is-ready", "is-animated");
        element.dataset.splitDone = "true";
        element.removeAttribute("data-split-pending");
        return;
      }

      buildSplitDOM(element, options);
      element.dataset.splitDone = "true";
      element.removeAttribute("data-split-pending");
      element.classList.add("is-ready");

      requestAnimationFrame(() => {
        requestAnimationFrame(() => element.classList.add("is-animated"));
      });
    };

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(run);
    } else {
      run();
    }
  }

  window.initSplitText = initSplitText;

  document.addEventListener("DOMContentLoaded", () => {
    initSplitText("#hero-title", {
      delay: 50,
      duration: 1.25,
      baseDelay: 100,
      fromY: 40,
    });
  });
})();
