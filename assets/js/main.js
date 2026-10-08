/* =====================================================================
   main.js
   1. Loads the content: Google Sheet -> Excel file -> data.js
   2. Renders every section from that content
   3. Starts the same interactions as the original design:
      anime.js title, Swiper carousel, work tabs, services cards,
      testimonials, copy email, active link, custom cursor, ScrollReveal,
      plus the pipeline-on-scroll section (ADDED)
   You normally don't need to edit this file.
   ===================================================================== */

/*=============== HELPERS ===============*/
const $ = (sel) => document.querySelector(sel);

// Content can come from a spreadsheet, so escape it before putting it into
// HTML, and only allow http(s) / mailto / relative links.
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const safeUrl = (u) => {
  const url = String(u ?? "").trim();
  if (/^(https?:|mailto:)/i.test(url)) return url;
  if (url && !/^[a-z][a-z0-9+.-]*:/i.test(url)) return url; // relative path like assets/img/x.png
  return "";
};
// "github.com/user" or "www.linkedin.com/in/x" typed without https:// -> add it
const normalizeLink = (u) => {
  const url = String(u ?? "").trim();
  return /^(www\.|[a-z0-9-]+\.(com|in|io|dev|me|org|net|app|co)(\/|$))/i.test(url) ? "https://" + url : url;
};
const link = (u) => safeUrl(normalizeLink(u));
// Icons come from the SVG sprite at the top of index.html
const icon = (name) => `<svg class="icon" aria-hidden="true"><use href="#ri-${name}"></use></svg>`;
// Alt+Enter inside an Excel cell = new line on the site
const multiline = (s) => esc(s).replace(/\r?\n/g, "<br />");
const boldify = (s) => multiline(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const splitList = (s) => String(s ?? "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
const isVisible = (row) => String(row.visible ?? "yes").trim().toLowerCase() !== "no";
const pad = (n) => String(n).padStart(2, "0");
// Screens >= 2048px use "body { zoom: 1.4 }": mouse and scroll positions are zoomed, element offsets are not
const bodyZoom = () => parseFloat(getComputedStyle(document.body).zoom) || 1;
let zoom = bodyZoom();
window.addEventListener("resize", () => (zoom = bodyZoom()));

/*=============== CONTENT LOADING ===============*/
const TABS = ["Profile", "Projects", "Experience", "Services", "Testimonials"];

// Each tab must have these columns, otherwise it is ignored and data.js is used.
// (Google returns the FIRST tab when a tab name is wrong, so this check matters.)
const REQUIRED = {
  Profile: ["key", "value"],
  Projects: ["title", "stack"],
  Experience: ["type", "title"],
  Services: ["title", "items"],
  Testimonials: ["name", "text"],
};

// First row = column names. "Stack (comma separated)" becomes "stack".
function rowsToObjects(rows) {
  const [head = [], ...body] = rows.filter((r) => r.some((c) => String(c ?? "").trim() !== ""));
  const keys = head.map((h) => String(h).split("(")[0].trim().toLowerCase().replace(/\s+/g, "_"));
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, String(r[i] ?? "").trim()])));
}

// Small CSV parser (Google Sheet): handles quotes, commas and line breaks inside cells.
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
  return rows;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => reject(new Error(`could not load ${src}`));
    document.head.appendChild(s);
  });
}

// Google Sheet shared as "Anyone with the link -> Viewer"
async function loadGoogleTabs(url) {
  const match = String(url).match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (!match) throw new Error("SHEET_URL is not a Google Sheets link");
  const results = await Promise.allSettled(
    TABS.map(async (tab) => {
      const csvUrl = `https://docs.google.com/spreadsheets/d/${match[1]}/gviz/tq?tqx=out:csv&headers=1&sheet=${encodeURIComponent(tab)}`;
      const res = await fetch(csvUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`${tab}: HTTP ${res.status}`);
      return rowsToObjects(parseCSV(await res.text()));
    })
  );
  return Object.fromEntries(TABS.map((tab, i) => [tab, results[i].status === "fulfilled" ? results[i].value : null]));
}

