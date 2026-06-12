(function () {
  if (location.pathname.startsWith("/admin") || location.pathname.startsWith("/auth")) return;

  const API = "/api";
  const DEFAULTS = {
    top_contact_bar: {
      title: "Government Approved Hajj & Umrah Agency",
      phone: "+8801867666888",
      email: "info@smelitehajj.com",
      whatsapp: "+8801867666888"
    },
    main_navigation: {
      title: "S M Elite Hajj Limited",
      description: "Government Approved Hajj & Umrah Agency",
      image_url: "/company-logo.webp"
    },
    hero_section: {
      title: "Embark on Your Umrah Journey",
      description: "Perform Umrah any time of the year with our flexible packages. Experience the blessings of visiting the holy sites.",
      image_url: "/hero-kaaba.webp"
    },
    hajj_packages_section: {
      title: "Hajj Packages 2026",
      subtitle: "HAJJ PACKAGES",
      description: "Premium Hajj packages for the sacred pilgrimage to Makkah. Experience the journey of a lifetime with complete care and guidance.",
      image_url: "/images/hero-hajj-banner.webp",
      badge_text: "Hotels Near Masjid al-Haram",
      stat_1_value: "100%",
      stat_1_label: "Success Rate",
      stat_2_value: "10+",
      stat_2_label: "Hajj Years Experience",
      stat_3_value: "5000+",
      stat_3_label: "Happy Pilgrims"
    },
    umrah_packages_section: {
      title: "Umrah Packages",
      subtitle: "UMRAH PACKAGES",
      description: "Flexible Umrah packages throughout the year with trusted service, hotels, transport, visa processing and complete guidance.",
      image_url: "/images/hero-umrah-banner.webp",
      badge_text: "Year-Round Umrah Journeys",
      stat_1_value: "100%",
      stat_1_label: "Service Support",
      stat_2_value: "12+",
      stat_2_label: "Years Experience",
      stat_3_value: "5000+",
      stat_3_label: "Happy Pilgrims"
    },
    team_section: {
      title: "Management Board",
      subtitle: "فريقنا",
      description: "Our dedicated team of experienced professionals ensures your sacred journey is comfortable, safe, and spiritually fulfilling."
    },
    gallery_section: {
      title: "Gallery",
      subtitle: "GALLERY",
      description: "View moments and memories from our Hajj and Umrah journeys."
    },
    testimonials_section: {
      title: "What Our Pilgrims Say",
      subtitle: "TESTIMONIALS",
      description: "Read feedback from our valued pilgrims."
    },
    faq_section: {
      title: "Frequently Asked Questions",
      subtitle: "FAQ",
      description: "Common questions about Hajj, Umrah and visa services."
    },
    contact_section: {
      title: "Contact Us",
      subtitle: "CONTACT",
      description: "Get in touch with S M Elite Hajj Limited."
    },
    footer_section: {
      title: "S M Elite Hajj Limited",
      description: "Government Approved Hajj & Umrah Agency"
    }
  };

  function clean(value) {
    return value === null || value === undefined ? "" : String(value);
  }

  function isEditableElement(node) {
    const el = node && node.parentElement;
    if (!el) return false;
    return !!el.closest("script,style,textarea,input,select,option,[contenteditable='true']");
  }

  function replaceText(oldText, newText) {
    oldText = clean(oldText).trim();
    newText = clean(newText).trim();

    if (!oldText || !newText || oldText === newText) return;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (isEditableElement(node)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.includes(oldText)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(node => {
      node.nodeValue = node.nodeValue.split(oldText).join(newText);
    });
  }

  function textAreaFor(text) {
    const target = clean(text).trim();
    if (!target) return null;

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (isEditableElement(node)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.includes(target)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const node = walker.nextNode();
    if (!node) return null;

    const el = node.parentElement;
    if (!el) return null;

    return el.closest("section") || el.closest("main > div") || el.closest("div") || el.parentElement;
  }

  function resolveUrl(url) {
    url = clean(url).trim();
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
    return "/" + url.replace(/^\/+/, "");
  }

  function setFirstImageInArea(area, url) {
    url = resolveUrl(url);
    if (!area || !url) return;

    const img = area.querySelector("img");
    if (img) {
      img.src = url;
      img.srcset = "";
      img.removeAttribute("data-src");
      img.removeAttribute("data-original");
      return;
    }

    const bgTarget = area.querySelector("[style*='background']") || area;
    bgTarget.style.backgroundImage = `url("${url}")`;
    bgTarget.style.backgroundSize = "cover";
    bgTarget.style.backgroundPosition = "center";
  }

  function setKnownImages(section, defaults) {
    const url = section.image_url || section.background_image_url || (section.content && section.content.image_url);
    if (!url) return;

    let area = textAreaFor(defaults.title) || textAreaFor(section.title);
    if (!area && section.section_key === "hero_section") {
      area = document.querySelector("main section, main > div, [class*='hero' i]");
    }

    setFirstImageInArea(area, url);
  }

  function applyLinks(section) {
    const title = clean(section.title);
    const buttonText = clean(section.button_text);
    const buttonUrl = clean(section.button_url);

    if (!buttonText || !buttonUrl) return;

    const area = textAreaFor(title) || document.body;
    const links = Array.from(area.querySelectorAll("a,button"));

    links.forEach(el => {
      if (clean(el.textContent).trim().includes(buttonText)) {
        if (el.tagName.toLowerCase() === "a") el.setAttribute("href", buttonUrl);
      }
    });
  }

  function applyContactBar(section) {
    const content = section.content || {};
    const old = DEFAULTS.top_contact_bar;

    replaceText(old.phone, content.phone || old.phone);
    replaceText(old.email, content.email || old.email);
    replaceText(old.whatsapp, content.whatsapp || old.whatsapp);
    replaceText(old.title, content.announcement || section.title || old.title);

    if (content.phone) {
      document.querySelectorAll("a[href^='tel:']").forEach(a => a.href = "tel:" + content.phone);
    }

    if (content.email) {
      document.querySelectorAll("a[href^='mailto:']").forEach(a => a.href = "mailto:" + content.email);
    }

    if (content.whatsapp) {
      document.querySelectorAll("a[href*='wa.me'],a[href*='whatsapp']").forEach(a => {
        a.href = "https://wa.me/" + String(content.whatsapp).replace(/\D/g, "");
      });
    }
  }

  function applyNavigation(section) {
    const defaults = DEFAULTS.main_navigation;
    const content = section.content || {};

    replaceText(defaults.title, section.title || content.company_name || defaults.title);
    replaceText(defaults.description, section.description || defaults.description);

    const logo = resolveUrl(section.image_url || content.logo_url);
    if (logo) {
      document.querySelectorAll("img").forEach(img => {
        const src = img.getAttribute("src") || "";
        const alt = img.getAttribute("alt") || "";
        if (src.includes("company-logo") || alt.toLowerCase().includes("logo") || alt.toLowerCase().includes("elite")) {
          img.src = logo;
          img.srcset = "";
        }
      });
    }

    if (Array.isArray(content.menus)) {
      const currentLabels = ["Services", "Hajj Packages", "Umrah Packages", "Visa Services", "Gallery", "Contact"];
      content.menus.forEach((menu, index) => {
        if (!menu || menu.enabled === false) return;
        replaceText(currentLabels[index], menu.label || currentLabels[index]);
      });
    }
  }

  function applySection(section) {
    if (!section || section.is_active === false || section.is_visible === false) return;

    const defaults = DEFAULTS[section.section_key] || {};

    // Dynamic year/title fallback for package headings.
    if (section.section_key === "hajj_packages_section" && section.title) {
      replaceText("Hajj Packages 2026", section.title);
      replaceText("Hajj Packages 2027", section.title);
    }
    if (section.section_key === "umrah_packages_section" && section.title) {
      replaceText("Umrah Packages", section.title);
    }

    if (section.section_key === "top_contact_bar") {
      applyContactBar(section);
    }

    if (section.section_key === "main_navigation") {
      applyNavigation(section);
    }

    [
      "title",
      "subtitle",
      "description",
      "badge_text",
      "badge_subtext",
      "stat_1_value",
      "stat_1_label",
      "stat_2_value",
      "stat_2_label",
      "stat_3_value",
      "stat_3_label",
      "stat_4_value",
      "stat_4_label",
      "button_text",
      "secondary_button_text"
    ].forEach(field => {
      if (defaults[field] && section[field]) replaceText(defaults[field], section[field]);
    });

    setKnownImages(section, defaults);
    applyLinks(section);
  }

  function renderCustomSections(sections, items) {
    const custom = sections.filter(section => {
      if (!section || section.is_active === false || section.is_visible === false) return false;
      const settings = section.settings || {};
      return section.section_type === "custom" || settings.render_custom === true;
    });

    if (!custom.length) return;

    let mount = document.getElementById("cms-extra-sections");
    if (!mount) {
      mount = document.createElement("div");
      mount.id = "cms-extra-sections";
      const main = document.querySelector("main") || document.body;
      main.appendChild(mount);
    }

    mount.innerHTML = custom.map(section => {
      const sectionItems = items.filter(item => {
        return (item.section_id === section.id || item.section_key === section.section_key)
          && item.is_active !== false
          && item.is_visible !== false;
      });

      return `
        <section class="cms-custom-section" data-cms-section="${escapeHtml(section.section_key)}">
          <div class="cms-custom-wrap">
            ${section.subtitle ? `<div class="cms-custom-subtitle">${escapeHtml(section.subtitle)}</div>` : ""}
            ${section.title ? `<h2>${escapeHtml(section.title)}</h2>` : ""}
            ${section.description ? `<p class="cms-custom-desc">${escapeHtml(section.description)}</p>` : ""}
            ${section.image_url ? `<img class="cms-custom-image" src="${escapeHtml(resolveUrl(section.image_url))}" alt="${escapeHtml(section.title || section.section_name || "")}" />` : ""}
            ${sectionItems.length ? `
              <div class="cms-custom-grid">
                ${sectionItems.map(item => `
                  <article class="cms-custom-card">
                    ${item.image_url ? `<img src="${escapeHtml(resolveUrl(item.image_url))}" alt="${escapeHtml(item.title || "")}" />` : ""}
                    ${item.badge_text ? `<span>${escapeHtml(item.badge_text)}</span>` : ""}
                    ${item.title ? `<h3>${escapeHtml(item.title)}</h3>` : ""}
                    ${item.subtitle ? `<strong>${escapeHtml(item.subtitle)}</strong>` : ""}
                    ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ""}
                    ${item.button_text ? `<a href="${escapeHtml(item.button_url || item.link_url || "#")}">${escapeHtml(item.button_text)}</a>` : ""}
                  </article>
                `).join("")}
              </div>
            ` : ""}
          </div>
        </section>
      `;
    }).join("");

    injectCustomStyles();
  }

  function injectCustomStyles() {
    if (document.getElementById("cms-custom-styles")) return;

    const style = document.createElement("style");
    style.id = "cms-custom-styles";
    style.textContent = `
      .cms-custom-section {
        padding: 72px 20px;
        background: #f8f5ef;
      }
      .cms-custom-wrap {
        width: min(1180px, 100%);
        margin: 0 auto;
        text-align: center;
      }
      .cms-custom-subtitle {
        color: #d4a04f;
        font-weight: 800;
        letter-spacing: .08em;
        text-transform: uppercase;
        margin-bottom: 12px;
      }
      .cms-custom-wrap h2 {
        font-family: Georgia, serif;
        font-size: clamp(32px, 5vw, 58px);
        color: #15372d;
        margin: 0 0 14px;
      }
      .cms-custom-desc {
        color: #4d7168;
        font-size: 18px;
        max-width: 780px;
        margin: 0 auto 30px;
        line-height: 1.7;
      }
      .cms-custom-image {
        max-width: 100%;
        border-radius: 26px;
        box-shadow: 0 18px 45px rgba(0,0,0,.12);
        margin: 20px auto 32px;
      }
      .cms-custom-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit,minmax(230px,1fr));
        gap: 22px;
        text-align: left;
      }
      .cms-custom-card {
        background: #fff;
        border: 1px solid #eadfce;
        border-radius: 22px;
        padding: 22px;
        box-shadow: 0 12px 30px rgba(0,0,0,.06);
      }
      .cms-custom-card img {
        width: 100%;
        aspect-ratio: 4 / 3;
        object-fit: cover;
        border-radius: 16px;
        margin-bottom: 14px;
      }
      .cms-custom-card span {
        display: inline-flex;
        background: #fff8e8;
        color: #d4a04f;
        border-radius: 999px;
        padding: 4px 10px;
        font-weight: 800;
        font-size: 12px;
      }
      .cms-custom-card h3 {
        color: #15372d;
        margin: 12px 0 6px;
      }
      .cms-custom-card p {
        color: #4d7168;
        line-height: 1.6;
      }
      .cms-custom-card a {
        color: #0f5f43;
        font-weight: 800;
        text-decoration: none;
      }
    `;
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return clean(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function loadCms() {
    try {
      const [sectionsRes, itemsRes] = await Promise.all([
        fetch(`${API}/rest/frontend_sections?select=*&order=sort_order.asc&limit=500`, { cache: "no-store" }),
        fetch(`${API}/rest/frontend_section_items?select=*&order=sort_order.asc&limit=1000`, { cache: "no-store" })
      ]);

      if (!sectionsRes.ok || !itemsRes.ok) return;

      const sections = await sectionsRes.json();
      const items = await itemsRes.json();

      if (!Array.isArray(sections)) return;

      window.SME_FRONTEND_CMS = { sections, items };

      function applyAllCmsData() {
        try {
          sections.forEach(applySection);
          renderCustomSections(sections, Array.isArray(items) ? items : []);
          document.documentElement.setAttribute("data-cms-live", "ready");
        } catch (e) {
          console.warn("CMS apply failed:", e);
        }
      }

      window.SME_APPLY_FRONTEND_CMS = applyAllCmsData;

      applyAllCmsData();

      // React renders sections after the bridge loads, so re-apply several times.
      let applyCount = 0;
      const timer = setInterval(function () {
        applyCount += 1;
        applyAllCmsData();
        if (applyCount >= 20) clearInterval(timer);
      }, 500);

      window.addEventListener("load", function () {
        setTimeout(applyAllCmsData, 300);
        setTimeout(applyAllCmsData, 1200);
        setTimeout(applyAllCmsData, 2500);
      });

      const root = document.getElementById("root") || document.body;
      if (root && window.MutationObserver) {
        const observer = new MutationObserver(function () {
          applyAllCmsData();
        });
        observer.observe(root, { childList: true, subtree: true });
        setTimeout(function () { observer.disconnect(); }, 12000);
      }
    } catch (error) {
      console.warn("CMS live bridge failed:", error);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadCms);
  } else {
    loadCms();
  }
})();
