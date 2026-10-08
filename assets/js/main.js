/* =====================================================================
   main.js: renders the content from data.js (or the Google Sheet)
   and adds all interactions. You normally don't need to edit this file.
   ===================================================================== */

/*=============== HELPERS ===============*/
// Sheet text could be edited by anyone with access, so escape it before
// putting it into HTML, and only allow http(s) / mailto / relative links.
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const safeUrl = (u) => {
  const url = String(u ?? "").trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url)) return url; // relative path like assets/img/x.png
  return "";
};
const boldify = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const splitList = (s) => String(s ?? "").split(/[,;]/).map((x) => x.trim()).filter(Boolean);
const isVisible = (row) => String(row.visible ?? "yes").trim().toLowerCase() !== "no";
const pad = (n) => String(n).padStart(2, "0");
const $ = (sel) => document.querySelector(sel);
// Icons come from the SVG sprite at the top of index.html
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#ri-${name}"></use></svg>`;
// "github.com/user" or "www.linkedin.com/in/x" typed without https:// -> add it
const normalizeLink = (u) => {
  const url = String(u ?? "").trim();
  return /^(www\.|[a-z0-9-]+\.(com|in|io|dev|me|org|net|app|co)(\/|$))/i.test(url) ? "https://" + url : url;
};

/*=============== GOOGLE SHEET LOADER ===============*/
// Small CSV parser: handles quotes, commas and line breaks inside cells.
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// First row = column names. "Stack (comma separated)" becomes "stack".
function csvToObjects(text) {
  const [head = [], ...body] = parseCSV(text);
  const keys = head.map((h) => h.split("(")[0].trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}

// Each tab must have these columns, otherwise we ignore it and use defaults.
// (Google returns the FIRST tab when a tab name is wrong, so this check matters.)
const REQUIRED = {
  Profile: ["key", "value"],
  Projects: ["title", "stack"],
  Experience: ["type", "title"],
  Services: ["title", "items"],
  Testimonials: ["name", "text"],
};

async function loadTab(sheetId, tab) {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`${tab}: HTTP ${res.status}`);
  const rows = csvToObjects(await res.text());
  const cols = rows.length ? Object.keys(rows[0]) : [];
  if (!REQUIRED[tab].every((c) => cols.includes(c))) throw new Error(`${tab}: missing columns`);
  return rows;
}

async function loadFromSheet(defaults) {
  const match = String(typeof SHEET_URL === "string" ? SHEET_URL : "").match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) return null;
  const id = match[1];
  const tabs = ["Profile", "Projects", "Experience", "Services", "Testimonials"];
  const results = await Promise.allSettled(tabs.map((t) => loadTab(id, t)));
  const data = structuredClone(defaults);
  results.forEach((r, i) => {
    const tab = tabs[i];
    if (r.status === "rejected") { console.warn("Sheet tab skipped:", r.reason.message); return; }
    if (tab === "Profile") {
      r.value.forEach(({ key, value }) => { if (key) data.profile[key.trim()] = value; });
    } else {
      data[tab.toLowerCase()] = r.value;
    }
  });
  return data;
}

/*=============== RENDER: PROFILE ===============*/
function setLink(id, url) {
  const el = document.getElementById(id);
  if (!el) return;
  const safe = safeUrl(normalizeLink(url));
  el.hidden = !safe;
  if (safe) el.href = safe;
}

function splitChars(el) {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  el.innerHTML = [...text]
    .map((ch, i) => `<span class="char" aria-hidden="true" style="--i:${i}">${ch === " " ? "&nbsp;" : esc(ch)}</span>`)
    .join("");
}

