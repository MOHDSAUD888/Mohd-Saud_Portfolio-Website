// =====================================================================
// CONFIG: paste your Google Sheet "Publish to web" CSV links here.
// Leave a link empty ("") and the site uses the DEFAULT data below.
// See README.md -> "Update the site from Google Sheets".
// =====================================================================
const SHEET_URLS = {
  profile: "",
  skills: "",
  projects: "",
};

// ---------- DEFAULT data (used if a sheet link is empty or fails to load) ----------
const DEFAULT_PROFILE = {
  tagline: "I am learning",
  lead: "Computer Science graduate with 4+ years of customer-facing operations experience, now building hands-on skills in AWS, Terraform, Docker, CI/CD and Cloud Security.",
  about1: "I started my career as a Service Advisor at Oneup Motors (Maruti Suzuki dealership, Lucknow), handling customers, technicians, escalations and billing in a high-volume workshop. That taught me responsibility, communication and problem-solving under pressure.",
  about2: "I then completed my B.Tech in Computer Science (AKTU, 2026) and moved into technology. My focus is Cloud and DevOps, with Cloud Security as my longer-term direction. I learn by building, breaking things, and documenting what I fix.",
  email: "mosaud1997@icloud.com",
  linkedin: "https://www.linkedin.com/in/mohdsaud1",
  github: "https://github.com/Iamsaudkhan",
  open_to: "Open to internships and entry-level Cloud / DevOps opportunities.",
};

const DEFAULT_SKILLS = [
  { category: "Cloud", items: "AWS (EC2, S3, VPC, IAM, ECR, Route 53, Secrets Manager, CloudWatch); GCP", level: "Learning" },
  { category: "DevOps & IaC", items: "Terraform; Docker; GitHub Actions; CI/CD; Trivy", level: "Learning" },
  { category: "Linux & Networking", items: "Ubuntu; Bash; TCP/IP; DNS; VPC subnetting; Security Groups", level: "Learning" },
  { category: "Programming & Tools", items: "Python; HTML/CSS/JS; Git; GitHub; MySQL", level: "Learning" },
  { category: "Professional", items: "Communication; Customer handling; Coordination; Working under pressure", level: "Strong" },
];

const DEFAULT_PROJECTS = [
  {
    title: "End-to-End Secure Cloud DevSecOps Pipeline & AWS Infrastructure",
    problem: "Automate testing, security scanning and deployment of a containerized app on AWS.",
    stack: "AWS; Terraform; GitHub Actions; Docker; Trivy; ECR; EC2; CloudWatch",
    learned: "Shift-left security with Trivy, custom VPC with Terraform, least-privilege IAM and Secrets Manager.",
    status: "In progress", repo: "", demo: "",
  },
  {
    title: "Automated AWS Infrastructure as Code (IaC) Provisioning",
    problem: "Make multi-tier AWS environments repeatable and safe for team use.",
    stack: "AWS; Terraform; IaC; Cloud Security; GitHub",
    learned: "Modular Terraform, remote state with DynamoDB locking, zero-trust Security Groups, encrypted S3.",
    status: "In progress", repo: "", demo: "",
  },
  {
    title: "This Portfolio Website",
    problem: "Present my skills and learning journey clearly, and update it from a Google Sheet.",
    stack: "HTML; CSS; JavaScript; GitHub Pages; Google Sheets",
    learned: "Responsive layout, CSS variables for theming, fetching CSV data, deployment.",
    status: "Completed",
    repo: "https://github.com/MOHDSAUD888/Mohd-Saud_Portfolio-Website", demo: "",
  },
];

// ---------- Helpers ----------
// Sheet text is untrusted (anyone with edit access could change it), so we
// escape it before putting it into HTML, and only allow http(s) links.
const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u) => (/^https?:\/\//i.test(String(u || "").trim()) ? String(u).trim() : "");
const list = (s) => String(s || "").split(";").map((x) => x.trim()).filter(Boolean);
const isVisible = (row) => String(row.visible ?? "yes").trim().toLowerCase() !== "no";

// Small CSV parser that handles quotes, commas and line breaks inside cells.
function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQ = false;
      else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

// Turn the CSV into objects using the first row as keys.
// Header "stack (separate with ;)" becomes the key "stack".
function csvToObjects(text) {
  const [head, ...body] = parseCSV(text);
  const keys = head.map((h) => h.split("(")[0].trim().toLowerCase());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] || "").trim()])));
}

async function loadSheet(url, fallback, kind) {
  if (!url) return fallback;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const rows = csvToObjects(await res.text());
    if (!rows.length) throw new Error("empty sheet");
    if (kind === "profile") return { ...fallback, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
    return rows;
  } catch (e) {
    console.warn("Sheet load failed, using default data:", e.message);
    return fallback;
  }
}