// portfolio-data.xlsx in the repo, read in the browser with SheetJS
async function loadExcelTabs(file) {
  const res = await fetch(file, { cache: "no-cache" });
  if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  if (typeof XLSX === "undefined") await loadScript("assets/vendor/xlsx.mini.min.js");
  const workbook = XLSX.read(buffer, { type: "array" });
  return Object.fromEntries(
    TABS.map((tab) => {
      const sheet = workbook.Sheets[tab];
      if (!sheet) return [tab, null];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false, blankrows: false });
      return [tab, rowsToObjects(rows)];
    })
  );
}

// Merge the loaded tabs over data.js. A tab that is missing or has the wrong
// columns keeps the data.js content, so the site never breaks.
function mergeTabs(defaults, tabs) {
  const data = structuredClone(defaults);
  TABS.forEach((tab) => {
    const rows = tabs[tab];
    // A list tab with only the header row simply means "nothing here" (e.g. no testimonials yet)
    if (rows && rows.length === 0 && tab !== "Profile") {
      data[tab.toLowerCase()] = [];
      return;
    }
    const cols = rows && rows.length ? Object.keys(rows[0]) : [];
    if (!rows || !REQUIRED[tab].every((c) => cols.includes(c))) {
      if (rows) console.warn(`"${tab}" tab skipped: missing columns ${REQUIRED[tab].join(", ")}`);
      return;
    }
    if (tab === "Profile") {
      rows.forEach(({ key, value }) => {
        if (key) data.profile[key.trim()] = value;
      });
    } else {
      data[tab.toLowerCase()] = rows;
    }
  });
  return data;
}

async function loadContent() {
  const sources = [];
  if (typeof SHEET_URL === "string" && SHEET_URL.trim()) sources.push(["Google Sheet", () => loadGoogleTabs(SHEET_URL)]);
  // Still read the Excel file if data.js is broken (EXCEL_FILE missing)
  const excel = typeof EXCEL_FILE === "string" ? EXCEL_FILE : "portfolio-data.xlsx";
  if (excel.trim()) sources.push(["Excel file", () => loadExcelTabs(excel)]);

  for (const [name, load] of sources) {
    try {
      const tabs = await load();
      if (Object.values(tabs).some(Boolean)) return mergeTabs(DEFAULT_DATA, tabs);
    } catch (err) {
      console.warn(`${name} not loaded:`, err.message);
    }
  }
  return structuredClone(DEFAULT_DATA);
}

/*=============== RENDER: PROFILE, SOCIAL LINKS, CONTACT ===============*/
const SOCIALS = [
  ["linkedin", "LinkedIn", "linkedin-fill"],
  ["github", "GitHub", "github-line"],
  ["x", "X", "twitter-x-line"],
  ["instagram", "Instagram", "instagram-line"],
  ["facebook", "Facebook", "facebook-line"],
  ["youtube", "YouTube", "youtube-line"],
  ["tiktok", "TikTok", "tiktok-line"],
];
const WRITE_LINKS = [
  ["whatsapp", "WhatsApp"],
  ["telegram", "Telegram"],
  ["messenger", "Messenger"],
];

const contactLink = (url, label, external = true) =>
  `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener"' : ""} class="contact__link">${esc(label)} ${icon("arrow-right-up-long-line")}</a>`;
const heroLink = (url, label, ic, external = true) =>
  `<a href="${esc(url)}"${external ? ' target="_blank" rel="noopener"' : ""} class="home__social-link" aria-label="${label}">${icon(ic)}</a>`;

