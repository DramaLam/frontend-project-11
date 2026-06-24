// @ts-nocheck
/* eslint-disable no-restricted-syntax */
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:5173');
});

const URLS = [
  'https://lorem-rss.hexlet.app/feed',
  'https://lorem-rss.hexlet.app/feed?unit=second',
];

const testCasesToValidateUrl = [
  ['not valid url', 'Ссылка должна быть валидным URL', 'rss url....'],
  ['empty string', 'Не должно быть пустым', ''],
  ['no rss on page', 'Ресурс не содержит валидный RSS', 'https://google.com'],
  ['correct rss url', 'RSS успешно загружен', 'https://lorem-rss.hexlet.app/feed'],
];

const testCasesToAddUrl = [
  ['empty string', 'Не должно быть пустым', '', 'Не должно быть пустым', ''],
  ['adding two different rss urls', 'RSS успешно загружен', 'https://lorem-rss.hexlet.app/feed', 'RSS успешно загружен', 'https://lorem-rss.hexlet.app/feed?unit=second'],
  ['adding same rss url twice', 'RSS успешно загружен', 'https://lorem-rss.hexlet.app/feed', 'RSS уже существует', 'https://lorem-rss.hexlet.app/feed'],
];

const waitForSuccess = async (page) => {
  await page.waitForSelector('[data-type="posts"] ul li', { timeout: 15000 });
};

test.describe('Common test', () => {
  test('has title', async ({ page }) => {
    await page.goto('http://localhost:5173/');
    await expect(page).toHaveTitle('frontend-project-11');
  });
});

test.describe('Validate Url', () => {
  for (const [name, error, url] of testCasesToValidateUrl) {
    test(`Test error: ${name}`, async ({ page }) => {
      const newUrl = page.getByPlaceholder('Ссылка RSS');
      const postButton = page.getByText('Добавить');

      await newUrl.fill(url);
      await postButton.click();
      await page.waitForSelector('#messageContainer:not(:empty)', { timeout: 15000 });
      await expect(page.locator('#messageContainer')).toHaveText([
        error,
      ], { timeout: 15000 });
    });
  }
});

test.describe('Trying add Url', () => {
  for (const [name, error1, url1, error2, url2] of testCasesToAddUrl) {
    test(`Test error: ${name}`, async ({ page }) => {
      const newUrl = page.getByPlaceholder('Ссылка RSS');
      const postButton = page.getByText('Добавить');

      await newUrl.fill(url1);
      await postButton.click();
      await page.waitForSelector('#messageContainer:not(:empty)', { timeout: 7500 });
      await expect(page.locator('#messageContainer')).toHaveText([
        error1,
      ], { timeout: 7500 });

      await newUrl.fill(url2);
      await postButton.click();
      await page.waitForSelector('#messageContainer:not(:empty)', { timeout: 7500 });
      await expect(page.locator('#messageContainer')).toHaveText([
        error2,
      ], { timeout: 7500 });
    });
  }
});

test.describe('Check posts', () => {
  test('open modal and close by button', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    await newUrl.fill(URLS[1]);
    await postButton.click();
    await waitForSuccess(page);

    const lookPostButton = page.locator('li').filter({ hasText: /Lorem ipsum/ }).getByRole('button').first();
    await lookPostButton.click();

    const closeButton = page.getByRole('button', { name: 'Закрыть' });
    await closeButton.click();

    await expect(page.locator('#modal')).toBeHidden();
  });

  test('open modal and click on "Читать полностью"', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    await newUrl.fill(URLS[1]);
    await postButton.click();
    await waitForSuccess(page);

    const lookPostButton = page.locator('li').filter({ hasText: /Lorem ipsum/ }).getByRole('button').first();
    await lookPostButton.click();

    const readMoreButton = page.getByRole('link', { name: 'Читать полностью' });
    const pagePromise = page.waitForEvent('popup');
    await readMoreButton.click();
    await pagePromise;

    const popup = await pagePromise;
    await popup.close();
  });

  test('open modal and close by "X" mark', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    await newUrl.fill(URLS[1]);
    await postButton.click();
    await waitForSuccess(page);

    const lookPostButton = page.locator('li').filter({ hasText: /Lorem ipsum/ }).getByRole('button').first();
    await lookPostButton.click();

    const closeButton = page.getByLabel('Close');
    await closeButton.click();

    await expect(page.locator('#modal')).toBeHidden();
  });

  test('post link marked as read after click', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    await newUrl.fill(URLS[0]);
    await postButton.click();
    await waitForSuccess(page);

    const firstPostLink = page.locator('.posts li a').first();
    await expect(firstPostLink).toHaveClass(/fw-bold/);

    const firstPreviewBtn = page.locator('.posts li').first().getByRole('button', { name: 'Просмотр' });
    await firstPreviewBtn.click();

    await expect(firstPostLink).toHaveClass(/link-secondary/);
  });
});
