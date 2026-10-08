# Mohd Saud: Portfolio Website

Personal portfolio for my Cloud / DevOps journey. Plain HTML, CSS and JavaScript (no framework).
Content (profile, skills, projects) can be edited from a Google Sheet, with no code changes.

## Run locally
Run `python3 -m http.server` and open http://localhost:8000
(opening `index.html` directly also works, but Google Sheet loading needs http).

## Deploy (free)
GitHub repo -> Settings -> Pages -> Deploy from branch -> `main` / root.

## Update the site from Google Sheets (one-time setup)
1. Go to drive.google.com -> upload `portfolio-data.xlsx` -> open it with Google Sheets
   (right-click -> Open with -> Google Sheets), then File -> Save as Google Sheets.
2. File -> Share -> **Publish to web**. For EACH tab (Profile, Skills, Projects):
   choose that tab, format **Comma-separated values (.csv)**, click Publish, copy the link.
3. Paste the 3 links into `SHEET_URLS` at the top of `script.js`, commit and push.
4. From now on: edit the Google Sheet and refresh the site (Google can take a few minutes to publish edits).

Sheet rules:
- Separate multiple items in one cell with `;`
- `visible` = `no` hides a row. Status = `In progress` or `Completed`.
- Do not rename the column headers or the `key` names in the Profile tab.
- If a sheet fails to load, the site silently falls back to the defaults in `script.js`.

## Other edits
- Colors: `:root` variables at the top of `style.css`
- Resume: replace `resume.pdf`
