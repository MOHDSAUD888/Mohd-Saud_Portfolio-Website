// ---------- 1. Projects data ----------
// Add a new project by adding one object here. No HTML editing needed.
// Replace these with your real projects as you build them.
const projects = [
  {
    title: "Static Website on AWS S3 + CloudFront",
    problem: "Host a fast, secure static site without managing a server.",
    stack: ["AWS S3", "CloudFront", "IAM"],
    learned: "Bucket policies, least-privilege IAM, and HTTPS via CDN.",
    status: "progress",
    repo: "",
    demo: "",
  },
  {
    title: "CI/CD Pipeline with GitHub Actions",
    problem: "Automatically test and deploy an app on every push.",
    stack: ["GitHub Actions", "Docker", "Linux"],
    learned: "Pipeline stages, secrets handling, and build caching.",
    status: "progress",
    repo: "",
    demo: "",
  },
  {
    title: "This Portfolio Website",
    problem: "Present my skills and learning journey honestly and clearly.",
    stack: ["HTML", "CSS", "JavaScript", "GitHub Pages"],
    learned: "Responsive layout, theming with CSS variables, and deployment.",
    status: "done",
    repo: "https://github.com/mohdsaud888/mohd-saud_portfolio-website",
    demo: "",
  },
];

// ---------- 2. Render projects ----------
const grid = document.getElementById("project-grid");

function linkHTML(url, label) {
  return url ? `<a href="${url}" target="_blank" rel="noopener">${label} ↗</a>` : "";
}

grid.innerHTML = projects
  .map(
    (p) => `
  <article class="card">
    <span class="status ${p.status}">${p.status === "done" ? "Completed" : "In progress"}</span>
    <h3>${p.title}</h3>
    <p><strong>Problem:</strong> ${p.problem}</p>
    <p><strong>What I learned:</strong> ${p.learned}</p>
    <ul class="tags">${p.stack.map((s) => `<li>${s}</li>`).join("")}</ul>
    <div class="card-links">${linkHTML(p.repo, "Code")}${linkHTML(p.demo, "Live")}</div>
  </article>`
  )
  .join("");

// ---------- 3. Typing effect ----------
const words = ["Linux", "AWS", "CI/CD", "Docker", "Cloud Security"];
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

// ---------- 4. Theme toggle (remembers choice) ----------
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

// ---------- 5. Mobile menu ----------
const menu = document.getElementById("menu");
document.getElementById("menu-toggle").addEventListener("click", () => menu.classList.toggle("open"));
menu.addEventListener("click", () => menu.classList.remove("open"));

// ---------- 6. Reveal cards on scroll + highlight active nav link ----------
const io = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("show")),
  { threshold: 0.15 }
);
document.querySelectorAll(".card").forEach((el) => io.observe(el));

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

// ---------- 7. Copy email ----------
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

// ---------- 8. Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