function renderProfile(p) {
  document.querySelectorAll("[data-profile]").forEach((el) => {
    const value = p[el.dataset.profile];
    if (value) el.textContent = value;
  });
  document.querySelectorAll(".split-text").forEach(splitChars);
  $("#about-text").innerHTML = boldify(p.about_text);

  const mail = p.email ? `mailto:${p.email}` : "";
  setLink("social-linkedin", p.linkedin);
  setLink("social-github", p.github);
  setLink("social-email", mail);
  setLink("contact-linkedin", p.linkedin);
  setLink("contact-github", p.github);
  setLink("contact-mail", mail);
  setLink("contact-whatsapp", p.whatsapp);

  const resume = safeUrl(p.resume);
  document.querySelectorAll(".resume-link").forEach((a) => {
    a.hidden = !resume;
    if (resume) a.href = resume;
  });
}

/*=============== RENDER: PROJECTS ===============*/
function renderProjects(projects) {
  const list = projects.filter(isVisible);
  $("#projects-track").innerHTML = list
    .map((p, i) => {
      const done = String(p.status).trim().toLowerCase().startsWith("complete");
      const img = safeUrl(p.image);
      const link = safeUrl(normalizeLink(p.link));
      const media = img
        ? `<img src="${esc(img)}" alt="Screenshot of ${esc(p.title)}" class="projects__img" loading="lazy" />`
        : `<div class="projects__placeholder">${icon("cloud-line")}<span>Screenshot coming soon</span></div>`;
      return `
      <article class="projects__card">
        <div class="blob"></div>
        <div class="projects__number">
          <h1>${pad(i + 1)}</h1>
          <h3>${esc(p.category || "Project")}</h3>
        </div>
        <div class="projects__data">
          <h1 class="projects__title">${esc(p.title)}</h1>
          <p class="projects__subtitle">Techstack used</p>
          <p class="projects__description">${esc(splitList(p.stack).join(", "))}</p>
          ${p.status ? `<span class="projects__status ${done ? "done" : ""}">${done ? "Completed" : esc(p.status)}</span>` : ""}
        </div>
        <div class="projects__image">
          ${media}
          ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener" class="projects__button" aria-label="Open ${esc(p.title)}">${icon("arrow-right-up-line")}</a>` : ""}
        </div>
      </article>`;
    })
    .join("");

  $("#projects-dots").innerHTML = list
    .map((_, i) => `<button class="projects__dot${i === 0 ? " active" : ""}" data-index="${i}" aria-label="Go to project ${i + 1}"></button>`)
    .join("");
  updateDots();
}

/*=============== RENDER: EXPERIENCE / EDUCATION ===============*/
function workCard(w) {
  return `
    <div class="work__card">
      <div class="work__data">
        <div>
          <h1 class="work__title">${esc(w.title)}</h1>
          <h3 class="work__subtitle">${esc(w.organization)}</h3>
        </div>
        <h2 class="work__year">${esc(w.period)}</h2>
      </div>
      <p class="work__description">${esc(w.description)}</p>
    </div>`;
}

function renderWork(rows) {
  const visible = rows.filter(isVisible);
  const isEdu = (w) => String(w.type).trim().toLowerCase().startsWith("edu");
  $("#experience").innerHTML = visible.filter((w) => !isEdu(w)).map(workCard).join("");
  $("#education").innerHTML = visible.filter(isEdu).map(workCard).join("");
}

/*=============== RENDER: SERVICES ===============*/
function renderServices(rows) {
  $("#services-container").innerHTML = rows
    .filter(isVisible)
    .map(
      (s) => `
      <div class="services__card services__close">
        <div class="blob"></div>
        <div class="services__data">
          <h2 class="services__title">${esc(s.title)}</h2>
          <p class="services__description">${esc(s.description)}</p>
        </div>
        <div class="services__info">
          <h3 class="services__subtitle">${esc(s.subtitle || "Skills")}</h3>
          <ul class="services__skills">
            ${splitList(s.items).map((x) => `<li class="services__skill">${esc(x)}</li>`).join("")}
          </ul>
        </div>
        <button class="services__button" aria-label="Show ${esc(s.title)} skills" aria-expanded="false">
          ${icon("arrow-down-s-line")}
        </button>
      </div>`
    )
    .join("");
}

/*=============== RENDER: TESTIMONIALS ===============*/
function renderTestimonials(rows) {
  const list = rows.filter((t) => isVisible(t) && String(t.text ?? "").trim());
  $("#testimonials").hidden = list.length === 0;
  if (!list.length) return;

  const card = (t) => {
    const img = safeUrl(t.image);
    const rating = Math.max(0, Math.min(5, Math.round(Number(t.rating) || 0)));
    const stars = rating ? `<div class="testimonials__rating">${icon("star-fill").repeat(rating)}</div>` : "";
    const photo = img
      ? `<img src="${esc(img)}" alt="${esc(t.name)}" class="testimonials__img" loading="lazy" />`
      : `<div class="testimonials__avatar">${esc(String(t.name).trim().charAt(0).toUpperCase())}</div>`;
    return `
      <article class="testimonials__card">
        <div class="blob"></div>
        <div class="testimonials__data">
          ${photo}
          <h2 class="testimonials__name">${esc(t.name)}</h2>
          <p class="testimonials__role">${esc(t.role)}</p>
          ${stars}
          <p>${esc(t.text)}</p>
        </div>
      </article>`;
  };
  // The cards are written twice so the strip can loop without a gap.
  const html = list.map(card).join("");
  $("#testimonials-track").innerHTML = html + html;
}

/*=============== RENDER ALL ===============*/
function renderAll(data) {
  renderProfile(data.profile);
  renderProjects(data.projects);
  renderWork(data.experience);
  renderServices(data.services);
  renderTestimonials(data.testimonials);
  setupReveal();
}

/*=============== PROJECTS CAROUSEL (autoplay + dots) ===============*/
const track = $("#projects-track");
let carouselPaused = false;

const cardStep = () => {
  const card = track.querySelector(".projects__card");
  if (!card) return 0;
  return card.offsetWidth + parseFloat(getComputedStyle(track).columnGap || 24);
};

// Hide the dots when all cards already fit on screen
function updateDots() {
  const t = $("#projects-track");
  $("#projects-dots").hidden = t.scrollWidth <= t.clientWidth + 5;
}
window.addEventListener("resize", updateDots);

track.addEventListener("scroll", () => {
  const step = cardStep();
  if (!step) return;
  const dots = document.querySelectorAll(".projects__dot");
  const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 5;
  // the last card can't scroll fully to the left edge, so "at the end" = last dot
  const index = atEnd ? dots.length - 1 : Math.round(track.scrollLeft / step);
  dots.forEach((d, i) => d.classList.toggle("active", i === index));
});

$("#projects-dots").addEventListener("click", (e) => {
  const dot = e.target.closest(".projects__dot");
  if (dot) track.scrollTo({ left: Number(dot.dataset.index) * cardStep() });
});

["mouseenter", "touchstart", "focusin"].forEach((ev) => track.addEventListener(ev, () => (carouselPaused = true), { passive: true }));
["mouseleave", "touchend", "focusout"].forEach((ev) => track.addEventListener(ev, () => (carouselPaused = false), { passive: true }));

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
setInterval(() => {
  if (carouselPaused || document.hidden || reduceMotion.matches) return;
  const max = track.scrollWidth - track.clientWidth;
  if (max <= 0) return;
  const next = track.scrollLeft + cardStep();
  track.scrollTo({ left: next > max + 5 ? 0 : next });
}, 3500);

/*=============== WORK TABS ===============*/
document.querySelectorAll("[data-target]").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll("[data-content]").forEach((c) => c.classList.remove("work-active"));
    document.querySelectorAll("[data-target]").forEach((t) => t.classList.remove("work-active"));
    tab.classList.add("work-active");
    $(tab.dataset.target).classList.add("work-active");
  });
});

/*=============== SERVICES ACCORDION ===============*/
// One click listener on the container works even after cards are re-rendered.
$("#services-container").addEventListener("click", (e) => {
  const card = e.target.closest(".services__card");
  // Clicks on the skill chips should not close the card
  if (!card || (e.target.closest(".services__info") && !e.target.closest(".services__button"))) return;
  const wasOpen = card.classList.contains("services__open");

  document.querySelectorAll(".services__open").forEach((c) => setServiceOpen(c, false));
  if (!wasOpen) setServiceOpen(card, true);
});

function setServiceOpen(card, open) {
  const info = card.querySelector(".services__info");
  info.style.height = info.scrollHeight + "px"; // start from a real pixel height ("auto" can't animate)
  info.offsetHeight; // force the browser to apply it before changing again
  card.classList.toggle("services__open", open);
  card.classList.toggle("services__close", !open);
  info.style.height = open ? info.scrollHeight + "px" : "0px";
  card.querySelector(".services__button").setAttribute("aria-expanded", String(open));
}

// After opening, use height:auto so the chips can re-wrap if the window is resized
$("#services-container").addEventListener("transitionend", (e) => {
  if (e.propertyName === "height" && e.target.closest(".services__open")) e.target.style.height = "auto";
});

/*=============== COPY EMAIL ===============*/
const copyBtn = $("#contact-btn");
copyBtn.addEventListener("click", async () => {
  const email = $('.contact__address[data-profile="email"]').textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    copyBtn.innerHTML = `Email copied ${icon("check-line")}`;
  } catch {
    copyBtn.textContent = email; // clipboard blocked: show the email instead
  }
  setTimeout(() => (copyBtn.innerHTML = `Copy email ${icon("file-copy-line")}`), 2500);
});

/*=============== FOOTER YEAR ===============*/
$("#footer-year").textContent = new Date().getFullYear();

/*=============== ACTIVE LINK ON SCROLL ===============*/
const sections = document.querySelectorAll("section[id]");
function scrollActive() {
  const y = window.scrollY;
  const atBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 2;
  const linked = [...sections].filter((s) => document.querySelector(`.nav__menu a[href="#${s.id}"]`));
  linked.forEach((section, i) => {
    const link = document.querySelector(`.nav__menu a[href="#${section.id}"]`);
    const top = section.offsetTop - 80;
    // the last section is often too short to reach the top of the screen
    const active = atBottom ? i === linked.length - 1 : y > top && y <= top + section.offsetHeight;
    link.classList.toggle("active-link", active);
  });
}
window.addEventListener("scroll", scrollActive, { passive: true });

/*=============== CUSTOM CURSOR ===============*/
const cursor = $(".cursor");
let mouseInside = false, overClickable = false;
const updateCursor = () => cursor.classList.toggle("hide-cursor", !mouseInside || overClickable);
document.addEventListener("mousemove", (e) => {
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
  mouseInside = true;
  updateCursor();
});
// Shrink the cursor over clickable things so they stay readable
document.addEventListener("mouseover", (e) => {
  overClickable = !!e.target.closest("a, button");
  updateCursor();
});
document.documentElement.addEventListener("mouseleave", () => {
  mouseInside = false;
  updateCursor();
});

/*=============== SCROLL REVEAL ===============*/
const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        revealObserver.unobserve(entry.target);
      }
    }),
  { threshold: 0.12 }
);
function setupReveal() {
  document
    .querySelectorAll(
      ".home__data, .home__info, .about__data, .about__image, .section__title, .projects__track, .work__tabs, .work__card, .services__card, .contact__data, .contact__content > *"
    )
    .forEach((el) => {
      if (el.classList.contains("show")) return;
      el.classList.add("reveal");
      revealObserver.observe(el);
    });
}

/*=============== START ===============*/
renderAll(DEFAULT_DATA);
scrollActive();

// If a Google Sheet is connected, load it and re-render only if something changed.
loadFromSheet(DEFAULT_DATA)
  .then((sheetData) => {
    if (sheetData && JSON.stringify(sheetData) !== JSON.stringify(DEFAULT_DATA)) renderAll(sheetData);
  })
  .catch((err) => console.warn("Google Sheet not loaded, using data.js:", err.message));
