(function () {
  if (location.pathname.startsWith("/admin")) return;

  // Remove only extra leading symbols from package feature text.
  // Keep the single green check icon style from the card UI.
  const leadingSymbolRegex = /^[\s\u00a0]*(?:(?:[\u2600-\u27BF]|\p{Extended_Pictographic})\uFE0F?|\uFE0F|[❖◆◇♦◈▪▫•●○➤➢➜►▸▹✓✔✅])+[\s\u00a0]*/u;

  function looksLikePackageFeatureNode(node) {
    const parent = node && node.parentElement;
    if (!parent) return false;
    if (parent.closest("script,style,textarea,input,select,option")) return false;

    const text = String(node.nodeValue || "");
    if (!leadingSymbolRegex.test(text)) return false;

    const card = parent.closest("article,li,div");
    if (!card) return false;

    const nearby = String(card.textContent || "").toLowerCase();

    return (
      nearby.includes("book now") ||
      nearby.includes("view details") ||
      nearby.includes("hajj package") ||
      nearby.includes("umrah package") ||
      nearby.includes("return air ticket") ||
      nearby.includes("makkah") ||
      nearby.includes("madinah") ||
      nearby.includes("saudi muallem") ||
      nearby.includes("daily meals")
    );
  }

  function cleanNodeText(text) {
    let value = String(text || "");
    value = value.replace(/\uFE0F/g, "");

    for (let i = 0; i < 5; i++) {
      value = value.replace(leadingSymbolRegex, "");
    }

    value = value.replace(/\s{2,}/g, " ");
    return value.trimStart();
  }

  function normalizePackageBullets() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        return looksLikePackageFeatureNode(node)
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      const before = node.nodeValue;
      const after = cleanNodeText(before);
      if (before !== after) node.nodeValue = after;
    });
  }

  function injectStyle() {
    if (document.getElementById("package-feature-single-bullet-style")) return;

    const style = document.createElement("style");
    style.id = "package-feature-single-bullet-style";
    style.textContent = `
      /* Package cards: one consistent check icon only */
      [class*="package"] li,
      [class*="Package"] li,
      [class*="feature"] li,
      [class*="Feature"] li {
        list-style: none !important;
      }

      [class*="package"] li::marker,
      [class*="Package"] li::marker,
      [class*="feature"] li::marker,
      [class*="Feature"] li::marker {
        content: "" !important;
      }
    `;
    document.head.appendChild(style);
  }

  function run() {
    injectStyle();
    normalizePackageBullets();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }

  window.addEventListener("load", function () {
    setTimeout(run, 250);
    setTimeout(run, 800);
    setTimeout(run, 1600);
    setTimeout(run, 3000);
  });

  const root = document.getElementById("root") || document.body;

  if (window.MutationObserver && root) {
    let running = false;
    const observer = new MutationObserver(function () {
      if (running) return;
      running = true;
      requestAnimationFrame(function () {
        run();
        running = false;
      });
    });

    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true
    });

    setTimeout(function () {
      observer.disconnect();
      run();
    }, 20000);
  }

  window.SME_NORMALIZE_PACKAGE_BULLETS = run;
})();
