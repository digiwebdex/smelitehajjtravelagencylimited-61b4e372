(function () {
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/auth")) return;

  const API = "/api";

  const DEFAULTS = {
    hajj_packages_section: {
      titlePatterns: [/^Hajj Packages(?:\s+\d{4})?$/i],
      title: "Hajj Packages 2026",
      subtitle: "HAJJ PACKAGES",
      description: "Premium Hajj packages for the sacred pilgrimage to Makkah. Experience the journey of a lifetime with complete care and guidance.",
      badge_text: "Hotels Near Masjid al-Haram",
      stat_1_value: "100%",
      stat_1_label: "Success Rate",
      stat_2_value: "10+",
      stat_2_label: "Hajj Years Experience",
      stat_3_value: "5000+",
      stat_3_label: "Happy Pilgrims"
    },
    umrah_packages_section: {
      titlePatterns: [/^Umrah Packages$/i],
      title: "Umrah Packages",
      subtitle: "UMRAH PACKAGES",
      description: "Flexible Umrah packages throughout the year with trusted service, hotels, transport, visa processing and complete guidance.",
      badge_text: "Year-Round Umrah Journeys",
      stat_1_value: "100%",
      stat_1_label: "Service Support",
      stat_2_value: "12+",
      stat_2_label: "Years Experience",
      stat_3_value: "5000+",
      stat_3_label: "Happy Pilgrims"
    }
  };

  function clean(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function isBadParent(node) {
    const el = node && node.parentElement;
    if (!el) return true;
    return !!el.closest("script,style,textarea,input,select,option,[contenteditable='true']");
  }

  function walkText(root, callback) {
    if (!root) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (isBadParent(node)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(callback);
  }

  function findAreaByText(textOrRegex) {
    let found = null;

    walkText(document.body, function (node) {
      if (found) return;
      const text = clean(node.nodeValue).trim();

      const matched = textOrRegex instanceof RegExp
        ? textOrRegex.test(text)
        : text.includes(textOrRegex);

      if (matched) {
        const el = node.parentElement;
        found = el.closest("section") || el.closest("[class*='section' i]") || el.closest("main > div") || el.closest("div");
      }
    });

    return found;
  }

  function findPackageArea(sectionKey, section) {
    const defaults = DEFAULTS[sectionKey];

    let area = null;

    for (const pattern of defaults.titlePatterns || []) {
      area = findAreaByText(pattern);
      if (area) return area;
    }

    area = findAreaByText(defaults.title);
    if (area) return area;

    if (section && section.title) {
      area = findAreaByText(section.title);
      if (area) return area;
    }

    if (defaults.subtitle) {
      area = findAreaByText(defaults.subtitle);
      if (area) return area;
    }

    if (defaults.description) {
      area = findAreaByText(defaults.description.slice(0, 50));
      if (area) return area;
    }

    return null;
  }

  function replaceExact(area, oldValue, newValue) {
    oldValue = clean(oldValue).trim();
    newValue = clean(newValue).trim();

    if (!area || !oldValue || !newValue || oldValue === newValue) return;

    walkText(area, function (node) {
      const before = node.nodeValue;
      if (before.includes(oldValue)) {
        node.nodeValue = before.split(oldValue).join(newValue);
      }
    });
  }

  function replacePattern(area, pattern, newValue) {
    newValue = clean(newValue).trim();
    if (!area || !pattern || !newValue) return;

    walkText(area, function (node) {
      const text = clean(node.nodeValue).trim();
      if (pattern.test(text)) {
        node.nodeValue = node.nodeValue.replace(text, newValue);
      }
    });
  }

  function setImage(area, imageUrl) {
    imageUrl = clean(imageUrl).trim();
    if (!area || !imageUrl) return;

    if (!imageUrl.startsWith("/") && !imageUrl.startsWith("http")) {
      imageUrl = "/" + imageUrl.replace(/^\/+/, "");
    }

    const imgs = Array.from(area.querySelectorAll("img"));
    const target = imgs.find(img => {
      const src = img.getAttribute("src") || "";
      return src.includes("hero-hajj") || src.includes("hero-umrah") || src.includes("kaaba") || src.includes("makkah");
    }) || imgs[0];

    if (target) {
      target.src = imageUrl;
      target.srcset = "";
      target.removeAttribute("data-src");
    }
  }

  function applyPackageSection(sectionKey, section) {
    const defaults = DEFAULTS[sectionKey];
    if (!defaults || !section || section.is_active === false || section.is_visible === false) return;

    const area = findPackageArea(sectionKey, section);
    if (!area) return;

    if (section.title) {
      (defaults.titlePatterns || []).forEach(pattern => replacePattern(area, pattern, section.title));
      replaceExact(area, defaults.title, section.title);
    }

    replaceExact(area, defaults.subtitle, section.subtitle);
    replaceExact(area, defaults.description, section.description);
    replaceExact(area, defaults.badge_text, section.badge_text);
    replaceExact(area, defaults.stat_1_value, section.stat_1_value);
    replaceExact(area, defaults.stat_1_label, section.stat_1_label);
    replaceExact(area, defaults.stat_2_value, section.stat_2_value);
    replaceExact(area, defaults.stat_2_label, section.stat_2_label);
    replaceExact(area, defaults.stat_3_value, section.stat_3_value);
    replaceExact(area, defaults.stat_3_label, section.stat_3_label);

    setImage(area, section.image_url || section.background_image_url);
  }

  async function loadAndApply() {
    try {
      const res = await fetch(`${API}/rest/frontend_sections?select=*&order=sort_order.asc&limit=100`, {
        cache: "no-store"
      });

      if (!res.ok) return;

      const data = await res.json();
      if (!Array.isArray(data)) return;

      const hajj = data.find(x => x.section_key === "hajj_packages_section");
      const umrah = data.find(x => x.section_key === "umrah_packages_section");

      applyPackageSection("hajj_packages_section", hajj);
      applyPackageSection("umrah_packages_section", umrah);

      window.SME_PACKAGE_SECTION_CMS = { hajj, umrah };
    } catch (e) {
      console.warn("Package section CMS bridge failed:", e);
    }
  }

  function runRepeated() {
    loadAndApply();
    // Retry a few times as React sections hydrate — avoid aggressive polling on main thread
    setTimeout(loadAndApply, 1200);
    setTimeout(loadAndApply, 3000);
  }

  if (document.readyState === "complete") {
    runRepeated();
  } else {
    window.addEventListener("load", runRepeated, { once: true });
  }

  window.SME_APPLY_PACKAGE_SECTION_CMS = loadAndApply;
})();
