import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

async function openPortfolio(page: Page, hash = '') {
    await page.goto('/' + hash);
    await expect(page.getByRole('progressbar')).toHaveCount(0);
}

const viewports = [
    { width: 1440, height: 900 },
    { width: 1280, height: 720 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 375, height: 812 },
];

for (const viewport of viewports) {
    test('board and section navigation at ' + viewport.width + ' × ' + viewport.height, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('console', (message) => {
            if (message.type() === 'error') errors.push(message.text());
        });
        page.on('requestfailed', (request) => errors.push(request.url() + ' ' + request.failure()?.errorText));
        page.on('response', (response) => {
            if (response.status() >= 400) errors.push(response.status() + ' ' + response.url());
        });
        await page.setViewportSize(viewport);
        await openPortfolio(page);
        await expect(page.getByRole('heading', { name: 'Алиса Шевцова' })).toBeVisible();
        await expect(page.locator('.obj')).toHaveCount(7);
        await expect(page.getByRole('link', { name: 'Связаться' })).toHaveAttribute(
            'href',
            'https://t.me/leviaia',
        );
        await expect(page.getByRole('link', { name: 'Смотреть CV' })).toHaveAttribute(
            'href',
            /drive\.google\.com/,
        );
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
        const burger = page.getByRole('button', { name: 'Меню' });
        await burger.click();
        await expect(burger).toHaveAttribute('aria-expanded', 'true');
        await page.keyboard.press('Escape');
        await expect(burger).toBeFocused();
        await expect(burger).toHaveAttribute('aria-expanded', 'false');
        await burger.click();
        await page.getByRole('button', { name: 'Проекты', exact: true }).click();
        const modal = page.getByRole('dialog', { name: 'Проекты' });
        await expect(modal.getByRole('heading', { name: 'Избранные проекты' })).toBeVisible();
        await modal.getByRole('button', { name: /Фото-гид/ }).click();
        await expect(page).toHaveURL(/#photo-guide$/);
        await expect(page.getByRole('link', { name: 'Figma' })).toHaveAttribute('href', /figma\.com/);
        await page.getByRole('button', { name: 'Закрыть' }).click();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        await expect(burger).toBeFocused();
        expect(errors).toEqual([]);
    });
}

test('desktop folders drag, persist, reset, and support the keyboard', async ({ page }) => {
    await page.setViewportSize(viewports[0]);
    await openPortfolio(page);
    const folder = page.getByRole('button', { name: 'Обо мне' });
    const original = await folder.boundingBox();
    expect(original).not.toBeNull();
    const { x, y, width, height } = original!;
    await page.mouse.move(x + width / 2, y + height / 2);
    await page.mouse.down();
    await page.mouse.move(x + width / 2 + 90, y + height / 2 - 45, { steps: 8 });
    await page.mouse.up();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect.poll(async () => Math.round((await folder.boundingBox())!.x - x)).toBe(90);
    await page.reload();
    await expect(page.getByRole('progressbar')).toHaveCount(0);
    await expect.poll(async () => Math.round((await folder.boundingBox())!.x - x)).toBe(90);
    await page.getByRole('button', { name: 'Разложить заново' }).click();
    await expect.poll(async () => Math.round((await folder.boundingBox())!.x - x)).toBe(0);
    await folder.focus();
    await page.keyboard.press('ArrowRight');
    await expect.poll(async () => Math.round((await folder.boundingBox())!.x - x)).toBe(8);
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog', { name: 'Обо мне' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(folder).toBeFocused();
});