// ---------- Renderers ----------
function renderProfile(p) {
  document.querySelectorAll("[data-profile]").forEach((el) => {
    const v = p[el.dataset.profile];
    if (v) el.textContent = v;
  });
  const email = document.getElementById("copy-email");
  email.dataset.email = p.email;
  const set = (id, url) => {
    const a = document.getElementById(id);
    const u = safeUrl(url);
    a.hidden = !u;
    if (u) a.href = u;
  };
  set("link-linkedin", p.linkedin);
  set("link-github", p.github);
}

function renderSkills(rows) {
  document.getElementById("skill-grid").innerHTML = rows
    .filter(isVisible)
    .map((s) => {
      const lvl = String(s.level || "").toLowerCase();
      const cls = lvl === "learning" ? "learning" : "strong";
      return `<article class="card">
        <h3>${esc(s.category)}</h3>
        <ul class="tags">${list(s.items).map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <span class="level ${cls}">${esc(s.level)}</span>
      </article>`;
    })
    .join("");
}

function renderProjects(rows) {
  const link = (url, label) => {
    const u = safeUrl(url);
    return u ? `<a href="${esc(u)}" target="_blank" rel="noopener">${label} ↗</a>` : "";
  };
  document.getElementById("project-grid").innerHTML = rows
    .filter(isVisible)
    .map((p) => {
      const done = String(p.status).toLowerCase().startsWith("complete");
      return `<article class="card">
        <span class="status ${done ? "done" : "progress"}">${done ? "Completed" : "In progress"}</span>
        <h3>${esc(p.title)}</h3>
        <p><strong>Problem:</strong> ${esc(p.problem)}</p>
        <p><strong>What I learned:</strong> ${esc(p.learned)}</p>
        <ul class="tags">${list(p.stack).map((s) => `<li>${esc(s)}</li>`).join("")}</ul>
        <div class="card-links">${link(p.repo, "Code")}${link(p.demo, "Live")}</div>
      </article>`;
    })
    .join("");
}

// Scroll-reveal must run AFTER cards exist in the page.
const reveal = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("show")),
  { threshold: 0.15 }
);
const observeCards = () => document.querySelectorAll(".card:not(.show)").forEach((el) => reveal.observe(el));

// ---------- Typing effect ----------
let words = ["Linux", "AWS", "Terraform", "Docker", "CI/CD", "Cloud Security"];
const typed = document.getElementById("typed");
let w = 0, c = 0, deleting = false;
function type() {
  const word = words[w];
  typed.textContent = word.slice(0, c);
  if (!deleting && c === word.length) { deleting = true; return setTimeout(type, 1200); }
  if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; }
  c += deleting ? -1 : 1;
  setTimeout(type, deleting ? 50 : 100);
}
type();

// ---------- Theme toggle (remembers choice) ----------
const root = document.documentElement;
try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (e) { /* storage blocked: ignore */ }
document.getElementById("theme-toggle").addEventListener("click", () => {
  const next = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = next;
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// ---------- Mobile menu ----------
const menu = document.getElementById("menu");
document.getElementById("menu-toggle").addEventListener("click", () => menu.classList.toggle("open"));
menu.addEventListener("click", () => menu.classList.remove("open"));

// ---------- Active nav link while scrolling ----------
const links = document.querySelectorAll("#menu a");
const spy = new IntersectionObserver(
  (entries) =>
    entries.forEach((e) => {
      if (e.isIntersecting)
        links.forEach((l) => l.classList.toggle("active", l.getAttribute("href") === "#" + e.target.id));
    }),
  { rootMargin: "-50% 0px -50% 0px" }
);
document.querySelectorAll("main section").forEach((s) => spy.observe(s));

// ---------- Copy email ----------
const copyBtn = document.getElementById("copy-email");
copyBtn.addEventListener("click", async () => {
  const msg = document.getElementById("copy-msg");
  try {
    await navigator.clipboard.writeText(copyBtn.dataset.email);
    msg.textContent = "Email copied!";
  } catch (e) {
    msg.textContent = "Email: " + copyBtn.dataset.email;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();

// ---------- Start: render defaults immediately, then upgrade with sheet data ----------
renderProfile(DEFAULT_PROFILE);
renderSkills(DEFAULT_SKILLS);
renderProjects(DEFAULT_PROJECTS);
observeCards();

(async () => {
  const [profile, skills, projects] = await Promise.all([
    loadSheet(SHEET_URLS.profile, DEFAULT_PROFILE, "profile"),
    loadSheet(SHEET_URLS.skills, DEFAULT_SKILLS, "list"),
    loadSheet(SHEET_URLS.projects, DEFAULT_PROJECTS, "list"),
  ]);
  renderProfile(profile);
  renderSkills(skills);
  renderProjects(projects);
  observeCards();
})();
