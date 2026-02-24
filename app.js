const STORAGE_KEYS = {
  todoMonthPlans: "yky_todo_month_plans_v2",
  todoDayPlans: "yky_todo_day_plans_v2",
  todoCountdowns: "yky_todo_countdowns_v2",
  almanacConfig: "yky_almanac_cfg_v1",
  bufferHistory: "yky_buffer_history_v1",
};

const protocolData = [
  {
    name: "PCR Protocol (Thermo Fisher)",
    tags: "pcr dna amplification",
    url: "https://www.thermofisher.com/cn/zh/home/life-science/pcr.html",
  },
  {
    name: "Western Blot Protocol (Abcam)",
    tags: "western blot wb protein",
    url: "https://www.abcam.com/protocols/western-blot-protocol",
  },
  {
    name: "Immunofluorescence Protocol (CST)",
    tags: "if immunofluorescence staining",
    url: "https://www.cellsignal.com/learn-and-support/protocols/immunofluorescence-general-protocol",
  },
  {
    name: "RNA Extraction Protocol (QIAGEN)",
    tags: "rna extraction trizol",
    url: "https://www.qiagen.com/us/resources/technologies/rna",
  },
  {
    name: "Cell Culture Passaging (ATCC)",
    tags: "cell culture passaging",
    url: "https://www.atcc.org/resources/culture-guides",
  },
];

const literatureSites = [
  {
    name: "PubMed",
    base: "https://pubmed.ncbi.nlm.nih.gov/?term=",
    home: "https://pubmed.ncbi.nlm.nih.gov/",
    desc: "生物医学文献检索",
  },
  {
    name: "Google Scholar",
    base: "https://scholar.google.com/scholar?q=",
    home: "https://scholar.google.com/",
    desc: "综合学术检索",
  },
  {
    name: "bioRxiv",
    base: "https://www.biorxiv.org/search/",
    home: "https://www.biorxiv.org/",
    desc: "生命科学预印本",
  },
  {
    name: "Sci-Hub 说明页",
    base: "",
    home: "https://en.wikipedia.org/wiki/Sci-Hub",
    desc: "镜像与可用性需自行核验",
  },
];

const units = {
  mass: { g: 1, mg: 1e-3, ug: 1e-6, ng: 1e-9 },
  volume: { L: 1, mL: 1e-3, uL: 1e-6 },
  molar: { M: 1, mM: 1e-3, uM: 1e-6, nM: 1e-9 },
};

