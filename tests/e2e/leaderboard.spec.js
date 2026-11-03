const { test, expect } = require('@playwright/test');
const path = require('path');

const fileUrl = 'file://' + path.resolve(__dirname, '../../leaderboard-standalone.html');

test.describe('Leaderboard Suite E2E Integration Tests', () => {

  test('Authentic retro craft palette and zero console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto(fileUrl);
    await page.waitForTimeout(400);

    expect(errors).toHaveLength(0);
    await expect(page).toHaveTitle(/Leaderboard/);

    const persons = page.locator('.person');
    await expect(persons).toHaveCount(12);

    const cards = page.locator('.card');
    await expect(cards).toHaveCount(18);

    // Verify authentic color styles
    const bodyBg = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
    // #9b8975 is rgb(155, 137, 117)
    expect(bodyBg).toBe('rgb(155, 137, 117)');

    const rowBg = await page.evaluate(() => {
      const el = document.querySelector('.person');
      return window.getComputedStyle(el).backgroundColor;
    });
    // #2d3e50 is rgb(45, 62, 80)
    expect(rowBg).toBe('rgb(45, 62, 80)');

    const scoreBg = await page.evaluate(() => {
      const el = document.querySelector('.person-score-badge');
      return window.getComputedStyle(el).backgroundColor;
    });
    // #dc3546 is rgb(220, 53, 70)
    expect(scoreBg).toBe('rgb(220, 53, 70)');
  });

  test('Podium stage displays top 3 players and toggles collapse', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    const championName = page.locator('#podium-name-1');
    await expect(championName).toHaveText('Νίκος Παπαδόπουλος');

    const championScore = page.locator('#podium-score-1');
    await expect(championScore).toHaveText('25');

    // Toggle collapse
    const toggleBtn = page.locator('#btn-toggle-podium');
    await toggleBtn.click();
    await expect(page.locator('#podium-stage-container')).toHaveClass(/podium-collapsed/);

    // Expand again
    await toggleBtn.click();
    await expect(page.locator('#podium-stage-container')).not.toHaveClass(/podium-collapsed/);
  });

  test('Point buttons adjust score interactively', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    const firstPlayerScoreBadge = page.locator('.person').first().locator('.person-score-badge');
    const initialScore = parseInt(await firstPlayerScoreBadge.innerText(), 10);

    // Click +5 button
    const plus5Btn = page.locator('.person').first().locator('.pt-btn-pos5');
    await plus5Btn.click();

    // Verify score incremented
    await expect(firstPlayerScoreBadge).toHaveText(String(initialScore + 5));

    // Click -2 button
    const minus2Btn = page.locator('.person').first().locator('.pt-btn-neg2');
    await minus2Btn.click();
    await expect(firstPlayerScoreBadge).toHaveText(String(initialScore + 3));
  });

  test('Mystery cards deck view and card flipping', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // Switch to cards tab
    await page.click('.cat-tab-btn[data-filter="cards"]');
    await expect(page.locator('#view-cards')).toHaveClass(/active/);

    // Click card 1
    const firstCard = page.locator('.card').first();
    const firstCardContent = firstCard.locator('.card-content');
    await expect(firstCardContent).not.toHaveClass(/open/);

    await firstCard.click();
    await expect(firstCardContent).toHaveClass(/open/);

    // Reset covers button
    await page.click('#btn-refresh-cards');
    await expect(firstCardContent).not.toHaveClass(/open/);
  });

  test('Real-time search filters leaderboard rows', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    const searchInput = page.locator('#live-search-input');
    await searchInput.fill('Monkey');
    await page.waitForTimeout(300);

    const visibleRows = page.locator('.person:visible');
    await expect(visibleRows).toHaveCount(1);
    await expect(visibleRows.first().locator('.person-nickname')).toHaveText('Green Monkey');

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);
    await expect(page.locator('.person:visible')).toHaveCount(12);
  });

  test('Keyboard shortcut "/" focuses live search input', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    await page.keyboard.press('/');
    await expect(page.locator('#live-search-input')).toBeFocused();
  });

  test('Score swap mode activates and can be cancelled with Escape', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // Click swap button
    await page.click('#tool-btn-swap');
    await expect(page.locator('body')).toHaveClass(/swap-mode-active/);
    await expect(page.locator('#swap-active-hint')).toBeVisible();

    // Cancel with Escape
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/swap-mode-active/);
    await expect(page.locator('#swap-active-hint')).not.toBeVisible();
  });

  test('Add Player modal opens and closes via Cancel button and Escape', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // Open Add Player modal
    await page.click('#tool-btn-add');
    await expect(page.locator('body')).toHaveClass(/show-add-person/);
    await expect(page.locator('.add-person-popup')).toBeVisible();

    // Close via Cancel button
    await page.click('.add-person-popup .modal-actions .cancel');
    await expect(page.locator('body')).not.toHaveClass(/show-add-person/);

    // Reopen and close via Escape
    await page.click('#tool-btn-add');
    await expect(page.locator('body')).toHaveClass(/show-add-person/);
    await page.keyboard.press('Escape');
    await expect(page.locator('body')).not.toHaveClass(/show-add-person/);
  });

  test('Display Mode Selection modal opens and closes cleanly', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // Open viewmode modal
    await page.click('#tool-btn-viewmode');
    await expect(page.locator('body')).toHaveClass(/show-viewmode/);
    await expect(page.locator('#viewmode-modal')).toBeVisible();

    // Close via close button
    await page.click('.viewmode-close-btn');
    await expect(page.locator('body')).not.toHaveClass(/show-viewmode/);
  });

  test('Double click on score badge opens direct edit input', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    const firstRow = page.locator('.person').first();
    const scoreBadge = firstRow.locator('.person-score-badge');

    // Double click score badge
    await scoreBadge.dblclick();

    // Verify input element is created
    const input = scoreBadge.locator('input.instant-score-input');
    await expect(input).toBeVisible();

    // Press Escape to cancel
    await input.press('Escape');
    await expect(input).not.toBeVisible();
  });

  test('Migration tool opens and successfully imports legacy leaderboard & cards files', async ({ page }) => {
    const fs = require('fs');
    const desktopLb = '/Users/Triantafyllos/Desktop/leaderboard/leaderboard.html';
    const desktopCards = '/Users/Triantafyllos/Desktop/leaderboard/leaderboard-cards.html';

    if (!fs.existsSync(desktopLb) || !fs.existsSync(desktopCards)) {
      return;
    }

    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // Open Migration modal
    await page.click('#tool-btn-migrate', { force: true });
    await expect(page.locator('.migrate-modal')).toBeVisible();

    // Select legacy leaderboard.html
    await page.setInputFiles('#migrate-file-input', desktopLb);
    await expect(page.locator('#migrate-preview-wrap')).toBeVisible({ timeout: 10000 });
    const statsText = await page.locator('#migrate-preview-stats').innerText();
    expect(statsText).toContain('12 Παίκτες');

    // Apply migration
    await page.click('#btn-apply-migration-now');
    await expect(page.locator('.migrate-modal')).toBeHidden();
    await page.waitForTimeout(400);

    // Verify imported players & podium
    const rows = page.locator('.leaderboard .person');
    await expect(rows).toHaveCount(12);
    const rank1Nick = await page.locator('.podium-column.rank-1 .podium-nickname').innerText();
    const rank1Score = await page.locator('.podium-column.rank-1 .podium-score-pill').innerText();
    expect(rank1Nick).toBe('Νίκος Παπαδόπουλος');
    expect(rank1Score).toBe('25');

    // Migrate cards
    await page.click('#tool-btn-migrate', { force: true });
    await expect(page.locator('.migrate-modal')).toBeVisible();
    await page.setInputFiles('#migrate-file-input', desktopCards);
    await expect(page.locator('#migrate-preview-wrap')).toBeVisible({ timeout: 10000 });
    const cardStats = await page.locator('#migrate-preview-stats').innerText();
    expect(cardStats).toContain('18 Κάρτες');

    await page.click('#btn-apply-migration-now');
    await expect(page.locator('.migrate-modal')).toBeHidden();
    await page.waitForTimeout(400);

    // Switch to cards tab
    await page.click('.cat-tab-btn[data-filter="cards"]', { force: true });
    await page.waitForTimeout(400);
    const cards = page.locator('.cards-list .card');
    await expect(cards).toHaveCount(18);
  });
});