test('deep links, case details, gallery controls, skills, and tools', async ({ page }) => {
    await openPortfolio(page, '#photo-guide');
    const dialog = page.getByRole('dialog');
    const more = dialog.getByRole('button', { name: 'Подробнее' });
    await more.click();
    await expect(more).toHaveAttribute('aria-expanded', 'true');
    await expect(dialog.getByRole('heading', { name: 'Бизнес-задача' })).toBeVisible();
    const slider = dialog.getByRole('slider');
    await dialog.getByRole('button', { name: 'Следующий слайд' }).click();
    await expect(slider).toHaveAttribute('aria-valuenow', '2');
    await slider.press('End');
    await expect(slider).toHaveAttribute('aria-valuenow', '8');
    await expect(dialog.getByRole('button', { name: 'Следующий слайд' })).toBeDisabled();
    const bar = (await slider.boundingBox())!;
    await page.mouse.click(bar.x + bar.width / 2, bar.y + bar.height / 2);
    await expect(slider).toHaveAttribute('aria-valuenow', /[45]/);
    const gallery = page.locator('.pslider');
    await gallery.scrollIntoViewIfNeeded();
    const cover = (await gallery.boundingBox())!;
    const slideBeforeSwipe = Number(await slider.getAttribute('aria-valuenow'));
    await page.mouse.move(cover.x + cover.width * 0.75, cover.y + cover.height / 2);
    await page.mouse.down();
    await page.mouse.move(cover.x + cover.width * 0.25, cover.y + cover.height / 2, { steps: 8 });
    await page.mouse.up();
    await expect(slider).toHaveAttribute('aria-valuenow', String(slideBeforeSwipe + 1));
    await dialog.getByRole('button', { name: /следующий Boosting Platform/ }).click();
    await expect(page).toHaveURL(/#boosting$/);
    await page.goBack();
    await expect(dialog).toHaveAccessibleName('Фото-гид');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Hard & Soft skills' }).click();
    await dialog.getByRole('button', { name: 'Soft skills' }).click();
    await expect(dialog.getByText('Внимание к деталям', { exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Стек' }).click();
    await dialog.getByRole('button', { name: 'Figma, Дизайн и сборка' }).hover();
    await expect(dialog.locator('.tw-core')).toHaveText('Макеты и сайты');
    await dialog.getByRole('button', { name: 'Claude, AI для текста' }).focus();
    await expect(dialog.locator('.tw-core')).toHaveText('Тексты и структура');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Опыт работы' }).click();
    await expect(dialog.getByRole('heading', { name: 'Графический дизайнер' })).toBeVisible();
});

test('about clips play on desktop hover with no eager video downloads', async ({ page }) => {
    await page.setViewportSize(viewports[0]);
    const mediaRequests: string[] = [];
    page.on('request', (request) => {
        if (request.resourceType() === 'media') mediaRequests.push(request.url());
    });
    await openPortfolio(page, '#about');
    await page.getByRole('button', { name: 'Йога на воде' }).hover();
    await expect(page.locator('.abph video[src]')).toHaveCount(0);
    expect(mediaRequests).toEqual([]);
    await page.mouse.move(5, 5);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    for (const file of ['yoga-2', 'cat', 'fortress', 'it-picnic']) {
        const tiles = page.locator('.abph figure');
        const tile = tiles.filter({
            has: page.locator('img[src$="about-' + (file === 'yoga-2' ? 'yoga' : file) + '.webp"]'),
        });
        const response = page.waitForResponse(
            (response) => response.url().endsWith('/videos/' + file + '.mp4') && response.ok(),
        );
        await tile.getByRole('button').hover();
        expect((await response).headers()['content-type']).toContain('video/mp4');
        const video = tile.locator('video');
        await expect
            .poll(() =>
                video.evaluate((player) => {
                    const video = player as HTMLVideoElement;
                    return (
                        !video.paused &&
                        video.currentTime > 0 &&
                        video.muted &&
                        video.loop &&
                        video.playsInline &&
                        video.videoWidth === 720 &&
                        video.videoHeight === 1280
                    );
                }),
            )
            .toBe(true);
        await page.mouse.move(5, 5);
        await expect.poll(() => video.evaluate((player) => (player as HTMLVideoElement).paused)).toBe(true);
    }
});

test.describe('touch and reduced motion', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    test('videos play only after tapping on touch and keep the board scroll position', async ({ page }) => {
        await openPortfolio(page);
        const folder = page.getByRole('button', { name: 'Обо мне' });
        await page.evaluate(() => window.scrollTo(0, 280));
        const scroll = await page.evaluate(() => window.scrollY);
        await folder.tap();
        const tile = page.getByRole('button', { name: 'Видео с котом' });
        await expect(tile).toHaveAttribute('aria-pressed', 'false');
        await expect(page.locator('.abph video[src]')).toHaveCount(0);
        await tile.tap();
        await expect(tile).toHaveAttribute('aria-pressed', 'true');
        await tile.tap();
        await expect(tile).toHaveAttribute('aria-pressed', 'false');
        await page.getByRole('button', { name: 'Закрыть' }).tap();
        await expect(page.getByRole('dialog')).toHaveCount(0);
        expect(await page.evaluate(() => window.scrollY)).toBe(scroll);
    });
});