function safeLoad(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function safeSave(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function uid() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function dateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function monthKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function mountPageAnimation() {
  document.querySelectorAll(".card, .feature-card, .hero").forEach((el) => {
    el.classList.add("page-enter");
  });
}

function initTodoPlanner() {
  const calendarEl = document.getElementById("todo-calendar");
  const monthLabelEl = document.getElementById("todo-month-label");
  const prevBtn = document.getElementById("todo-prev-month");
  const nextBtn = document.getElementById("todo-next-month");
  const planPanel = document.getElementById("plan-panel");
  const planTitle = document.getElementById("plan-title");
  const planBackBtn = document.getElementById("plan-back");
  const planForm = document.getElementById("plan-form");
  const planInput = document.getElementById("plan-input");
  const planList = document.getElementById("plan-list");
  const countdownForm = document.getElementById("countdown-form");
  const countdownName = document.getElementById("countdown-name");
  const countdownTime = document.getElementById("countdown-time");
  const countdownList = document.getElementById("countdown-list");

  if (
    !calendarEl ||
    !monthLabelEl ||
    !prevBtn ||
    !nextBtn ||
    !planPanel ||
    !planTitle ||
    !planBackBtn ||
    !planForm ||
    !planInput ||
    !planList ||
    !countdownForm ||
    !countdownName ||
    !countdownTime ||
    !countdownList
  ) {
    return;
  }

  let monthPlans = safeLoad(STORAGE_KEYS.todoMonthPlans, {});
  let dayPlans = safeLoad(STORAGE_KEYS.todoDayPlans, {});
  let countdowns = safeLoad(STORAGE_KEYS.todoCountdowns, []);

  let currentMonth = new Date();
  currentMonth.setDate(1);
  let selectedDate = null;

  function saveTodoData() {
    safeSave(STORAGE_KEYS.todoMonthPlans, monthPlans);
    safeSave(STORAGE_KEYS.todoDayPlans, dayPlans);
    safeSave(STORAGE_KEYS.todoCountdowns, countdowns);
  }

  function getCurrentPlan() {
    if (selectedDate) {
      const key = dateKey(selectedDate);
      dayPlans[key] ||= [];
      return { type: "day", key, list: dayPlans[key] };
    }

    const key = monthKey(currentMonth);
    monthPlans[key] ||= [];
    return { type: "month", key, list: monthPlans[key] };
  }

  function renderPlan() {
    const current = getCurrentPlan();
    const isDay = current.type === "day";

    planPanel.classList.toggle("plan-day", isDay);
    planPanel.classList.toggle("plan-month", !isDay);
    planBackBtn.hidden = !isDay;

    if (isDay) {
      planTitle.textContent = `${current.key} 日计划`;
    } else {
      planTitle.textContent = `${current.key} 月计划`;
    }

    if (!current.list.length) {
      planList.innerHTML = `<li class="todo-item"><span class="muted">暂无计划，先添加一条。</span></li>`;
      return;
    }

    planList.innerHTML = current.list
      .map(
        (task) => `
          <li class="todo-item ${task.done ? "done" : ""}">
            <div>
              <span class="plan-tag ${isDay ? "day" : "month"}">${isDay ? "日" : "月"}</span>
              <span>${task.text}</span>
            </div>
            <div>
              <button type="button" data-toggle="${task.id}">${task.done ? "撤销" : "完成"}</button>
              <button type="button" data-remove="${task.id}">删除</button>
            </div>
          </li>
        `
      )
      .join("");
  }

  function hasDayPlan(dayDate) {
    const key = dateKey(dayDate);
    const list = dayPlans[key] || [];
    return list.length > 0;
  }

  function renderCalendar() {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    monthLabelEl.textContent = `${y} 年 ${m + 1} 月`;

    const firstDay = new Date(y, m, 1);
    const firstOffset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const today = dateKey(new Date());

    calendarEl.innerHTML = "";

    for (let i = 0; i < firstOffset; i += 1) {
      const empty = document.createElement("div");
      empty.className = "day-cell inactive";
      calendarEl.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const d = new Date(y, m, day);
      const key = dateKey(d);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "day-cell";
      if (key === today) btn.classList.add("today");
      if (selectedDate && key === dateKey(selectedDate)) btn.classList.add("selected");

      btn.innerHTML = `<span>${day}</span>${hasDayPlan(d) ? '<span class="day-dot"></span>' : ""}`;
      btn.addEventListener("click", () => {
        selectedDate = d;
        renderCalendar();
        renderPlan();
      });
      calendarEl.appendChild(btn);
    }
  }

  function formatCountdown(targetIso) {
    const now = new Date();
    const target = new Date(targetIso);
    const diff = target.getTime() - now.getTime();
    const abs = Math.abs(diff);

    const totalMinutes = Math.floor(abs / 60000);
    const days = Math.floor(totalMinutes / (60 * 24));
    const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
    const minutes = totalMinutes % 60;

    if (diff >= 0) {
      return `剩余 ${days} 天 ${hours} 小时 ${minutes} 分钟`;
    }
    return `已过 ${days} 天 ${hours} 小时 ${minutes} 分钟`;
  }

  function renderCountdowns() {
    if (!countdowns.length) {
      countdownList.innerHTML = `<p class="muted">还没有时间节点。</p>`;
      return;
    }

    countdowns.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    countdownList.innerHTML = countdowns
      .map(
        (item) =>
          `<div class="history-item"><strong>${item.name}</strong><br/><span class="muted">${new Date(item.time).toLocaleString("zh-CN")}</span><br/><span>${formatCountdown(item.time)}</span><br/><button type="button" data-remove-countdown="${item.id}">删除节点</button></div>`
      )
      .join("");
  }

  prevBtn.addEventListener("click", () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    selectedDate = null;
    renderCalendar();
    renderPlan();
  });

  nextBtn.addEventListener("click", () => {
    currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    selectedDate = null;
    renderCalendar();
    renderPlan();
  });

  planBackBtn.addEventListener("click", () => {
    selectedDate = null;
    renderCalendar();
    renderPlan();
  });

  planForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = planInput.value.trim();
    if (!text) return;

    const current = getCurrentPlan();
    current.list.push({ id: uid(), text, done: false });
    saveTodoData();
    planForm.reset();
    renderCalendar();
    renderPlan();
  });

  planList.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;

    const removeId = target.dataset.remove;
    const toggleId = target.dataset.toggle;
    if (!removeId && !toggleId) return;

    const current = getCurrentPlan();
    if (removeId) {
      const idx = current.list.findIndex((t) => t.id === removeId);
      if (idx >= 0) current.list.splice(idx, 1);
    }

    if (toggleId) {
      const task = current.list.find((t) => t.id === toggleId);
      if (task) task.done = !task.done;
    }

    saveTodoData();
    renderCalendar();
    renderPlan();
  });

  countdownForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = countdownName.value.trim();
    const time = countdownTime.value;
    if (!name || !time) return;

    countdowns.push({ id: uid(), name, time });
    saveTodoData();
    countdownForm.reset();
    renderCountdowns();
  });

  countdownList.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    const removeId = target.dataset.removeCountdown;
    if (!removeId) return;
    countdowns = countdowns.filter((item) => item.id !== removeId);
    saveTodoData();
    renderCountdowns();
  });

  renderCalendar();
  renderPlan();
  renderCountdowns();
  window.setInterval(renderCountdowns, 60000);
}