function renderProfile(p) {
  document.querySelectorAll("[data-profile]").forEach((el) => {
    const value = p[el.dataset.profile];
    if (value) el.textContent = value;
  });
  $("#about-text").innerHTML = boldify(p.about_text);
  if (p.page_title) document.title = p.page_title;
  if (p.page_description) document.querySelector('meta[name="description"]').setAttribute("content", p.page_description);
  if (p.logo) {
    $("#hero-image").alt = p.logo;
    $("#about-image").alt = p.logo;
  }

  const heroImage = safeUrl(p.hero_image);
  if (heroImage) $("#hero-image").src = heroImage;
  const aboutImage = safeUrl(p.about_image);
  if (aboutImage) $("#about-image").src = aboutImage;

  const resume = safeUrl(p.resume);
  document.querySelectorAll(".resume-link").forEach((a) => {
    a.hidden = !resume;
    if (resume) a.href = resume;
  });

  const socials = SOCIALS.map(([key, label, ic]) => [link(p[key]), label, ic]).filter(([url]) => url);
  const email = String(p.email ?? "").trim();
  // Hero icons: the social links, then a mail icon (mailto opens the mail app, so no new tab)
  $("#home-social").innerHTML =
    socials.map(([url, label, ic]) => heroLink(url, label, ic)).join("") +
    (email ? heroLink(`mailto:${email}`, "Email", "mail-line", false) : "");
  $("#contact-social").innerHTML = socials.map(([url, label]) => contactLink(url, label)).join("");

  const write = WRITE_LINKS.map(([key, label]) => [link(p[key]), label]).filter(([url]) => url);
  $("#contact-write").innerHTML =
    write.map(([url, label]) => contactLink(url, label)).join("") + (email ? contactLink(`mailto:${email}`, "Email", false) : "");
}

/*=============== RENDER: PROJECTS ===============*/
function projectCard(p, i) {
  const done = String(p.status).trim().toLowerCase().startsWith("complete");
  const img = safeUrl(p.image);
  const url = link(p.link);
  const media = img
    ? `<img src="${esc(img)}" alt="Screenshot of ${esc(p.title)}" class="projects__img" loading="lazy" />`
    : `<div class="projects__placeholder">${icon("cloud-line")}<span>Screenshot coming soon</span></div>`;
  return `
    <article class="projects__card swiper-slide">
      <div class="blob"></div>

      <div class="projects__number">
        <h1>${pad(i + 1)}</h1>
        <h3>${esc(p.category || "Project")}</h3>
      </div>

      <div class="projects__data">
        <h1 class="projects__title">${multiline(p.title)}</h1>
        <p class="projects__subtitle">Techstack used</p>
        <p class="projects__description">${esc(splitList(p.stack).join(", "))}</p>
        ${p.status ? `<span class="projects__status ${done ? "done" : ""}">${done ? "Completed" : esc(p.status)}</span>` : ""}
      </div>

      <div class="projects__image">
        ${media}
        ${url ? `<a href="${esc(url)}" target="_blank" rel="noopener" class="projects__button" aria-label="Open ${esc(p.title)}">${icon("arrow-right-up-long-line")}</a>` : ""}
      </div>
    </article>`;
}

// Returns the number of real (not repeated) projects
function renderProjects(projects) {
  const cards = projects.filter(isVisible).map(projectCard);
  $("#projects").hidden = cards.length === 0;
  document.querySelector('.nav__menu a[href="#projects"]').closest("li").hidden = cards.length === 0;
  // Swiper's loop mode needs more slides than fit on the screen, so with only
  // a few projects the cards are repeated (the original design had 8 projects).
  const copies = cards.length ? Math.ceil(8 / cards.length) : 0;
  $("#projects-wrapper").innerHTML = Array.from({ length: copies }, () => cards.join("")).join("");
  $("#projects-pagination").innerHTML = cards
    .map((_, i) => `<span class="swiper-pagination-bullet" role="button" tabindex="0" data-index="${i}" aria-label="Go to project ${i + 1}"></span>`)
    .join("");
  return cards.length;
}

