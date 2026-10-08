/* =====================================================================
   SITE CONTENT
   ---------------------------------------------------------------------
   Option A (easy): edit the text in this file and push.
   Option B (no code): connect a Google Sheet. Paste your sheet link in
   SHEET_URL below. The sheet must have these tabs (same column names):
   Profile, Projects, Experience, Services, Testimonials.
   If the sheet is empty, private or fails to load, the site uses the
   default data in this file, so it never breaks.
   ===================================================================== */

const SHEET_URL = ""; // e.g. "https://docs.google.com/spreadsheets/d/XXXXXXXX/edit"

const DEFAULT_DATA = {
  /* ---------- Profile: one value per key ---------- */
  profile: {
    logo: "Mohd Saud",
    greeting: "Hello, I'm",
    name_line1: "Mohd",
    name_line2: "Saud",
    hero_split: "Aspiring",
    hero_profession1: "Cloud DevOps",
    hero_profession2: "Engineer",
    about_title_highlight: "Discipline",
    about_title_rest: "Builds Freedom",
    // Wrap words in **double stars** to make them purple and bold.
    about_text:
      "I'm a **Cloud & DevOps** engineer in the making, with nearly four years of **customer-facing operations** experience. I build and secure infrastructure on **AWS** using Terraform, Docker and CI/CD, and I'm always learning something new.",
    contact_text: "Open to internships and entry-level Cloud / DevOps roles. Let's talk!",
    email: "mosaud1997@icloud.com",
    location: "Lucknow, Uttar Pradesh, India",
    linkedin: "https://www.linkedin.com/in/mohdsaud1",
    github: "https://github.com/Iamsaudkhan",
    whatsapp: "", // e.g. "https://wa.me/91XXXXXXXXXX" (leave empty to hide)
    resume: "assets/pdf/Mohd-Saud-Resume.pdf",
  },

  /* ---------- Projects (numbered automatically: 01, 02, ...) ---------- */
  projects: [
    {
      category: "DevSecOps",
      title: "Secure Cloud DevSecOps Pipeline",
      stack: "AWS, Terraform, GitHub Actions, Docker, Trivy, ECR, EC2, CloudWatch",
      status: "In progress",
      image: "",
      link: "",
      visible: "yes",
    },
    {
      category: "IaC",
      title: "AWS Infrastructure as Code",
      stack: "AWS, Terraform, S3, DynamoDB, IAM, VPC",
      status: "In progress",
      image: "",
      link: "",
      visible: "yes",
    },
    {
      category: "Web",
      title: "Personal Portfolio Website",
      stack: "HTML, CSS, JavaScript, GitHub Pages, Google Sheets",
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
      period: "Sep 2019 – May 2023",
      description:
        "Managed customer service in a high-volume automotive workshop: coordinated with technicians, handled client communication and escalations, and managed service documentation and billing.",
      visible: "yes",
    },
    {
      type: "Education",
      title: "B.Tech, Computer Science",
      organization: "Dr. A.P.J. Abdul Kalam Technical University (AKTU), Lucknow",
      period: "Graduated 2026",
      description:
        "Studied computer science fundamentals, programming, networking and problem solving, and moved into Cloud and DevOps through hands-on projects.",
      visible: "yes",
    },
    {
      type: "Education",
      title: "AWS Solutions Architect – Associate",
      organization: "Certification (in progress) · GCP Skills Boost labs",
      period: "Ongoing",
      description:
        "Preparing for AWS SAA and practising on Google Cloud Skills Boost labs to strengthen cloud architecture skills.",
      visible: "yes",
    },
    {
      type: "Education",
      title: "Diploma, Automobile Engineering",
      organization: "Integral University, Lucknow",
      period: "2018",
      description:
        "Built a strong technical base in automobile systems, which led to my first professional role in the automotive industry.",
      visible: "yes",
    },
  ],

  /* ---------- What I Offer (cards that open on click) ---------- */
  services: [
    {
      title: "Cloud & DevOps",
      description: "Building, automating and deploying infrastructure on AWS with Infrastructure as Code and CI/CD.",
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
      title: "Tools & Languages",
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
     { name: "Rahul Sharma", role: "Workshop Manager, Oneup Motors",
       rating: "5", text: "Saud handled ...", image: "", visible: "yes" } */
  testimonials: [],
};
