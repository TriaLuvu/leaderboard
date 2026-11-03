const { test, expect } = require('@playwright/test');
const path = require('path');

const rawFileUrl = 'file://' + path.resolve(__dirname, '../../leaderboard-standalone.html');
const fileUrl = rawFileUrl + '?demo=1';

test.describe('Leaderboard Suite E2E Integration Tests', () => {

  test('Formatted empty board state and Format button operations', async ({ page }) => {
    // Open without demo dataset: should start formatted (empty)
    await page.goto(rawFileUrl);
    await page.waitForTimeout(400);

    // Verify empty state notices
    await expect(page.locator('#lb-empty-notice')).toBeVisible();
    await expect(page.locator('.leaderboard .person')).toHaveCount(0);

    // Click "Φόρτωση Δειγμάτων (Demo)" button from the empty state card
    await page.click('#btn-empty-demo');
    await page.waitForTimeout(400);

    // Verify 12 players loaded
    await expect(page.locator('.leaderboard .person')).toHaveCount(12);

    // Click Format button (🧹) in toolbar
    await page.click('#tool-btn-format', { force: true });
    await expect(page.locator('body')).toHaveClass(/show-confirm/);

    // Confirm format
    await page.click('#btn-confirm-ok');
    await page.waitForTimeout(400);

    // Verify board is empty again
    await expect(page.locator('#lb-empty-notice')).toBeVisible();
    await expect(page.locator('.leaderboard .person')).toHaveCount(0);
  });

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

  test('New leaderboard seamlessly imports and renders raw legacy format data via paste and link', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // Open migration modal
    await page.click('#tool-btn-migrate', { force: true });
    await expect(page.locator('.migrate-modal')).toBeVisible();

    // Unified migration screen: direct paste is immediately visible and active
    await expect(page.locator('#pane-migrate-link')).toHaveClass(/active/);

    // Raw legacy JSON containing English icon names and un-normalized numbers from old system
    const rawLegacyData = JSON.stringify({
      leaderboard: [
        { icon: 'fox', nickname: 'Desirae Herwitz', score: '245' },
        { icon: 'lion', nickname: 'Maren Gouse', score: 290 }
      ],
      cards: [
        { icon: 'gift', score: 2, info: 'Congrats! You win 2 points' },
        { icon: 'shield', score: '-1', info: 'Whoever you choose loses 1 point' },
        { icon: 'swap', score: '🤣🔁😠', info: 'Swap your score with someone else' }
      ]
    });

    await page.fill('#migrate-paste-input', rawLegacyData);
    await page.click('#btn-test-migrate-paste');
    await page.waitForTimeout(300);

    // Verify preview recognized players and cards
    await expect(page.locator('#migrate-preview-wrap')).toBeVisible();

    // Apply migration
    await page.click('#btn-apply-migration-now');
    await expect(page.locator('.migrate-modal')).toBeHidden();
    await page.waitForTimeout(400);

    // Verify imported legacy players rendered with proper SVGs/avatars
    const rows = page.locator('.leaderboard .person');
    await expect(rows).toHaveCount(2);
    expect(await rows.first().locator('.person-nickname').innerText()).toBe('Maren Gouse');
    expect(await rows.first().locator('.person-score-badge').innerText()).toBe('290');

    // Switch to cards tab and verify legacy English icon names mapped to emojis
    await page.click('.cat-tab-btn[data-filter="cards"]', { force: true });
    await page.waitForTimeout(400);
    const cards = page.locator('.cards-list .card');
    await expect(cards).toHaveCount(3);

    // Verify the first card rendered the gift emoji 🎁, not the text "gift"
    const firstCardIcon = await cards.first().locator('.icon').innerText();
    expect(firstCardIcon).toBe('🎁');

    // Verify the second card rendered shield 🛡️
    const secondCardIcon = await cards.nth(1).locator('.icon').innerText();
    expect(secondCardIcon).toBe('🛡️');
  });

  test('Single unified workflow verified for Display Mode and Migration (No duplicates)', async ({ page }) => {
    await page.goto(fileUrl);
    await page.waitForTimeout(300);

    // 1. Check Display Mode: Exactly 1 clean way
    // Category tabs should only contain 2 tabs: Leaderboard & Mystery Cards
    const catTabs = page.locator('.category-filter-tabs .cat-tab-btn');
    await expect(catTabs).toHaveCount(2);
    await expect(page.locator('#btn-header-viewmode')).toHaveCount(0);

    // Toolbar button #tool-btn-viewmode is the single entry point
    await page.click('#tool-btn-viewmode', { force: true });
    await expect(page.locator('#viewmode-modal')).toBeVisible();
    await page.click('.viewmode-close-btn');
    await expect(page.locator('#viewmode-modal')).toBeHidden();

    // 2. Check Sync Modal: Purely for Transfer & Share / Backups (No duplicate viewmode or migration)
    await page.click('#tool-btn-sync', { force: true });
    await expect(page.locator('.sync-modal')).toBeVisible();
    await expect(page.locator('.sync-modal .sync-card-migrate')).toHaveCount(0);
    await expect(page.locator('.sync-modal .viewmode-selector')).toHaveCount(0);
    const syncCards = page.locator('.sync-modal .sync-card');
    await expect(syncCards).toHaveCount(3);

    // Close sync modal
    await page.locator('.sync-modal .close').first().click();
    await expect(page.locator('.sync-modal')).toBeHidden();

    // 3. Check Migration: Single entry point (#tool-btn-migrate) and unified single screen
    await page.click('#tool-btn-migrate', { force: true });
    await expect(page.locator('#migrate-modal')).toBeVisible();
    await expect(page.locator('#migrate-modal .modal-tab-header')).toHaveCount(0);
    await expect(page.locator('#migrate-dropzone')).toBeVisible();
    await expect(page.locator('#migrate-paste-input')).toBeVisible();
    await expect(page.locator('#btn-apply-migration-now')).toBeAttached();
    await expect(page.locator('#migrate-preview-wrap')).toBeHidden();

    // Close migrate modal
    await page.click('#migrate-modal .close-migrate');
    await expect(page.locator('#migrate-modal')).toBeHidden();
  });
});