/*=============== RENDER: EXPERIENCE / EDUCATION ===============*/
function workCard(w) {
  return `
    <div class="work__card">
      <div class="work__data">
        <div>
          <h1 class="work__title">${multiline(w.title)}</h1>
          <h3 class="work__subtitle">${multiline(w.organization)}</h3>
        </div>
        <h2 class="work__year">${multiline(w.period)}</h2>
      </div>

      <p class="work__description">${multiline(w.description)}</p>
    </div>`;
}

function renderWork(rows) {
  const visible = rows.filter(isVisible);
  const isEducation = (w) => String(w.type).trim().toLowerCase().startsWith("edu");
  $("#experience").innerHTML = visible.filter((w) => !isEducation(w)).map(workCard).join("");
  $("#education").innerHTML = visible.filter(isEducation).map(workCard).join("");
}

/*=============== RENDER: SERVICES ===============*/
function renderServices(rows) {
  $("#services-container").innerHTML = rows
    .filter(isVisible)
    .map(
      (s, i) => `
      <div class="services__card services__close">
        <div class="blob${i % 2 ? " blob-2" : ""}"></div>

        <div class="services__data">
          <h2 class="services__title">${multiline(s.title)}</h2>
          <p class="services__description">${multiline(s.description)}</p>
        </div>

        <div class="services__info">
          <h3 class="services__subtitle">${esc(s.subtitle || "Skills")}</h3>
          <ul class="services__skills">
            ${splitList(s.items).map((x) => `<li class="services__skill">${esc(x)}</li>`).join("")}
          </ul>
        </div>

        <button class="services__button" aria-label="Show ${esc(s.title)}" aria-expanded="false">
          ${icon("arrow-down-s-line")}
        </button>
      </div>`
    )
    .join("");
}

/*=============== RENDER: TESTIMONIALS ===============*/
function testimonialCard(t) {
  const img = safeUrl(t.image);
  const rating = Number(String(t.rating).replace(",", "."));
  const photo = img
    ? `<img src="${esc(img)}" alt="${esc(t.name)}" class="testimonials__img" loading="lazy" />`
    : `<div class="testimonials__avatar">${esc(String(t.name).trim().charAt(0).toUpperCase())}</div>`;
  return `
    <article class="testimonials__card">
      <div class="blob"></div>

      <div class="testimonials__data">
        ${photo}
        <h2 class="testimonials__name">${esc(t.name)}</h2>
        ${t.role ? `<p class="testimonials__role">${esc(t.role)}</p>` : ""}
        ${
          rating > 0
            ? `<div class="testimonial__rating">
                 <div class="testimonial__stars">${icon("star-line").repeat(5)}</div>
                 <h3 class="testimonials__number">${Math.min(rating, 5).toFixed(1)}</h3>
               </div>`
            : ""
        }
        <p>${multiline(t.text)}</p>
      </div>
    </article>`;
}

function renderTestimonials(rows) {
  const list = rows.filter((t) => isVisible(t) && String(t.text ?? "").trim());
  $("#testimonials").hidden = list.length === 0;
  if (!list.length) return;
  // Each row must be wider than the screen, then it is written twice so the
  // strip can slide by -50% and start again without a visible jump.
  const half = Array.from({ length: Math.ceil(6 / list.length) }, () => list.map(testimonialCard).join("")).join("");
  $("#testimonials-row-1").innerHTML = half + half;
  $("#testimonials-row-2").innerHTML = half + half;
}

function renderAll(data) {
  renderProfile(data.profile);
  renderWork(data.experience);
  renderServices(data.services);
  renderTestimonials(data.testimonials);
  return renderProjects(data.projects);
}

