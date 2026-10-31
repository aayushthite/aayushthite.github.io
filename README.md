# Aayush Thite | DevOps & Cloud portfolio

Plain HTML, CSS and JavaScript. No build step, no installs. Open `index.html` in a browser to preview it.

## Put it live on GitHub Pages (free)

1. On GitHub, create a new **public** repository named `aayushthite.github.io` (this exact name gives you the address `https://aayushthite.github.io`). A repo with any other name works too, with the address `https://aayushthite.github.io/<repo-name>/`.
2. Unzip this package. Upload everything inside the folder (`index.html`, `css`, `js`, `assets`, `.nojekyll`, `README.md`) to the repo root: on the repo page choose **Add file, then Upload files**, drag them in and commit. Keep the folders as they are.
3. Open **Settings, then Pages**. Under **Build and deployment** choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and Save.
4. Wait one to two minutes and open the address. Later edits go live the same way: change a file, commit, wait a minute.

The hidden file `.nojekyll` must be uploaded too. If your file picker skips hidden files, create it on GitHub with Add file, Create new file, named `.nojekyll`, and commit it empty.

## Where to edit things

| What | File |
|---|---|
| Email, LinkedIn, résumé link, project repo links | `js/config.js` |
| Projects (text, tags, step-by-step visuals) | search `var WORK` in `js/app.js` |
| Tools, the Technical stack flow and the Azure/AWS counterparts | search `var SK` and `var FLOW` in `js/app.js` |
| Experience timeline entries | search `var items` in `js/app.js` |
| Colours, fonts, spacing | top of `css/style.css` (`:root` variables) |
| Tool and cloud logos | `js/logos.js` |

## Add your résumé

Put the PDF in `assets/` (for example `assets/Aayush-Thite-Resume.pdf`) and set `resume: "assets/Aayush-Thite-Resume.pdf"` in `js/config.js`.

## Add the NovaBank and GitOps repo links

In `js/config.js`, fill in `nova` and `gitops` under `repos`. The "Repository link coming soon" text becomes a "View on GitHub" button.

## Notes

- Fonts (Google Fonts) and smooth scrolling (Lenis) load from public CDNs, so the visitor needs an internet connection. The page still works and stays readable if they are blocked.
- Icons: AWS icons are from the AWS Architecture Icons set, Azure icons from Microsoft's Azure icon set, other logos from their projects. These are trademarks of their owners and are used here only to name the tools.
# aayushthite.github.io
