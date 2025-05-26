// @ts-nocheck
/* eslint-disable no-restricted-syntax */
const { test, expect } = require('@playwright/test');

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:8080');
});

const URLS = [
  'https://dev.to/feed',
  'https://lorem-rss.hexlet.app/feed',
  'https://lorem-rss.herokuapp.com/feed?unit=hour',
];

const testCasesToValidateUrl = [
  ['not valid url', 'Ссылка должна быть валидным URL', 'rss url....'],
  ['empty string', 'Поле не должно быть пустым', '          '],
  ['no rss on page', 'Ресурс не содержит валидный RSS', 'https://google.com'],
  ['wrong url', 'Ошибка сети', 'https://192.151.161.11'],
  ['correct rss url', 'RSS успешно загружен', 'https://lorem-rss.herokuapp.com/feed?unit=hour'],
];

const testCasesToAddUrl = [
  ['empty string', '', '', '', ''],
  ['adding to different rss urls', 'RSS успешно загружен', 'https://dev.to/feed', 'RSS успешно загружен', 'https://lorem-rss.hexlet.app/feed'],
  ['adding to same rss urls', 'RSS успешно загружен', 'https://dev.to/feed', 'RSS уже существует', 'https://dev.to/feed'],
];

test.describe('Common test', () => {
  test('has title', async ({ page }) => {
    await page.goto('http://localhost:8080/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle('RSS agregator');
  });
});

test.describe('Validate Url', () => {
  for (const [name, error, url] of testCasesToValidateUrl) {
    test(`Test error: ${name}`, async ({ page }) => {
      const newUrl = page.getByPlaceholder('Ссылка RSS');
      const postButton = page.getByText('Добавить');

      // Trying first wrong url
      await newUrl.fill(url);
      await postButton.click();

      await expect(page.locator('#messageContainer')).toHaveText([
        error,
      ], { timeout: 10000 });
    });
  }
});

test.describe('Trying add Url', () => {
  for (const [name, error1, url1, error2, url2] of testCasesToAddUrl) {
    test(`Test error: ${name}`, async ({ page }) => {
      const newUrl = page.getByPlaceholder('Ссылка RSS');
      const postButton = page.getByText('Добавить');

      // Add first url to feeds list
      await newUrl.fill(url1);
      await postButton.click();

      await expect(page.locator('#messageContainer')).toHaveText([
        error1,
      ], { timeout: 7500 });

      // Add second url to feeds list
      await newUrl.fill(url2);
      await postButton.click();

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

    // Add url to feeds list
    await newUrl.fill(URLS[2]);
    await postButton.click();

    const date = new Date().toISOString();

    // Click on "Preview" button
    const lookPostButton = page.locator('li').filter({ hasText: `Lorem ipsum ${date.slice(0, 14)}00:` }).getByRole('button');
    await lookPostButton.click();

    // Click on "Close" button
    const closeButton = page.getByRole('button', { name: 'Закрыть' });
    await closeButton.click();
  });

  test('open modal and click on "Read more"', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    // Add url to feeds list
    await newUrl.fill(URLS[2]);
    await postButton.click();

    const date = new Date().toISOString();

    // Click on "Preview" button
    const lookPostButton = page.locator('li').filter({ hasText: `Lorem ipsum ${date.slice(0, 14)}00:` }).getByRole('button');
    await lookPostButton.click();

    // Click on "Read more" button
    const readMoreButton = page.getByRole('link', { name: 'Читать полностью' });
    await readMoreButton.click();

    // Wait new page loading
    const page4Promise = page.waitForEvent('popup');
    await page4Promise;
  });

  test('open modal and close by "X" mark', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    // Add url to feeds list
    await newUrl.fill(URLS[2]);
    await postButton.click();

    const date = new Date().toISOString();

    // Click on "Preview" button
    const lookPostButton = page.locator('li').filter({ hasText: `Lorem ipsum ${date.slice(0, 14)}00:` }).getByRole('button');
    await lookPostButton.click();

    // Click on "Close" mark
    const readMoreButton = page.getByLabel('Close');
    await readMoreButton.click();
  });

  test('check click on the post', async ({ page }) => {
    const newUrl = page.getByPlaceholder('Ссылка RSS');
    const postButton = page.getByText('Добавить');

    // Add url to feeds list
    await newUrl.fill(URLS[2]);
    await postButton.click();

    const date = new Date().toISOString();

    // Click on "Preview" button
    const lookPostButton = page.getByRole('link', { name: `Lorem ipsum ${date.slice(0, 14)}00:` });
    await lookPostButton.click();

    await expect(page.getByText('Example Domain This domain is')).toHaveText([
      `
        Example Domain
        This domain is for use in illustrative examples in documents. You may use this
        domain in literature without prior coordination or asking for permission.
        More information...
      `,
    ]);
  });
});
