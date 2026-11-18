# Rowkeeper

A browser based knitting chart tracker. Upload a chart or draw one on a pixel grid, align rows, and keep your place while you knit.

## Use the hosted app

The site is a static app and needs no server-side database or account. On a secure hosted version, visit once while online. Rowkeeper then caches its app files so you can open it without a connection. Use your browser's **Install app** or **Add to Home Screen** command to put it on your device. Browser support and the exact menu wording vary.

You can also download `Rowkeeper.zip` from the site and open `index.html` from the extracted folder. This file-based copy works offline without visiting the hosted site.

## Publish with GitHub Pages

1. Create a public GitHub repository for Rowkeeper.
2. Upload the contents of this folder to the repository root, keeping the files and folders together.
3. Open **Settings → Pages** and choose **Deploy from a branch**.
4. Select the `main` branch and `/(root)`, then save.
5. After GitHub Pages publishes the site, visit its HTTPS address once while online to cache the app for offline use.

This is a static site: it has no build step and no secrets to configure. Keep asset paths relative so the app also works when hosted under a repository path.

## Projects and backups

Projects, uploaded charts, notes, and row progress are kept in IndexedDB in the visitor's browser on that device. They do not sync to GitHub or between devices. The app's **Export backup** and **Restore backup** controls let people move or preserve projects. Encourage visitors to export backups regularly.

The GitHub repository and GitHub Pages site are public. Do not put personal charts, backups, or private information in this repository.

## Local use

Open `index.html` in a modern browser. Upload a chart or create a pixel chart to get started. The app has no external library or service dependency.
