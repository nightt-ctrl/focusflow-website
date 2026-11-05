# FocusFlow website

A minimal React website for Vercel. Includes the home page, download page, illustrated setup guide, privacy overview and release notes. React components are prerendered to HTML, then hydrated for interactive controls. Actual app screens are used, with controlled data.

## Preview locally

The complete ZIP includes a ready-built React preview and both app downloads. Extract everything, then double-click **Preview Website.cmd**. You do not need to install React dependencies just to view the supplied preview. Close its server window before starting it again.

To edit the React source and rebuild, install Node.js 20 or later and pnpm 11.25, then open a terminal in this folder and run:

```sh
pnpm install
pnpm build
node scripts/serve.mjs
```

Open http://127.0.0.1:4173. Both local download links use the actual Windows 0.6.0 ZIP and Android Parent 0.3.0 APK in `downloads/`.

The Desktop project and complete website ZIP include both release files, so the local preview works after extraction. The Windows ZIP remains excluded from Git and Vercel source uploads by `.gitignore` and `.vercelignore`; use a public release URL when publishing as described below.

## Publish on Vercel when ready

1. Create a Vercel account and a GitHub repository for this website.
2. The Windows ZIP is about 124 MB. Keep it out of the Git source and Vercel CLI upload: it exceeds Vercel Hobby's 100 MB source upload limit. Publish that ZIP as a GitHub Release asset, or place it in other public file hosting, then copy its direct HTTPS download URL.
3. Commit the website source, including the small Android APK in `downloads/`. `.gitignore` already excludes the Windows ZIP and generated `dist/`.
4. In Vercel, import the website repository. Framework preset: **Other**. Build command: `node scripts/build.mjs`. Output directory: `dist`. These are also specified in `vercel.json`.
5. Add an environment variable named `WINDOWS_DOWNLOAD_URL` containing the actual public HTTPS URL of the Windows ZIP. The production build deliberately stops with an explanation until that URL is supplied, rather than publishing a broken download button.
6. Deploy. The Android APK can stay with the site. To host it elsewhere too, set `ANDROID_DOWNLOAD_URL` to its direct HTTPS URL.

There is no Vercel account connected and no production site has been published. No MCP connection is necessary for the GitHub import workflow. If a repository is public, include only the website files, not the main project workspace or report folders.

Vercel source upload limits: https://vercel.com/docs/limits#static-file-uploads

## Updating downloads

Replace the release files and update filenames, versions and SHA-256 values in `releases.json`, `src/content.jsx` and `scripts/build-react.mjs`. Current checksums correspond to the provided unchanged app packages. If you replace a file at an external URL, its bytes must match the listed checksum. Rebuild and check both download links before publishing.

## Design and assets

- FocusFlow's existing approved black and white logo.
- Real Windows and Android screenshots, without live family information.
- Inter font, self-hosted. Its SIL Open Font License is included in `public/assets/Inter-LICENSE.txt`.
- Original CSS and decorative contour drawing. No code, images, logos or copy from the reference website were reused.
- React-powered keyboard-accessible tabs, native FAQ accordions, mobile navigation, scroll reveals and hover animations. React is bundled locally; there are no third-party runtime CDN requests.
- Scroll-linked fades follow the visitor's scroll position, with a visible rise and blur-to-clear effect. Animations are enabled by default; the footer's Animations control lets visitors switch them off, saved locally in their browser.
- React and React DOM are distributed under their included MIT licenses in the built assets folder.

The Android download is a debug-signed development APK. The website describes the app's actual local-network and account limitations. The report and apps are not modified by this website project.