function getGanzhiDay(date) {
  const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const baseDate = new Date("1984-02-02T00:00:00+08:00");
  const dayMs = 86400000;
  const offset = Math.floor((date.getTime() - baseDate.getTime()) / dayMs);
  const idx = ((offset % 60) + 60) % 60;
  return `${stems[idx % 10]}${branches[idx % 12]}`;
}

function buildLocalAlmanac(date = new Date()) {
  const yiPool = ["投稿", "作图", "统计", "读文献", "写作", "讨论", "复盘", "整理数据"];
  const jiPool = ["临时换题", "冲动改稿", "无计划加班", "盲目返工", "分散注意", "跳步实验"];
  const ganzhi = getGanzhiDay(date);
  const seed = Math.floor(date.getTime() / 86400000);
  const yi = [yiPool[seed % yiPool.length], yiPool[(seed + 3) % yiPool.length]];
  const ji = [jiPool[seed % jiPool.length], jiPool[(seed + 2) % jiPool.length]];
  const weekBias = [6, 4, 7, 8, 7, 5, 3][date.getDay()];
  const score = Math.min(100, Math.max(0, (seed * 13 + weekBias * 9) % 101));
  const advice = score >= 65 ? "适合投稿，可推进" : "不建议直接投稿，先补实验或润稿";

  return {
    source: "本地算法",
    dateText: date.toLocaleDateString("zh-CN"),
    ganzhi,
    yi,
    ji,
    score,
    advice,
    note: "本地规则用于离线场景，若需真实黄历请切换 API。",
  };
}

function normalizeAlmanacApiData(json, date) {
  const payload = json?.result || json?.data || json;
  const yiRaw = payload?.yi || payload?.suitable || payload?.good || payload?.lunar?.yi;
  const jiRaw = payload?.ji || payload?.avoid || payload?.bad || payload?.lunar?.ji;
  const ganzhi = payload?.ganzhi || payload?.ganzhi_day || payload?.ganzhiDay || getGanzhiDay(date);

  const yi = Array.isArray(yiRaw)
    ? yiRaw
    : String(yiRaw || "投稿 复盘").split(/[,，\s]+/).filter(Boolean);
  const ji = Array.isArray(jiRaw)
    ? jiRaw
    : String(jiRaw || "冲动改稿").split(/[,，\s]+/).filter(Boolean);

  const score = Math.max(0, Math.min(100, 75 - ji.length * 8 + yi.length * 7));
  const advice = score >= 65 ? "适合投稿，可推进" : "不建议直接投稿，先补实验或润稿";

  return {
    source: "外部 API",
    dateText: payload?.date || date.toLocaleDateString("zh-CN"),
    ganzhi,
    yi,
    ji,
    score,
    advice,
    note: "外部接口数据结构已做兼容映射，字段不匹配时自动回退默认值。",
  };
}

async function fetchAlmanacFromApi(config, date) {
  if (!config.apiUrl) throw new Error("未配置 API URL");

  const endpoint = new URL(config.apiUrl);
  endpoint.searchParams.set("date", date.toISOString().slice(0, 10));

  const headers = {};
  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
    headers.apikey = config.apiKey;
  }

  const response = await fetch(endpoint.toString(), { headers });
  if (!response.ok) throw new Error(`API 请求失败: ${response.status}`);
  const data = await response.json();
  return normalizeAlmanacApiData(data, date);
}