/*=============== HOME ROLE + SPLIT TEXT (anime.js) ===============*/
// "Cloud/DevOps Engineer" -> purple line "Cloud/DevOps" + white line "Engineer"
function renderRole(p) {
  const role = String(p.hero_role || [p.hero_profession1, p.hero_profession2].filter(Boolean).join(" ")).trim();
  if (!role) return;
  const words = role.split(/\s+/);
  const lines = words.length > 1 ? [words.slice(0, -1).join(" "), words.at(-1)] : [role, ""];
  $(".home__profession-1").textContent = lines[0];
  $(".home__profession-2").textContent = lines[1];
  $("#home-role").setAttribute("aria-label", role);
}

function startSplitText() {
  if (typeof anime === "undefined") return;
  const { animate, text, stagger } = anime;
  const { chars: chars1 } = text.split(".home__profession-1", { chars: true });
  const { chars: chars2 } = text.split(".home__profession-2", { chars: true });
  const options = {
    y: [{ to: ["100%", "0%"] }, { to: "-100%", delay: 4000, ease: "in(3)" }],
    duration: 900,
    ease: "out(3)",
    delay: stagger(80),
    loop: true,
  };
  // Lines with fewer letters wait a bit longer, so both loops stay in sync
  const longest = Math.max(chars1.length, chars2.length);
  animate(chars1, { ...options, loopDelay: (longest - chars1.length) * 80 });
  animate(chars2, { ...options, loopDelay: (longest - chars2.length) * 80 });
}

/*=============== SWIPER PROJECTS ===============*/
function startSwiper(count) {
  if (!count || typeof Swiper === "undefined") return;
  const swiperProjects = new Swiper(".projects__swiper", {
    loop: true,
    spaceBetween: 24,
    slidesPerView: "auto",
    grabCursor: true,
    speed: 600,
    autoplay: { delay: 3000, disableOnInteraction: false },
  });

  // One bullet per real project (the repeated cards share the same bullets)
  const bullets = document.querySelectorAll("#projects-pagination .swiper-pagination-bullet");
  const update = () =>
    bullets.forEach((b, i) => {
      const active = i === swiperProjects.realIndex % count;
      b.classList.toggle("swiper-pagination-bullet-active", active);
      active ? b.setAttribute("aria-current", "true") : b.removeAttribute("aria-current");
    });
  const goTo = (i) => {
    const current = swiperProjects.realIndex;
    swiperProjects.slideToLoop(current - (current % count) + i);
  };
  swiperProjects.on("slideChange", update);
  update();
  bullets.forEach((b) => {
    b.addEventListener("click", () => goTo(Number(b.dataset.index)));
    b.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), goTo(Number(b.dataset.index))));
  });
}

/*=============== WORK TABS ===============*/
// ADDED: ScrollReveal measures where each section is only on load and on window
// resize. Switching tabs or opening a service card changes the page height, so
// the sections below move; a "resize" event makes it measure them again.
// Without it, Skills and Contact could stay invisible after picking "Education".
const refreshReveal = () => window.dispatchEvent(new Event("resize"));

const tabs = document.querySelectorAll("[data-target]"),
  tabContents = document.querySelectorAll("[data-content]");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetContent = document.querySelector(tab.dataset.target);
    // Disable all content and active tabs
    tabContents.forEach((content) => content.classList.remove("work-active"));
    tabs.forEach((t) => t.classList.remove("work-active"));
    // Activate the tab and its content
    tab.classList.add("work-active");
    targetContent.classList.add("work-active");
    tabs.forEach((t) => t.setAttribute("aria-pressed", String(t === tab)));
    refreshReveal();
  });
});

/*=============== SERVICES ===============*/
// One listener on the container also works for cards rendered later.
$("#services-container").addEventListener("click", (e) => {
  const button = e.target.closest(".services__button");
  if (!button) return;
  const card = button.closest(".services__card");
  const isOpen = card.classList.contains("services__open");

  // Close all cards first, then open the clicked one
  document.querySelectorAll(".services__open").forEach((c) => setServiceOpen(c, false));
  if (!isOpen) setServiceOpen(card, true);
});

