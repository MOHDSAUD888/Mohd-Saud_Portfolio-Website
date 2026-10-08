# Mohd Saud: Portfolio Website

Personal portfolio for my Cloud / DevOps journey, built with plain HTML, CSS and JavaScript (no framework, no build step).

Design based on the [Panda Coders portfolio](https://habib277672.github.io/Personal-Portfolio/) by Habib Ur Rehman:
same layout, colours, fonts and animations, with my own content and photos.

## Update the content with Excel (no code)
All text, links, projects, experience, skills and testimonials live in **`portfolio-data.xlsx`**.

1. Download `portfolio-data.xlsx` from this repository and open it in Excel.
2. Edit the tabs **Profile**, **Projects**, **Experience**, **Services**, **Testimonials**
   (the **How to use** tab inside the file repeats these rules).
3. Save it with the same name.
4. On GitHub: **Add file → Upload files** → drop the file → **Commit changes**.
5. Wait 1-2 minutes and refresh the website.

Rules:
- Don't rename the tabs or the column names in row 1. In **Profile** only change the `value` column.
- Several items in one cell → separate with commas (`AWS, Terraform, Docker`). New line in a cell → **Alt+Enter**.
- `visible` = `no` hides a row without deleting it.
- Images: upload the picture to `assets/img/` and write `assets/img/your-file.png` in the cell
  (`hero_image` / `about_image` in Profile, `image` in Projects / Testimonials).
- In `about_text`, wrap words in `**double stars**` to make them purple.
- Testimonials: only real quotes from real people. The section stays hidden while the tab is empty.

### Optional: live editing with Google Sheets
Upload `portfolio-data.xlsx` to Google Drive → open with Google Sheets → **Share → Anyone with the link → Viewer**,
then paste the sheet link into `SHEET_URL` at the top of `assets/js/data.js`. Edits in the sheet show up on the
site after a refresh, without uploading anything to GitHub.

The site reads its content in this order: Google Sheet (if `SHEET_URL` is set) → `portfolio-data.xlsx` → `assets/js/data.js`
(fallback, used offline or when a file can't be read). It never breaks because of a bad sheet: a tab with wrong
columns is ignored and the fallback content is used for that tab.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```
(Opening `index.html` directly also works, but then the Excel file can't be read and `data.js` is used.)

## Deploy (free) with GitHub Pages
Repository → **Settings → Pages** → Source: *Deploy from a branch* → choose the branch and `/ (root)` → Save.

## Folder structure
```
index.html               page structure + icon sprite
portfolio-data.xlsx      ALL the content (edit this)
assets/css/styles.css    design (change --hue to change the theme colour)
assets/js/data.js        fallback content + SHEET_URL setting
assets/js/main.js        loads the content, renders the sections, animations
assets/img/              photos (and project screenshots)
assets/pdf/              resume
assets/fonts/            Montserrat + Unbounded (self-hosted)
assets/vendor/           third-party libraries (see below)
```

## Third-party code
| Library | Used for | License |
|---|---|---|
| [Swiper](https://swiperjs.com) 11.2.10 | projects carousel | MIT |
| [anime.js](https://animejs.com) 4.1.4 | animated title letters | MIT |
| [ScrollReveal](https://scrollrevealjs.org) 4.0.9 | scroll animations | GPL-3.0 (free for non-commercial / open-source use) |
| [SheetJS](https://sheetjs.com) 0.20.3 (mini) | reading the Excel file in the browser | Apache-2.0 |
| [Remix Icon](https://remixicon.com) 4.6.0 | icons (inline SVG sprite) | Apache-2.0 |
| Montserrat, Unbounded | fonts | SIL Open Font License |

Everything is served from this repository, so the site doesn't depend on any CDN.
