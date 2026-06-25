(function () {
  const DATA = window.TCSM_DATA || { categories: [], organizations: [], events: [], sources: [] };
  const taiwanCenter = [23.75, 121.0];
  const markerIndex = new Map();
  const storageKey = "tcsm-lang";
  let activeFilter = "all";
  let searchText = "";
  let currentLang = localStorage.getItem(storageKey) || "zh";
  let map = null;
  let markerLayer = null;
  let areaLayer = null;
  let mapReady = false;
  let currentItems = [];
  let selectedItemId = null;

  const $ = (selector) => document.querySelector(selector);
  const cardGrid = $("#cardGrid");
  const filterRow = $("#filterRow");
  const detailTitle = $("#detailTitle");
  const detailContent = $("#detailContent");
  const searchInput = $("#searchInput");
  const langToggle = $("#langToggle");
  const focusTaiwan = $("#focusTaiwan");

  const i18n = {
    zh: {
      brandTitle: "台灣公民與主權地圖",
      navMap: "地圖",
      navList: "資料卡",
      navSources: "查證來源",
      navUpdate: "更新方式",
      heroEyebrow: "公開資料・守法參與・快速查證",
      heroTitle: "用一張地圖，看懂台灣民主、主權、公民倡議的公開資訊。",
      heroText: "這裡整理可公開查證的政黨、協會、基金會、活動入口與新聞來源。重點是讓獨派朋友、中立讀者、守法公民與年輕人都能快速理解：誰在辦、在哪裡、怎麼查、參與前要注意什麼。",
      heroPrimary: "開始看地圖",
      heroSecondary: "地圖回台灣",
      trustTitle: "查得到、看得懂、守得住界線",
      trustText: "只整理公開來源，不放私人住址、不公開聚會、不做個人追蹤。活動狀態會依日期自動整理，已結束活動不顯示，避免資訊過期。",
      pill1: "公開可查",
      pill2: "守法安全",
      pill3: "手機友善",
      pill4: "資訊不迷路",
      searchLabel: "搜尋組織、地址、活動、主題",
      searchPlaceholder: "例如：制憲、青年、台北、g0v、活動通",
      legendOrg: "公開組織",
      legendEvent: "活動／入口",
      legendArea: "活動範圍",
      detailEyebrow: "點一下，看重點",
      detailTitle: "點地圖上的標記看詳細資訊",
      detailText: "你可以看到公開地址、活動範圍、主辦方、協辦方、主題、日期、參加資格與查證連結。出發前請再看一次官方公告，才不會白跑。",
      cardsEyebrow: "分類切換，資訊不塞車",
      cardsTitle: "公開資料卡",
      cardsText: "資料量增加時，請用上方分類與搜尋快速切換；地圖只顯示目前篩選結果，手機瀏覽也能保持順。",
      sourceTitle: "可查證來源清單",
      sourceText: "資料優先參考政府登記、政黨官網、組織官網、公開活動頁、公開新聞與事實查核平台。社群貼文可當線索，正式地址與活動細節仍以官方公告為準。",
      boundaryTitle: "活動狀態怎麼判斷？",
      boundaryText: "已結束活動會自動隱藏；尚未開始、籌備中或報名中的活動，會跟公開活動一起顯示。若只有入口頁，會標成「活動入口」，不假裝成單一場次。",
      maintainEyebrow: "給維護者",
      maintainTitle: "每筆資料都要能回到公開來源",
      maintainText: "新增資料時，請同時放入名稱、公開位置或活動範圍、主辦方、協辦方、開始日期、結束日期、參加資格、查證連結與更新狀態。地址不確定就先標成待覆核，不要硬放精準點。",
      step1: "先確認來源是否公開、合法、可追溯。",
      step2: "再確認地點是否為公開地址或公開活動範圍。",
      step3: "活動結束後，請填入結束日期；網站會自動不顯示。",
      footerText: "台灣公民與主權地圖｜公開資料整理，不追蹤私人行程。",
      noResultTitle: "查無資料",
      noResultText: "換個關鍵字試試，例如「台北」「制憲」「青年」「活動通」。",
      kindOrg: "公開組織",
      kindEvent: "公開活動",
      type: "類型",
      place: "公開位置／活動範圍",
      host: "主辦方",
      coHost: "協辦方",
      topic: "主題／訴求",
      time: "時間",
      startDate: "開始日期",
      endDate: "結束日期",
      eligibility: "參加資格",
      status: "狀態",
      quality: "定位精準度",
      source: "資料來源",
      updated: "更新狀態",
      official: "官方來源",
      signup: "活動／報名連結",
      maps: "開 Google Maps",
      orgMarker: "組",
      eventMarker: "活",
      statusActive: "進行中",
      statusUpcoming: "即將開始",
      statusPlanning: "籌備中",
      statusPortal: "活動入口",
      statusOrg: "公開資料"
    },
    en: {
      brandTitle: "Taiwan Civic & Sovereignty Map",
      navMap: "Map",
      navList: "Cards",
      navSources: "Sources",
      navUpdate: "Updates",
      heroEyebrow: "Public data · lawful civic action · fast fact-checking",
      heroTitle: "A map for public civic, democracy, and Taiwan sovereignty information.",
      heroText: "This site organizes public, checkable sources: parties, associations, foundations, activity portals, and news references. It helps civic-minded readers, neutral visitors, law-abiding citizens, and young people understand who hosts an event, where it happens, how to verify it, and what to check before joining.",
      heroPrimary: "Open the map",
      heroSecondary: "Back to Taiwan",
      trustTitle: "Clear, verifiable, and privacy-aware",
      trustText: "Only public sources are listed. No private addresses, no private gatherings, no personal tracking. Ended events are automatically hidden to reduce outdated information.",
      pill1: "Public sources",
      pill2: "Lawful & safe",
      pill3: "Mobile first",
      pill4: "Easy to verify",
      searchLabel: "Search groups, places, events, topics",
      searchPlaceholder: "Try: constitution, youth, Taipei, g0v, Accupass",
      legendOrg: "Public group",
      legendEvent: "Event / portal",
      legendArea: "Event area",
      detailEyebrow: "Tap for context",
      detailTitle: "Tap a marker for details",
      detailText: "You can review public locations, activity areas, hosts, co-hosts, topics, dates, eligibility, and verification links. Please check the official announcement before going.",
      cardsEyebrow: "Filters keep it fast",
      cardsTitle: "Public data cards",
      cardsText: "As the dataset grows, use categories and search to switch quickly. The map only renders the current results so mobile browsing stays smooth.",
      sourceTitle: "Verification sources",
      sourceText: "Priority sources include government registrations, party websites, organization websites, public event pages, public news, and fact-checking platforms. Social posts can be clues, but official details should be verified through formal sources.",
      boundaryTitle: "How are event statuses handled?",
      boundaryText: "Ended events are hidden. Upcoming, planned, and open-registration events remain visible with public activity results. Portal pages are clearly marked as event portals, not single events.",
      maintainEyebrow: "For maintainers",
      maintainTitle: "Every item should trace back to a public source",
      maintainText: "When adding data, include the name, public location or activity area, host, co-host, start date, end date, eligibility, verification link, and update status. If a location is uncertain, mark it for review instead of showing a precise point.",
      step1: "Confirm the source is public, lawful, and traceable.",
      step2: "Confirm the place is a public address or public activity area.",
      step3: "After an event ends, add the end date; the site will hide it automatically.",
      footerText: "Taiwan Civic & Sovereignty Map | Public information only. No private tracking.",
      noResultTitle: "No results",
      noResultText: "Try another keyword, such as Taipei, constitution, youth, or Accupass.",
      kindOrg: "Public group",
      kindEvent: "Public event",
      type: "Type",
      place: "Public place / activity area",
      host: "Host",
      coHost: "Co-host",
      topic: "Topic",
      time: "Time",
      startDate: "Start date",
      endDate: "End date",
      eligibility: "Eligibility",
      status: "Status",
      quality: "Location quality",
      source: "Source",
      updated: "Update note",
      official: "Official source",
      signup: "Event / signup link",
      maps: "Open Google Maps",
      orgMarker: "G",
      eventMarker: "E",
      statusActive: "Active",
      statusUpcoming: "Upcoming",
      statusPlanning: "Planning",
      statusPortal: "Portal",
      statusOrg: "Public info"
    }
  };

  function t(key) {
    return i18n[currentLang][key] || i18n.zh[key] || key;
  }

  function sanitize(text) {
    return String(text ?? "").replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    }[char]));
  }

  function link(url, label, className = "") {
    if (!url) return "";
    return `<a class="${className}" href="${sanitize(url)}" target="_blank" rel="noopener noreferrer">${sanitize(label)}</a>`;
  }

  function text(item, field) {
    if (currentLang === "en" && item.en && item.en[field]) return item.en[field];
    return item[field] || "";
  }

  function dateOnly(value) {
    if (!value) return null;
    const date = new Date(`${value}T00:00:00+08:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function todayTaipei() {
    const now = new Date();
    return new Date(new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Taipei",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).format(now) + "T00:00:00+08:00");
  }

  function eventHasEnded(item) {
    if (item.status === "ended") return true;
    const end = dateOnly(item.endDate);
    return !!end && end < todayTaipei();
  }

  function getAllItems() {
    const orgs = (DATA.organizations || []).map((item) => ({ ...item, kind: "org" }));
    const events = (DATA.events || [])
      .filter((item) => !eventHasEnded(item))
      .map((item) => ({ ...item, kind: "event" }));
    return [...orgs, ...events];
  }

  function statusKey(item) {
    if (item.kind === "org") return "statusOrg";
    if (item.status === "active") return "statusActive";
    if (item.status === "planning") return "statusPlanning";
    if (item.status === "portal") return "statusPortal";
    return "statusUpcoming";
  }

  function statusClass(item) {
    if (item.kind === "org") return "status-portal";
    if (item.status === "active") return "status-active";
    if (item.status === "planning") return "status-planning";
    if (item.status === "portal") return "status-portal";
    return "status-upcoming";
  }

  function matches(item) {
    const filterOk = activeFilter === "all" || item.category === activeFilter || (activeFilter === "event" && item.kind === "event");
    const haystack = [
      item.name, item.englishName, item.type, item.address, item.host, item.coHost, item.demand, item.eligibility, item.time,
      ...(item.tags || []),
      ...(item.en ? Object.values(item.en) : [])
    ].join(" ").toLowerCase();
    return filterOk && haystack.includes(searchText.toLowerCase().trim());
  }

  function enableMapFallback() {
    mapReady = false;
    if (typeof window.TCSM_ENABLE_MAP_FALLBACK === "function") window.TCSM_ENABLE_MAP_FALLBACK();
  }

  function makeIcon(kind) {
    if (!window.L) return null;
    return L.divIcon({
      className: "",
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -30],
      html: `<div class="custom-marker ${kind === "event" ? "marker-event" : "marker-org"}"><span>${kind === "event" ? t("eventMarker") : t("orgMarker")}</span></div>`
    });
  }

  function setupMap() {
    if (!window.L) {
      enableMapFallback();
      return;
    }

    try {
      map = L.map("map", { zoomControl: false, preferCanvas: true }).setView(taiwanCenter, 7);
      L.control.zoom({ position: "bottomright" }).addTo(map);
      const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });
      tiles.on("tileerror", enableMapFallback);
      tiles.addTo(map);
      markerLayer = L.layerGroup().addTo(map);
      areaLayer = L.layerGroup().addTo(map);
      mapReady = true;
    } catch (error) {
      enableMapFallback();
    }
  }

  function renderStaticText() {
    document.documentElement.lang = currentLang === "zh" ? "zh-Hant-TW" : "en";
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.textContent = t(node.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
      node.setAttribute("placeholder", t(node.dataset.i18nPlaceholder));
    });
    if (langToggle) langToggle.textContent = currentLang === "zh" ? "EN" : "中";
    if (typeof window.TCSM_ENABLE_MAP_FALLBACK === "function" && document.body.classList.contains("map-fallback-mode")) window.TCSM_ENABLE_MAP_FALLBACK();
  }

  function renderFilters() {
    if (!filterRow) return;
    filterRow.innerHTML = (DATA.categories || []).map((filter) => {
      const label = currentLang === "en" ? filter.labelEn : filter.label;
      return `<button type="button" class="filter-chip ${filter.key === activeFilter ? "active" : ""}" data-filter="${sanitize(filter.key)}">${sanitize(label)}</button>`;
    }).join("");
    filterRow.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        render();
      });
    });
  }

  function popupHtml(item) {
    return `
      <p class="popup-title">${sanitize(text(item, "name"))}</p>
      <p class="popup-meta">${sanitize(text(item, "type"))}<br>${sanitize(text(item, "address") || text(item, "time"))}</p>
    `;
  }

  function renderMap(items) {
    if (!mapReady || !markerLayer || !areaLayer || !window.L) return;
    markerLayer.clearLayers();
    areaLayer.clearLayers();
    markerIndex.clear();

    items.forEach((item) => {
      if (typeof item.lat !== "number" || typeof item.lng !== "number") return;
      if (item.kind === "event" && item.radiusMeters) {
        L.circle([item.lat, item.lng], {
          radius: item.radiusMeters,
          weight: 1.5,
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
    return `<div class="badges"><span class="status-pill ${statusClass(item)}">${sanitize(t(statusKey(item)))}</span>${(item.tags || []).map((tag) => `<span class="badge ${item.kind === "event" ? "event" : ""}">${sanitize(tag)}</span>`).join("")}</div>`;
  }

  function row(label, value) {
    if (!value) return "";
    return `<div><dt>${sanitize(label)}</dt><dd>${sanitize(value)}</dd></div>`;
  }

  function showDetail(item, fromMap = false) {
    selectedItemId = item.id;
    detailTitle.textContent = text(item, "name");
    detailContent.innerHTML = `
      ${tagsHtml(item)}
      <dl>
        ${row(t("type"), text(item, "type"))}
        ${row(t("place"), text(item, "address"))}
        ${row(t("host"), text(item, "host"))}
        ${row(t("coHost"), text(item, "coHost") || (currentLang === "en" ? "See official announcement" : "依主辦方公告"))}
        ${row(t("topic"), text(item, "demand"))}
        ${row(t("time"), text(item, "time"))}
        ${row(t("startDate"), item.startDate)}
        ${row(t("endDate"), item.endDate)}
        ${row(t("eligibility"), text(item, "eligibility"))}
        ${row(t("status"), t(statusKey(item)))}
        ${row(t("quality"), text(item, "locationQuality"))}
        ${row(t("source"), text(item, "sourceLabel"))}
        ${row(t("updated"), text(item, "freshness"))}
      </dl>
      <div class="detail-actions">
        ${link(item.officialUrl, t("official"))}
        ${link(item.signupUrl, t("signup"), "secondary")}
        ${link(item.mapUrl, t("maps"), "secondary")}
      </div>
    `;

    if (!fromMap && mapReady && markerIndex.has(item.id)) {
      const marker = markerIndex.get(item.id);
      map.setView(marker.getLatLng(), item.kind === "event" ? 15 : 16, { animate: true });
      marker.openPopup();
      document.getElementById("map-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (!fromMap) {
      document.getElementById("map-panel").scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function renderCards(items) {
    if (!cardGrid) return;
    if (!items.length) {
      cardGrid.innerHTML = `<article class="data-card"><h3>${sanitize(t("noResultTitle"))}</h3><p>${sanitize(t("noResultText"))}</p></article>`;
      return;
    }

    cardGrid.innerHTML = items.map((item) => `
      <article class="data-card" data-id="${sanitize(item.id)}" tabindex="0" role="button" aria-label="${sanitize(text(item, "name"))}">
        <div class="card-meta"><span>${item.kind === "event" ? sanitize(t("kindEvent")) : sanitize(t("kindOrg"))}</span><span>${sanitize(text(item, "type"))}</span></div>
        <h3>${sanitize(text(item, "name"))}</h3>
        <p><span class="status-pill ${statusClass(item)}">${sanitize(t(statusKey(item)))}</span></p>
        <p>${sanitize(text(item, "address"))}</p>
        <p>${sanitize(text(item, "demand"))}</p>
      </article>
    `).join("");

    cardGrid.querySelectorAll(".data-card").forEach((card) => {
      const activate = () => {
        const item = currentItems.find((entry) => entry.id === card.dataset.id);
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
    if (!sourceLinks) return;
    sourceLinks.innerHTML = (DATA.sources || []).map((source) => link(source.url, currentLang === "en" && source.titleEn ? source.titleEn : source.title)).join("");
  }

  function render() {
    renderStaticText();
    renderFilters();
    currentItems = getAllItems().filter(matches);
    renderMap(currentItems);
    renderCards(currentItems);
    renderSources();
    if (selectedItemId) {
      const selected = currentItems.find((item) => item.id === selectedItemId);
      if (selected) showDetail(selected, true);
    }
  }

  function setupEvents() {
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        searchText = event.target.value;
        render();
      });
    }
    if (focusTaiwan) {
      focusTaiwan.addEventListener("click", () => {
        if (mapReady && map) map.setView(taiwanCenter, 7, { animate: true });
        else enableMapFallback();
      });
    }
    if (langToggle) {
      langToggle.addEventListener("click", () => {
        currentLang = currentLang === "zh" ? "en" : "zh";
        localStorage.setItem(storageKey, currentLang);
        render();
      });
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    setupMap();
    setupEvents();
    render();
  });
})();
