/* =====================================================================
   SITE CONTENT (fallback)
   ---------------------------------------------------------------------
   The site reads its content in this order:
     1. Google Sheet  -> if SHEET_URL below is filled in
     2. Excel file    -> portfolio-data.xlsx in the repo root
     3. This file     -> used if both of the above fail (e.g. offline)
   So normally you only edit portfolio-data.xlsx and upload it to GitHub.
   ===================================================================== */

const SHEET_URL = ""; // optional, e.g. "https://docs.google.com/spreadsheets/d/XXXXXXXX/edit"
const EXCEL_FILE = "portfolio-data.xlsx";

const DEFAULT_DATA = {
  /* ---------- Profile: one value per key ---------- */
  profile: {
    logo: "Mohd Saud",
    page_title: "Mohd Saud | Cloud & DevOps Engineer",
    page_description: "Portfolio of Mohd Saud: Cloud & DevOps engineer in the making, working with AWS, Terraform, Docker, CI/CD and Cloud Security.",
    greeting: "Hello, I'm",
    name_line1: "Mohd",
    name_line2: "Saud",
    hero_split: "Aspiring",
    // Role under hero_split (the last word goes on the white line). Several roles, separated by commas, take turns.
    hero_roles: "Cloud/DevOps Engineer",
    hero_image: "assets/img/hero-profile.webp",
    about_image: "assets/img/about-profile.webp",
    resume: "assets/pdf/Mohd-Saud-Resume.pdf",

    about_title_highlight: "Cloud",
    about_title_rest: "Is My Passion",
    // Wrap words in **double stars** to make them purple and bold.
    about_text:
      "I'm a **Cloud & DevOps Engineer** in the making, with nearly four years of **customer-facing operations** experience. I build and secure infrastructure on **AWS** using Terraform, Docker and CI/CD, and I'm always learning something new.",

    projects_title: "I make Incredible",
    projects_highlight: "Projects",
    work_title_highlight: "My Work",
    work_title_rest: "Experience",
    services_title: "What I",
    services_highlight: "Offer",
    testimonials_title_highlight: "What They Say",
    testimonials_title_rest: "About Me",
    contact_title: "Contact Me",
    contact_text: "Open to Cloud / DevOps roles. Let's talk!",

    email: "mosaud1997@icloud.com",
    location: "Lucknow, Uttar Pradesh, India",

    // Social links: leave empty to hide. Shown in the hero and under "Social Media".
    linkedin: "https://www.linkedin.com/in/mohdsaud1",
    github: "https://github.com/Iamsaudkhan",
    x: "",
    instagram: "",
    facebook: "",
    youtube: "",
    tiktok: "",

    // "Write Me & We'll Talk" links: leave empty to hide (Email is always shown).
    whatsapp: "", // e.g. "https://wa.me/91XXXXXXXXXX"
    telegram: "",
    messenger: "",
  },

  /* ---------- Projects (numbered automatically: 01, 02, ...) ---------- */
  projects: [
    {
      category: "DevSecOps",
      title: "Secure Cloud\nDevSecOps Pipeline",
      stack: "AWS, Terraform, GitHub Actions, Docker, Trivy, ECR, EC2, CloudWatch",
      status: "In progress",
      image: "",
      link: "",
      visible: "yes",
    },
    {
      category: "IaC",
      title: "AWS Infrastructure\nas Code",
      stack: "AWS, Terraform, S3, DynamoDB, IAM, VPC",
      status: "In progress",
      image: "",
      link: "",
      visible: "yes",
    },
    {
      category: "Web",
      title: "Portfolio Website",
      stack: "HTML, CSS, JavaScript, Swiper JS, Anime JS, GitHub Pages",
      status: "Completed",
      image: "",
      link: "https://github.com/MOHDSAUD888/Mohd-Saud_Portfolio-Website",
      visible: "yes",
    },
  ],

  /* ---------- Experience & Education (type decides the tab) ---------- */
  experience: [
    {
      type: "Experience",
      title: "Service Advisor",
      organization: "Oneup Motors India Pvt. Ltd. (Maruti Suzuki)",
      period: "Sep 2019 -\nMay 2023",
      description:
        "Managed customer service in a high-volume automotive workshop: coordinated with technicians, handled client communication and escalations, and managed service documentation and billing.",
      visible: "yes",
    },
    {
      type: "Education",
      title: "B.Tech\n(Computer Science)",
      organization: "Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow",
      period: "Class of\n2026",
      description:
        "Studied computer science fundamentals, programming, networking and problem solving, and moved into Cloud and DevOps through hands-on projects.",
      visible: "yes",
    },
    {
      type: "Education",
      title: "AWS Solutions\nArchitect – Associate",
      organization: "Certification (in progress) · GCP Skills Boost labs",
      period: "Ongoing",
      description:
        "Preparing for AWS SAA and practising on Google Cloud Skills Boost labs to strengthen cloud architecture skills.",
      visible: "yes",
    },
    {
      type: "Education",
      title: "Diploma\n(Automobile Engg.)",
      organization: "Integral University, Lucknow",
      period: "2018",
      description:
        "Built a strong technical base in automobile systems, which led to my first professional role in the automotive industry.",
      visible: "yes",
    },
  ],

  /* ---------- What I Offer (cards that open with the arrow button) ---------- */
  services: [
    {
      title: "Cloud & DevOps Skills",
      description: "Building, automating and deploying infrastructure on AWS with Infrastructure as Code and CI/CD pipelines.",
      subtitle: "Skills",
      items: "AWS EC2, S3, VPC, IAM, ECR, Route 53, Secrets Manager, CloudWatch, GCP, Terraform, Docker, GitHub Actions, CI/CD, Trivy",
      visible: "yes",
    },
    {
      title: "Linux & Networking",
      description: "Solid foundation in Linux administration, networking and cloud security basics.",
      subtitle: "Skills",
      items: "Ubuntu, Bash Scripting, Linux Administration, TCP/IP, DNS, DHCP, HTTP/HTTPS, VPC Subnetting, Routing Tables, Firewalls, Security Groups",
      visible: "yes",
    },
    {
      title: "Development Tools",
      description: "Tools and languages I use every day to build, test and document my work.",
      subtitle: "Tools",
      items: "Python, HTML, CSS, JavaScript, Git, GitHub, VS Code, MySQL, VMware, VirtualBox, Kali Linux, Windows Server",
      visible: "yes",
    },
    {
      title: "Professional Skills",
      description: "Strengths from nearly four years of real customer-facing work in the automobile industry.",
      subtitle: "Strengths",
      items: "Customer Handling, Escalation Management, Team Coordination, Documentation, Billing, Communication, Working Under Pressure",
      visible: "yes",
    },
  ],

  /* ---------- Testimonials ----------
     Add ONLY real quotes from real people (manager, teacher, colleague).
     The section stays hidden until at least one is added. Example:
     { name: "Rahul Sharma", role: "Workshop Manager, Oneup Motors", rating: "5",
       text: "Saud handled ...", image: "assets/img/testimonial-1.png", visible: "yes" } */
  testimonials: [],
};