function setServiceOpen(card, open) {
  const info = card.querySelector(".services__info");
  info.style.height = info.scrollHeight + "px"; // start from a real height ("auto" can't animate)
  info.offsetHeight; // apply it before changing again
  card.classList.toggle("services__open", open);
  card.classList.toggle("services__close", !open);
  info.style.height = open ? info.scrollHeight + "px" : "0px";
  card.querySelector(".services__button").setAttribute("aria-expanded", String(open));
}

// After opening, switch to height:auto so the skills can re-wrap when the window is resized
$("#services-container").addEventListener("transitionend", (e) => {
  if (e.propertyName !== "height") return;
  if (e.target.closest(".services__open")) e.target.style.height = "auto";
  refreshReveal(); // the card grew or shrank, so Contact moved
});

/*=============== COPY EMAIL IN CONTACT ===============*/
const copyBtn = $("#contact-btn");
copyBtn.addEventListener("click", async () => {
  const email = $('.contact__address[data-profile="email"]').textContent.trim();
  try {
    await navigator.clipboard.writeText(email);
    copyBtn.innerHTML = `Email Copied ${icon("check-line")}`;
  } catch {
    copyBtn.textContent = email; // clipboard blocked: show the email instead
  }
  // Restore the original text
  setTimeout(() => (copyBtn.innerHTML = `Copy Email ${icon("file-copy-line")}`), 2000);
});

/*=============== CURRENT YEAR OF FOOTER ===============*/
$("#footer-year").textContent = new Date().getFullYear();

/*=============== SCROLL SECTIONS ACTIVE LINK ===============*/
const sections = document.querySelectorAll("section[id]");

const scrollActive = () => {
  const scrollY = window.scrollY;
  // Menu clicks stop "scroll-padding-top" above a section, so the threshold must be larger than that
  const offset = Math.max(50, (parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0) + 2);
  const atBottom = window.innerHeight + scrollY >= document.documentElement.scrollHeight - 2;
  const linked = [...sections].filter((s) => document.querySelector(`.nav__menu a[href="#${s.id}"]`));

  linked.forEach((section, i) => {
    const navLink = document.querySelector(`.nav__menu a[href="#${section.id}"]`),
      top = (section.offsetTop - offset) * zoom,
      height = section.offsetHeight * zoom;
    // The last section is often too short to reach the top, so at the very bottom it is active
    const active = atBottom ? i === linked.length - 1 : scrollY > top && scrollY <= top + height;
    navLink.classList.toggle("active-link", active);
  });
};
window.addEventListener("scroll", scrollActive, { passive: true });

/*=============== CUSTOM CURSOR ===============*/
const cursor = $(".cursor");
let mouseX = 0,
  mouseY = 0,
  mouseMoved = false;

const cursorMove = () => {
  cursor.style.left = `${mouseX / zoom}px`;
  cursor.style.top = `${mouseY / zoom}px`;
  cursor.style.transform = "translate(-50%, -50%)";
  requestAnimationFrame(cursorMove);
};
document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  // The cursor stays hidden until the mouse moves (instead of sitting in the corner)
  if (!mouseMoved) {
    mouseMoved = true;
    if (!e.target.closest("a")) cursor.classList.remove("hide-cursor");
  }
});
cursorMove();

// Hide the custom cursor on links (also on links rendered later)
document.addEventListener("mouseover", (e) => {
  if (mouseMoved && e.target.closest("a")) cursor.classList.add("hide-cursor");
});
document.addEventListener("mouseout", (e) => {
  const a = e.target.closest("a");
  if (mouseMoved && a && !a.contains(e.relatedTarget)) cursor.classList.remove("hide-cursor");
});

