(function () {
  if (!location.pathname.startsWith("/admin")) return;

  const API = "/api";
  let packagesCache = [];
  let saveTimer = null;
  let lastEnhanceAt = 0;

  function normalize(text) {
    return String(text || "")
      .trim()
      .replace(/\s+/g, " ")
      .toLowerCase();
  }

  function toast(message, error) {
    let el = document.getElementById("package-dnd-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "package-dnd-toast";
      el.style.position = "fixed";
      el.style.right = "22px";
      el.style.bottom = "82px";
      el.style.zIndex = "999999";
      el.style.padding = "12px 16px";
      el.style.borderRadius = "12px";
      el.style.fontFamily = "Inter, system-ui, sans-serif";
      el.style.fontWeight = "800";
      el.style.boxShadow = "0 15px 35px rgba(0,0,0,.22)";
      document.body.appendChild(el);
    }

    el.textContent = message;
    el.style.background = error ? "#b42318" : "#0f5f43";
    el.style.color = "#fff";
    el.style.display = "block";

    clearTimeout(el._timer);
    el._timer = setTimeout(() => {
      el.style.display = "none";
    }, 3500);
  }

  async function api(path, options) {
    const response = await fetch(API + path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options && options.headers ? options.headers : {})
      }
    });

    const text = await response.text();
    let data = null;

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (!response.ok || (data && data.error)) {
      throw new Error((data && (data.error || data.message)) || text || response.statusText);
    }

    return data;
  }

  async function loadPackages() {
    try {
      packagesCache = await api("/rest/packages?select=id,title,sort_order,updated_at&order=sort_order.asc&limit=1000");
      if (!Array.isArray(packagesCache)) packagesCache = [];
    } catch (error) {
      console.warn("Package DND load failed:", error);
      packagesCache = [];
    }
  }

  function isPackagesPage() {
    const text = document.body.innerText || "";
    return text.includes("Packages (") && text.includes("Add Package") && text.includes("Duration") && text.includes("Stock");
  }

  function getPackageTable() {
    if (!isPackagesPage()) return null;

    const tables = Array.from(document.querySelectorAll("table"));
    return tables.find(table => {
      const text = table.innerText || "";
      return text.includes("Title") && text.includes("Price") && text.includes("Duration") && text.includes("Actions");
    }) || null;
  }

  function getRows(table) {
    if (!table) return [];
    return Array.from(table.querySelectorAll("tbody tr")).filter(row => {
      const cells = row.querySelectorAll("td");
      return cells.length >= 5;
    });
  }

  function getRowTitle(row) {
    const cells = row.querySelectorAll("td");
    if (!cells.length) return "";
    const clone = cells[0].cloneNode(true);
    clone.querySelectorAll(".package-dnd-handle").forEach(x => x.remove());
    return clone.textContent.trim();
  }

  function findPackageByTitle(title) {
    const key = normalize(title);
    return packagesCache.find(p => normalize(p.title) === key) || null;
  }

  function addHeader(table) {
    const headerRow = table.querySelector("thead tr");
    if (!headerRow || headerRow.querySelector(".package-dnd-head")) return;

    const th = document.createElement("th");
    th.className = "package-dnd-head";
    th.textContent = "Move";
    th.style.width = "70px";
    th.style.color = "#5b7c72";
    th.style.fontWeight = "700";
    th.style.fontSize = "12px";
    headerRow.insertBefore(th, headerRow.firstElementChild);
  }

  function addHandle(row) {
    if (row.querySelector(".package-dnd-cell")) return;

    const td = document.createElement("td");
    td.className = "package-dnd-cell";
    td.style.width = "70px";
    td.style.textAlign = "center";

    const handle = document.createElement("span");
    handle.className = "package-dnd-handle";
    handle.textContent = "☰";
    handle.title = "Drag to reorder package";
    handle.style.cursor = "grab";
    handle.style.display = "inline-flex";
    handle.style.alignItems = "center";
    handle.style.justifyContent = "center";
    handle.style.width = "34px";
    handle.style.height = "34px";
    handle.style.borderRadius = "10px";
    handle.style.background = "#f3f6f0";
    handle.style.border = "1px solid #d9e5dc";
    handle.style.color = "#0f5f43";
    handle.style.fontWeight = "900";
    handle.style.fontSize = "18px";

    td.appendChild(handle);
    row.insertBefore(td, row.firstElementChild);
  }

  function sortDomRowsBySavedOrder(table) {
    const tbody = table.querySelector("tbody");
    if (!tbody || !packagesCache.length) return;

    const rows = getRows(table);

    rows.sort((a, b) => {
      const pa = findPackageByTitle(getRowTitle(a));
      const pb = findPackageByTitle(getRowTitle(b));
      const ao = pa && pa.sort_order !== null ? Number(pa.sort_order) : 999999;
      const bo = pb && pb.sort_order !== null ? Number(pb.sort_order) : 999999;
      return ao - bo;
    });

    rows.forEach(row => tbody.appendChild(row));
  }

  function installDnd(table) {
    addHeader(table);

    const tbody = table.querySelector("tbody");
    const rows = getRows(table);

    rows.forEach(row => {
      addHandle(row);
      row.draggable = true;
      row.style.transition = "background .15s ease, opacity .15s ease";

      row.addEventListener("dragstart", event => {
        row.classList.add("package-dnd-dragging");
        row.style.opacity = "0.55";
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", getRowTitle(row));
      });

      row.addEventListener("dragend", () => {
        row.classList.remove("package-dnd-dragging");
        row.style.opacity = "1";
        scheduleSaveOrder(table);
      });
    });

    tbody.addEventListener("dragover", event => {
      event.preventDefault();

      const dragging = table.querySelector(".package-dnd-dragging");
      if (!dragging) return;

      const after = getDragAfterElement(tbody, event.clientY);
      if (after == null) {
        tbody.appendChild(dragging);
      } else {
        tbody.insertBefore(dragging, after);
      }
    });
  }

  function getDragAfterElement(container, y) {
    const rows = [...container.querySelectorAll("tr:not(.package-dnd-dragging)")];

    return rows.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      }

      return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }

  function scheduleSaveOrder(table) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveOrder(table), 400);
  }

  async function saveOrder(table) {
    const rows = getRows(table);
    const now = Date.now();

    const updates = rows.map((row, index) => {
      const title = getRowTitle(row);
      const pkg = findPackageByTitle(title);

      if (!pkg) {
        return { title, missing: true };
      }

      return {
        id: pkg.id,
        title,
        sort_order: (index + 1) * 10,
        // This also makes order work if any old frontend code sorts by updated_at desc.
        updated_at: new Date(now - index * 1000).toISOString()
      };
    });

    const missing = updates.filter(x => x.missing);

    if (missing.length) {
      toast("Some packages could not be matched by title. Save skipped.", true);
      console.warn("Missing package title matches:", missing);
      return;
    }

    try {
      toast("Saving package order...");

      for (const item of updates) {
        await api(`/rest/packages?id=eq.${encodeURIComponent(item.id)}`, {
          method: "PATCH",
          body: JSON.stringify({
            sort_order: item.sort_order,
            updated_at: item.updated_at
          })
        });
      }

      await loadPackages();
      toast("Package order saved");
    } catch (error) {
      toast("Save failed: " + error.message, true);
    }
  }

  function injectStyle() {
    if (document.getElementById("package-dnd-style")) return;

    const style = document.createElement("style");
    style.id = "package-dnd-style";
    style.textContent = `
      .package-dnd-dragging {
        background: #eef7f2 !important;
        outline: 2px dashed #0f5f43;
      }

      .package-dnd-cell {
        user-select: none;
      }

      .package-dnd-handle:hover {
        background: #0f5f43 !important;
        color: #ffffff !important;
      }
    `;
    document.head.appendChild(style);
  }

  async function enhance() {
    if (!isPackagesPage()) return;

    const now = Date.now();
    if (now - lastEnhanceAt < 700) return;
    lastEnhanceAt = now;

    injectStyle();

    const table = getPackageTable();
    if (!table) return;

    if (!packagesCache.length) {
      await loadPackages();
    }

    sortDomRowsBySavedOrder(table);
    installDnd(table);
  }

  setInterval(enhance, 1200);

  document.addEventListener("DOMContentLoaded", enhance);
  window.addEventListener("load", function () {
    setTimeout(enhance, 500);
    setTimeout(enhance, 1500);
    setTimeout(enhance, 3000);
  });

  window.SME_PACKAGE_DND_REFRESH = async function () {
    packagesCache = [];
    await loadPackages();
    await enhance();
  };
})();