function renderAlmanac(panel, data, fallbackReason = "") {
  const reason = fallbackReason
    ? `<p class="muted">API 不可用，已回退本地算法：${fallbackReason}</p>`
    : "";

  panel.innerHTML = `
    <p><strong>${data.dateText}</strong> · ${data.ganzhi}日 · 数据源：${data.source}</p>
    <p>宜：${data.yi.join("、")}</p>
    <p>忌：${data.ji.join("、")}</p>
    <p><strong>投稿评分：</strong>${data.score}/100</p>
    <p><strong>投稿建议：</strong>${data.advice}</p>
    <p class="muted">${data.note}</p>
    ${reason}
  `;
}

function initAlmanac() {
  const panel = document.getElementById("almanac-panel");
  const sourceEl = document.getElementById("almanac-source");
  const apiUrlEl = document.getElementById("almanac-api-url");
  const apiKeyEl = document.getElementById("almanac-api-key");
  const refreshBtn = document.getElementById("almanac-refresh");
  if (!panel || !sourceEl || !apiUrlEl || !apiKeyEl || !refreshBtn) return;

  const config = safeLoad(STORAGE_KEYS.almanacConfig, { source: "local", apiUrl: "", apiKey: "" });
  sourceEl.value = config.source;
  apiUrlEl.value = config.apiUrl;
  apiKeyEl.value = config.apiKey;

  function saveConfig() {
    safeSave(STORAGE_KEYS.almanacConfig, {
      source: sourceEl.value,
      apiUrl: apiUrlEl.value.trim(),
      apiKey: apiKeyEl.value.trim(),
    });
  }

  async function refreshAlmanac() {
    saveConfig();
    const date = new Date();

    if (sourceEl.value !== "api") {
      renderAlmanac(panel, buildLocalAlmanac(date));
      return;
    }

    panel.innerHTML = `<p class="muted">正在请求外部 API...</p>`;
    try {
      const data = await fetchAlmanacFromApi({ apiUrl: apiUrlEl.value.trim(), apiKey: apiKeyEl.value.trim() }, date);
      renderAlmanac(panel, data);
    } catch (error) {
      renderAlmanac(panel, buildLocalAlmanac(date), error.message || "未知错误");
    }
  }

  sourceEl.addEventListener("change", refreshAlmanac);
  apiUrlEl.addEventListener("change", saveConfig);
  apiKeyEl.addEventListener("change", saveConfig);
  refreshBtn.addEventListener("click", refreshAlmanac);

  refreshAlmanac();
}