/*=============== PIPELINE ON SCROLL (ADDED) ===============*/
// The pipeline section pins while it scrolls past, and the scroll position
// decides which CI stage is "running". Stages use the first 70% of the
// scroll; the result card holds for the rest, so the finish gets the most room.
// With "reduce motion" switched on, the section stays a static list.
function startPipeline() {
  const pipeline = $("#pipeline");
  if (!pipeline || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const stages = pipeline.querySelectorAll("[data-stage]");
  const details = pipeline.querySelectorAll("[data-detail]"); // one per stage + the result
  const track = pipeline.querySelector(".pipeline__track");
  const STAGES_END = 0.7;
  let current = -1;

  pipeline.classList.add("pipeline--live");

  const update = () => {
    const box = pipeline.getBoundingClientRect();
    const room = box.height - window.innerHeight;
    const p = room > 0 ? Math.min(1, Math.max(0, -box.top / room)) : 1;
    const pos = (p / STAGES_END) * stages.length; // stage i runs while pos is between i and i + 1
    const step = Math.min(stages.length, Math.floor(pos));

    // The line reaches a node when that stage starts running
    track.style.setProperty("--pipe-fill", Math.min(1, pos / (stages.length - 1)));
    if (step === current) return;
    current = step;

    stages.forEach((stage, i) => {
      stage.classList.toggle("is-done", i < step);
      stage.classList.toggle("is-running", i === step);
      if (i === step) stage.setAttribute("aria-current", "step");
      else stage.removeAttribute("aria-current");
    });
    details.forEach((card, i) => {
      card.classList.toggle("is-active", i === step);
      card.inert = i !== step; // hidden cards: no focus, not read out
    });
    pipeline.classList.toggle("is-passed", step === stages.length);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      update();
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  update();
}

/*=============== SCROLL REVEAL ANIMATION ===============*/
function startScrollReveal() {
  // CHANGED: no animation at all for visitors who asked for reduced motion
  if (typeof ScrollReveal === "undefined" || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // CHANGED: each section reveals once and quickly. The original (2s + 0.3s delay,
  // reset: true) hid a section again every time it left the screen, so jumping
  // there from the menu showed an empty section for up to 2 seconds.
  const sr = ScrollReveal({
    origin: "top",
    distance: "40px",
    duration: 800,
    delay: 100,
    reset: false,
  });

  // Home, projects, work, testimonials and contact
  sr.reveal(`.home__image, .projects__container, .work__container, .testimonials__container, .contact__container`);
  sr.reveal(`.home__data`, { delay: 900, origin: "bottom" });
  sr.reveal(`.home__info`, { delay: 1200, origin: "bottom" });
  sr.reveal(`.home__social, .home__cv`, { delay: 1200 });
  // About
  sr.reveal(`.about__data`, { origin: "left" });
  sr.reveal(`.about__image`, { origin: "right" });
  // Services (the original passes "intervarl: 100", a typo, so it behaves like this)
  sr.reveal(`.services__card`);
}

/*=============== START ===============*/
// If data.js has a typo, DEFAULT_DATA does not exist: use empty content instead of a blank page
if (typeof DEFAULT_DATA === "undefined") {
  console.error("assets/js/data.js could not be read (check it for a missing comma or quote)");
  window.DEFAULT_DATA = { profile: {}, projects: [], experience: [], services: [], testimonials: [] };
}

(async () => {
  try {
    let data;
    try {
      // Don't keep the page hidden for long if the network is slow
      const timeout = new Promise((resolve) => setTimeout(() => resolve(null), 3000));
      data = (await Promise.race([loadContent(), timeout])) || structuredClone(DEFAULT_DATA);
    } catch (err) {
      console.warn("Content not loaded, using data.js:", err.message);
      data = structuredClone(DEFAULT_DATA);
    }

    const projectCount = renderAll(data);
    renderRole(data.profile);
    startSplitText();
    startSwiper(projectCount);
    startScrollReveal();
    startPipeline();
  } catch (err) {
    console.error(err);
  } finally {
    document.body.classList.remove("is-loading");
    scrollActive();
  }
})();
