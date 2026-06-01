# Princeton University Chess Club — Website

A static website for the Princeton University Chess Club, mirroring the content
and structure of the original site at https://princetonchess.weebly.com/ —
rebuilt from scratch in plain HTML/CSS/JavaScript with custom styling, animations,
and a chess-piece cursor.

"Static" just means there's no server or database: the whole site is a handful of
files that a browser opens directly. That makes it simple, fast, free to host, and
easy to read.

---

## 1. How to view it

Easiest: double-click **`index.html`** — it opens in your browser.

For a more accurate preview (so links and the map behave exactly as they would
online), serve the folder with a tiny local web server:

```bash
cd "Prinecton Chess Club Website"
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

There is **no build step and no dependencies** to install. What you see is what
gets shipped.

---

## 2. What each file does

| File | What it is |
| --- | --- |
| `index.html` | **Home** — hero banner, mission, sponsors, current officers, meeting info |
| `events.html` | **Events** — announcements + full tournament history (2022–2025) with photos |
| `contact.html` | **Contact** — email, listserv note, guest policy, address, embedded map |
| `archive.html` | **Archive** — past officer boards (2022–2024) with their bios |
| `styles.css` | **All the styling** — colours, fonts, layout, and animations, shared by every page |
| `script.js` | **All the behaviour** — custom cursor, scroll animations, photo fallbacks, etc. |
| `README.md` | This file |
| `.gitignore` | Tells git which files to ignore (OS junk, zip archives) |

The four `.html` files are the four pages of the site, mirroring the original's
**Home / Events / Contact / Archive** navigation. Every page links to the same
`styles.css` and `script.js`, so a change to either of those updates the whole site.

---

## 3. How the code is organised (so you can read it)

### HTML files (the content)
Each page follows the same skeleton, and every section is labelled with an
HTML comment (`<!-- LIKE THIS -->`) explaining what it is:

```
<nav> ...........  the top navigation bar (identical on every page)
<header class="hero"> ...  the big animated banner (home page only)
<main> ..........  the actual page content, broken into <section>s
<footer> ........  address + contact (identical on every page)
<script src="script.js">  loads the behaviour at the very end
```

**To edit text or photos, you only touch the `.html` files.** For example, to add
a new tournament to the Events page, copy one `<div class="event-entry">…</div>`
block and change the title, date, and description.

### `styles.css` (the look)
The top of the file has a numbered table of contents. The most useful part is the
`:root` block at the top — it defines the site's colours and sizes as **variables**:

```css
:root {
  --orange: #e87722;   /* Princeton orange */
  --black:  #121212;
  --paper:  #faf8f4;   /* page background */
  ...
}
```

Everywhere else, colours are written as `var(--orange)` etc. So if you want to
recolour the whole site, **change one value here** and it cascades everywhere.

### `script.js` (the behaviour)
The top of the file has a plain-English summary of every feature. The two you're
most likely to care about:

- **Custom cursor** — the arrow is hidden and replaced by a chess piece that
  follows your mouse (a knight ♞ normally, a glowing queen ♛ over clickable
  things). This automatically turns off on touchscreens and for visitors who
  prefer reduced motion.
- **Photo fallback** — if an image can't load, it's swapped for a clean
  chess-piece placeholder instead of a broken-image icon.

---

## 4. Photos

The photos and sponsor logos are loaded directly from the original Weebly site's
image URLs (so they match exactly). If you'd rather host them yourself:

1. Download the images into an `images/` folder here.
2. In the `.html` files, change each `src="https://princetonchess.weebly.com/..."`
   to `src="images/your-file.jpg"`.

Every `<img>` that shows a photo has `class="photo"` and a `data-label="..."`.
If the image ever fails, `script.js` shows that label inside a styled placeholder,
so the layout never breaks.

---

## 5. Git — what it is and what's set up

**Git** is a version-control tool: it takes snapshots ("commits") of your files so
you can see history, undo changes, and collaborate. This folder is already a git
repository.

What's already done:

- The folder was initialised as a git repo (`git init`).
- A `.gitignore` excludes OS junk (`.DS_Store`) and `.zip` archives.
- Commits have been made capturing the site's progress.

Useful everyday commands (run them inside this folder):

```bash
git status                 # see what you've changed since the last snapshot
git add -A                 # stage all your changes for the next snapshot
git commit -m "Your note"  # save a snapshot with a short description
git log --oneline          # list past snapshots, newest first
```

### Putting it on GitHub (and adding collaborators)

You need a GitHub account for this part. With the GitHub CLI (`brew install gh`):

```bash
gh auth login                                   # sign in to GitHub once
gh repo create princeton-chess-club --public --source=. --remote=origin --push
```

That one `gh repo create` line makes the repo under your account and uploads it.
Prefer the website? Create an empty repo at https://github.com/new, then:

```bash
git remote add origin https://github.com/<your-username>/princeton-chess-club.git
git branch -M main
git push -u origin main
```

Add collaborators on the repo page under **Settings → Collaborators → Add people**.

### Free hosting (optional)
Because the site is plain HTML, **GitHub Pages** can host it for free: in the repo,
go to **Settings → Pages**, pick the `main` branch, and your site goes live at
`https://<your-username>.github.io/princeton-chess-club/`.

---

## 6. Meetings

**Fridays, 7:00–9:00 PM · Campus Club, 5 Prospect Ave., Princeton, NJ 08544**
Email: princeton.chess.club@gmail.com