function initDoseCalculator() {
  const categoryEl = document.getElementById("convert-category");
  const fromEl = document.getElementById("convert-from");
  const toEl = document.getElementById("convert-to");
  const convertBtn = document.getElementById("convert-btn");
  const convertOutput = document.getElementById("convert-output");
  const bufferForm = document.getElementById("buffer-form");
  const addSoluteBtn = document.getElementById("add-solute");
  const solutesEl = document.getElementById("solutes");
  const bufferOutput = document.getElementById("buffer-output");
  const historyEl = document.getElementById("buffer-history");

  if (
    !categoryEl ||
    !fromEl ||
    !toEl ||
    !convertBtn ||
    !convertOutput ||
    !bufferForm ||
    !addSoluteBtn ||
    !solutesEl ||
    !bufferOutput ||
    !historyEl
  ) {
    return;
  }

  let history = safeLoad(STORAGE_KEYS.bufferHistory, []);

  function renderHistory() {
    if (!history.length) {
      historyEl.innerHTML = `<p class="muted">暂无历史记录。</p>`;
      return;
    }

    historyEl.innerHTML = history
      .slice(0, 5)
      .map(
        (item) =>
          `<div class="history-item"><strong>${item.name}</strong> · ${item.volume} mL<br/><span class="muted">${item.time}</span></div>`
      )
      .join("");
  }

  function populateUnitSelects() {
    const options = Object.keys(units[categoryEl.value]);
    fromEl.innerHTML = options.map((u) => `<option value="${u}">${u}</option>`).join("");
    toEl.innerHTML = options.map((u) => `<option value="${u}">${u}</option>`).join("");
    toEl.value = options[1] || options[0];
  }

  function addSoluteRow() {
    const row = document.createElement("div");
    row.className = "solute-row";
    row.innerHTML = `
      <input type="text" placeholder="溶质名称（NaCl）" class="solute-name" required />
      <input type="number" min="0" step="any" placeholder="母液浓度" class="stock" required />
      <input type="number" min="0" step="any" placeholder="目标浓度" class="target" required />
      <button type="button" class="remove-solute">删除</button>
    `;
    solutesEl.appendChild(row);
  }

  categoryEl.addEventListener("change", populateUnitSelects);
  convertBtn.addEventListener("click", () => {
    const value = Number(document.getElementById("convert-value")?.value || 0);
    const from = fromEl.value;
    const to = toEl.value;
    const base = value * units[categoryEl.value][from];
    const converted = base / units[categoryEl.value][to];
    convertOutput.textContent = `${value} ${from} = ${converted.toPrecision(6)} ${to}`;
  });

  addSoluteBtn.addEventListener("click", addSoluteRow);

  solutesEl.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.classList.contains("remove-solute")) target.closest(".solute-row")?.remove();
  });

  bufferForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const finalVolume = Number(document.getElementById("buffer-volume")?.value || 0);
    const bufferName = (document.getElementById("buffer-name")?.value || "").trim() || "自定义 Buffer";
    const rows = [...document.querySelectorAll(".solute-row")];

    if (!rows.length) {
      bufferOutput.innerHTML = `<p class="muted">请先添加至少一个溶质。</p>`;
      return;
    }

    const lines = [];
    let totalAdd = 0;

    for (const row of rows) {
      const name = row.querySelector(".solute-name")?.value.trim() || "未命名溶质";
      const stock = Number(row.querySelector(".stock")?.value || 0);
      const target = Number(row.querySelector(".target")?.value || 0);

      if (!stock || !target || target > stock) {
        lines.push(`<li>${name}：数据不合理（目标浓度需 <= 母液浓度）</li>`);
        continue;
      }

      const volume = (target * finalVolume) / stock;
      totalAdd += volume;
      lines.push(`<li>${name}：取 <strong>${volume.toFixed(2)} mL</strong> 母液</li>`);
    }

    const water = Math.max(finalVolume - totalAdd, 0);
    bufferOutput.innerHTML = `
      <p><strong>${bufferName}</strong> 总体积 ${finalVolume} mL</p>
      <ul>${lines.join("")}</ul>
      <p>补足溶剂（如 ddH2O）：<strong>${water.toFixed(2)} mL</strong></p>
    `;

    history.unshift({ name: bufferName, volume: finalVolume, time: new Date().toLocaleString("zh-CN") });
    history = history.slice(0, 20);
    safeSave(STORAGE_KEYS.bufferHistory, history);
    renderHistory();
  });

  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabBtns.forEach((b) => b.classList.remove("active"));
      tabContents.forEach((c) => c.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(`tab-${btn.dataset.tab}`)?.classList.add("active");
    });
  });

  populateUnitSelects();
  addSoluteRow();
  renderHistory();
}

function renderProtocols(keyword = "") {
  const container = document.getElementById("protocol-results");
  if (!container) return;

  const q = keyword.toLowerCase();
  const matches = protocolData.filter((item) => `${item.name} ${item.tags}`.toLowerCase().includes(q));

  if (!matches.length) {
    container.innerHTML = `<p class="muted">未找到匹配 protocol，可尝试更短关键词。</p>`;
    return;
  }

  container.innerHTML = matches
    .map(
      (item) =>
        `<a class="link-item" target="_blank" rel="noopener noreferrer" href="${item.url}"><strong>${item.name}</strong><br/><span class="muted">${item.url}</span></a>`
    )
    .join("");
}

function initProtocolSearch() {
  const form = document.getElementById("protocol-search");
  const input = document.getElementById("protocol-keyword");
  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    renderProtocols(input.value.trim());
  });

  renderProtocols();
}

function renderLiteratureLinks(keyword = "") {
  const root = document.getElementById("literature-links");
  if (!root) return;

  const q = encodeURIComponent(keyword.trim());
  root.innerHTML = literatureSites
    .map((site) => {
      const href = keyword && site.base ? `${site.base}${q}` : site.home;
      return `<a class="link-item" target="_blank" rel="noopener noreferrer" href="${href}"><strong>${site.name}</strong><br/><span class="muted">${site.desc}</span></a>`;
    })
    .join("");
}

function initLiteratureSearch() {
  const form = document.getElementById("literature-form");
  const input = document.getElementById("literature-keyword");
  if (!form || !input) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    renderLiteratureLinks(input.value);
  });

  renderLiteratureLinks();
}

mountPageAnimation();
initTodoPlanner();
initAlmanac();
initDoseCalculator();
initProtocolSearch();
initLiteratureSearch();
