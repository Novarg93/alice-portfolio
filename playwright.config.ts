import { defineConfig } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:8000';

export default defineConfig({
    testDir: './tests/Browser',
    timeout: 45000,
    use: {
        baseURL,
        browserName: 'chromium',
        channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
        reducedMotion: 'reduce',
        trace: 'retain-on-failure',
    },
    webServer: process.env.PLAYWRIGHT_BASE_URL
        ? undefined
        : {
              command: 'php artisan serve --host=127.0.0.1 --port=8000 --no-reload',
              url: baseURL + '/up',
              reuseExistingServer: !process.env.CI,
          },
});
