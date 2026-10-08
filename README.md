# Mohd Saud: Portfolio Website

Personal portfolio for my Cloud / DevOps journey, built with plain HTML, CSS and JavaScript (no framework).
Layout inspired by [Habib Ur Rehman's portfolio](https://habib277672.github.io/Personal-Portfolio/).

All text (profile, projects, experience, skills, testimonials) can be changed from a **Google Sheet**, with no code.
No external CDN: fonts and icons (Remix Icon, inline SVG sprite in `index.html`) are bundled, so the site works offline too.

## Folder structure
```
index.html              page structure (sections)
assets/css/styles.css   all design (change --hue to change the theme color)
assets/js/data.js       default content + SHEET_URL setting
assets/js/main.js       renders content, Google Sheet loader, animations
assets/img/             photos (and project screenshots)
assets/fonts/           Montserrat + Unbounded (self-hosted, no Google Fonts call)
assets/pdf/             resume
portfolio-data.xlsx     template for the Google Sheet
```

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy (free) with GitHub Pages
Repo → **Settings → Pages** → Source: *Deploy from a branch* → choose the branch and `/ (root)` → Save.

## Edit content from Google Sheets (one-time setup)
1. Upload `portfolio-data.xlsx` to Google Drive → open it → **File → Save as Google Sheets**.
2. Click **Share** → General access: **Anyone with the link → Viewer**.
3. Copy the sheet link and paste it into `SHEET_URL` at the top of `assets/js/data.js`. Commit and push.
4. Done. Edit the sheet, then refresh the website.

Sheet rules:
- Keep the tab names exactly: `Profile`, `Projects`, `Experience`, `Services`, `Testimonials`.
- Do not rename the column headers (first row) or the `key` names in `Profile`.
- Multiple items in one cell → separate with commas (`AWS, Terraform, Docker`).
- `visible` = `no` hides a row. Testimonials stay hidden until you add one.
- In `about_text`, wrap words in `**double stars**` to make them purple.
- If a value disappears on the site, select the column → **Format → Number → Plain text**.
- If the sheet can't be loaded, the site falls back to `data.js`, so it never breaks.

## Add a project screenshot
Put the image in `assets/img/` (e.g. `project-1.png`) and write `assets/img/project-1.png` in the `image` column.
