# Alice Shevtsova’s portfolio

A Russian-language UI/UX design portfolio presented as an interactive desktop. Visitors can open seven folders, explore three case studies and their galleries, and browse skills, experience, and tools. Desktop folder positions are saved in the browser. On phones, the folders form a scrollable two-column grid.

Laravel 13 serves a single Inertia page built with Vue 3, the Composition API, strict TypeScript, Tailwind CSS 4, and Vite. SQLite stores Laravel sessions and cache entries during local development. The portfolio content is versioned with the Vue application.

## Requirements

- PHP 8.3 or newer with Laravel’s required extensions and `pdo_sqlite`
- Composer 2
- Node.js 20.19+ on the 20.x line, or 22.12 and later, with npm
- A Playwright Chromium installation or Google Chrome for browser tests

## Install and configure

From a fresh clone, run the following commands. The PHP commands for creating files work on Windows, macOS, and Linux.

```sh
composer install
npm ci
php -r "file_exists('.env') || copy('.env.example', '.env');"
php artisan key:generate
php -r "file_exists('database/database.sqlite') || touch('database/database.sqlite');"
php artisan migrate
```

The example environment uses SQLite at `database/database.sqlite`. Set `APP_URL` in your local `.env` to the URL you open in the browser. On Windows PowerShell, use `npm.cmd` and `npx.cmd` if script execution is disabled.

## Run locally

Run Laravel and Vite in separate terminals.

```sh
php artisan serve
npm run dev
```

Open `http://127.0.0.1:8000`. With Laravel Herd, open the project’s linked `.test` domain and run Vite for hot reload. Select PHP 8.3 or newer in Herd.

To view the original HTML and its original video URLs, run `npm run preview:reference` and open `http://127.0.0.1:8765`.

## Checks

```sh
composer validate --strict
php artisan test
npm run types:check
npm run build
npx playwright install chromium
npm run test:browser
```

Playwright starts Laravel on port 8000 when needed. Stop Vite before running the browser tests against the production build. To test a running application, set `PLAYWRIGHT_BASE_URL` to its URL. Set `PLAYWRIGHT_CHANNEL=chrome` to use the installed Chrome binary. The suite covers five viewport sizes, navigation, persisted drag positions, keyboard focus, case-study galleries, and hover and touch video playback.

Laravel Boost is a development dependency. The project’s Codex configuration starts its MCP server with `php artisan boost:mcp`.

## Deploy

Use the PHP and Node versions listed above. Build the frontend on the deployment host or in CI and include `public/build` in the release.

```sh
composer install --no-dev --optimize-autoloader
npm ci
npm run build
php artisan migrate --force
php artisan optimize
```

Set `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL` to the HTTPS URL, and a persistent `APP_KEY` before running migrations and optimization. For SQLite, create an empty database before the first deployment and configure `DB_DATABASE` to point to a writable, persistent location. Give the PHP process write access to the database directory, `storage/`, and `bootstrap/cache/`. Point the web server’s document root at `public/`, serve its assets directly with normal HTTP byte-range support for MP4, and route application requests to `public/index.php`. Use `/up` for a health check.

## Project layout

| Location | Purpose |
| --- | --- |
| `routes/web.php` | Laravel entry point for the portfolio |
| `resources/js/pages/` and `resources/js/layouts/` | Inertia page, hash navigation, and portfolio layout |
| `resources/js/components/` and `resources/js/data/` | Canvas, dialogs, and Russian portfolio content |
| `resources/css/` and `resources/fonts/` | Tailwind utilities, site styles, and bundled fonts |
| `public/images/` | Original portrait, WebP covers and slides, About posters, and SVG logos |
| `public/videos/` | Four original MP4s used by the About dialog |
| `reference/` | Byte-preserved original HTML and the unused `yoga.mp4` |
| `tests/Feature/` and `tests/Browser/` | Laravel and Playwright tests |

The About dialog displays the original posters first. Its videos load on demand, play muted and inline, and loop. Hover plays the clips on desktop. Touch and keyboard users can activate the tiles directly. Reduced-motion settings disable hover-triggered playback. The MP4s retain the source encoding and dimensions.

Local visual comparisons can be saved under `.qa/`, which Git ignores alongside Playwright reports, generated builds, dependency folders, and local environment files.
