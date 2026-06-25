(function () {
  const DATA = window.TCSM_DATA;
  const taiwanCenter = [23.75, 121.0];
  const filters = DATA.categories;
  let activeFilter = "all";
  let searchText = "";
  let map;
  const markerLayer = L.layerGroup();
  const areaLayer = L.layerGroup();
  const markerIndex = new Map();

  const $ = (selector) => document.querySelector(selector);
  const cardGrid = $("#cardGrid");
  const filterRow = $("#filterRow");
  const detailTitle = $("#detailTitle");
  const detailContent = $("#detailContent");
  const searchInput = $("#searchInput");

  function sanitize(text) {
    return String(text ?? "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function link(url, label, className = "") {
    if (!url) return "";
    return `<a class="${className}" href="${sanitize(url)}" target="_blank" rel="noopener noreferrer">${sanitize(label)}</a>`;
  }

  function getAllItems() {
    const orgs = DATA.organizations.map((item) => ({ ...item, kind: "org" }));
    const events = DATA.events.map((item) => ({ ...item, kind: "event" }));
    return [...orgs, ...events];
  }

  function matches(item) {
    const filterOk = activeFilter === "all" || item.category === activeFilter || (activeFilter === "event" && item.kind === "event");
    const haystack = [item.name, item.englishName, item.type, item.address, item.host, item.coHost, item.demand, item.eligibility, item.time, ...(item.tags || [])]
      .join(" ")
      .toLowerCase();
    return filterOk && haystack.includes(searchText.toLowerCase().trim());
  }

  function makeIcon(kind) {
    return L.divIcon({
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30],
      html: `<div class="custom-marker ${kind === "event" ? "marker-event" : "marker-org"}"><span>${kind === "event" ? "活" : "組"}</span></div>`
    });
  }

  function setupMap() {
    map = L.map("map", { zoomControl: false, preferCanvas: true }).setView(taiwanCenter, 7);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    areaLayer.addTo(map);
    markerLayer.addTo(map);
  }

  function renderFilters() {
    filterRow.innerHTML = filters.map((filter) => `<button type="button" class="filter-chip ${filter.key === activeFilter ? "active" : ""}" data-filter="${filter.key}">${filter.label}</button>`).join("");
    filterRow.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        render();
      });
    });
  }

  function popupHtml(item) {
    return `
      <p class="popup-title">${sanitize(item.name)}</p>
      <p class="popup-meta">${sanitize(item.type)}<br>${sanitize(item.address || item.time || "")}</p>
    `;
  }

  function renderMap(items) {
    markerLayer.clearLayers();
    areaLayer.clearLayers();
    markerIndex.clear();

    items.forEach((item) => {
      if (item.kind === "event" && item.radiusMeters) {
        L.circle([item.lat, item.lng], {
          radius: item.radiusMeters,
          color: "#4dabf7",
          weight: 1.5,
          fillColor: "#4dabf7",
          fillOpacity: 0.09
        }).addTo(areaLayer);
      }

      const marker = L.marker([item.lat, item.lng], { icon: makeIcon(item.kind) })
        .bindPopup(popupHtml(item))
        .on("click", () => showDetail(item, true));
      marker.addTo(markerLayer);
      markerIndex.set(item.id, marker);
    });
  }

  function tagsHtml(item) {
    return `<div class="badges">${(item.tags || []).map((tag) => `<span class="badge ${item.kind === "event" ? "event" : ""}">${sanitize(tag)}</span>`).join("")}</div>`;
  }

  function showDetail(item, fromMap = false) {
    detailTitle.textContent = item.name;
    detailContent.innerHTML = `
      ${tagsHtml(item)}
      <dl>
        <div><dt>類型</dt><dd>${sanitize(item.type)}</dd></div>
        <div><dt>${item.kind === "event" ? "活動位置／範圍" : "公開地址"}</dt><dd>${sanitize(item.address)}</dd></div>
        <div><dt>主辦方</dt><dd>${sanitize(item.host)}</dd></div>
        <div><dt>協辦方</dt><dd>${sanitize(item.coHost || "依主辦方公告")}</dd></div>
        <div><dt>訴求／主題</dt><dd>${sanitize(item.demand)}</dd></div>
        ${item.time ? `<div><dt>預計活動時間</dt><dd>${sanitize(item.time)}</dd></div>` : ""}
        <div><dt>參加資格</dt><dd>${sanitize(item.eligibility)}</dd></div>
        <div><dt>更新狀態</dt><dd>${sanitize(item.freshness)}</dd></div>
        <div><dt>資料來源</dt><dd>${sanitize(item.sourceLabel)}</dd></div>
      </dl>
      <div class="detail-actions">
        ${link(item.officialUrl, "官方來源")}
        ${link(item.signupUrl, "報名／活動連結", "secondary")}
        ${link(item.mapUrl, "開 Google Maps", "secondary")}
      </div>
    `;

    if (!fromMap && markerIndex.has(item.id)) {
      const marker = markerIndex.get(item.id);
      map.setView(marker.getLatLng(), item.kind === "event" ? 15 : 16, { animate: true });
      marker.openPopup();
      document.getElementById("map-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderCards(items) {
    if (!items.length) {
      cardGrid.innerHTML = `<article class="data-card"><h3>查無資料</h3><p>換個關鍵字試試，例如「台北」「制憲」「青年」「台灣基進」。</p></article>`;
      return;
    }

    cardGrid.innerHTML = items.map((item) => `
      <article class="data-card" data-id="${sanitize(item.id)}" tabindex="0" role="button" aria-label="定位 ${sanitize(item.name)}">
        <div class="card-meta"><span>${item.kind === "event" ? "公開活動" : "公開組織"}</span><span>${sanitize(item.type)}</span></div>
        <h3>${sanitize(item.name)}</h3>
        <p>${sanitize(item.address)}</p>
        <p>${sanitize(item.demand)}</p>
      </article>
    `).join("");

    cardGrid.querySelectorAll(".data-card").forEach((card) => {
      const activate = () => {
        const item = getAllItems().find((entry) => entry.id === card.dataset.id);
        if (item) showDetail(item);
      };
      card.addEventListener("click", activate);
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  }

  function renderSources() {
    const sourceLinks = $("#sourceLinks");
    sourceLinks.innerHTML = DATA.sources.map((source) => link(source.url, source.title)).join("");
  }

  function render() {
    renderFilters();
    const items = getAllItems().filter(matches);
    renderMap(items);
    renderCards(items);
  }

  function setupEvents() {
    searchInput.addEventListener("input", (event) => {
      searchText = event.target.value;
      render();
    });
    $("#focusTaiwan").addEventListener("click", () => {
      map.setView(taiwanCenter, 7, { animate: true });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    setupMap();
    setupEvents();
    renderSources();
    render();
  });
})();
