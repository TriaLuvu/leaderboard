const fs = require('fs');
const path = require('path');

describe('Leaderboard Core Data & Logic Unit Tests', () => {

  test('Validates initial data schema in data.js', () => {
    const dataJsContent = fs.readFileSync(path.resolve(__dirname, '../../data.js'), 'utf8');
    expect(dataJsContent).toContain('window.LEADERBOARD_INITIAL_DATA');

    // Evaluate in sandbox
    const sandbox = {};
    const evalFn = new Function('window', dataJsContent);
    evalFn(sandbox);

    const initialData = sandbox.LEADERBOARD_INITIAL_DATA;
    expect(initialData).toBeDefined();
    expect(initialData.app).toBe('leaderboard-suite');
    expect(Array.isArray(initialData.leaderboard)).toBe(true);
    expect(Array.isArray(initialData.cards)).toBe(true);
    expect(initialData.leaderboard.length).toBeGreaterThanOrEqual(10);
    expect(initialData.cards.length).toBeGreaterThanOrEqual(10);

    // Verify first player
    const p1 = initialData.leaderboard[0];
    expect(p1).toHaveProperty('nickname');
    expect(p1).toHaveProperty('score');
    expect(p1).toHaveProperty('icon');
    expect(typeof p1.score).toBe('number');
  });

  test('Leaderboard sorting sorts by score DESC, then nickname ASC', () => {
    const players = [
      { icon: 'fox', nickname: 'Beta', score: 200 },
      { icon: 'lion', nickname: 'Alpha', score: 300 },
      { icon: 'panda', nickname: 'Charlie', score: 200 },
      { icon: 'hawk', nickname: 'Delta', score: 500 }
    ];

    const sorted = [...players].sort((a, b) => {
      const diff = (b.score || 0) - (a.score || 0);
      if (diff !== 0) return diff;
      return (a.nickname || '').localeCompare(b.nickname || '');
    });

    expect(sorted[0].nickname).toBe('Delta'); // 500
    expect(sorted[1].nickname).toBe('Alpha'); // 300
    expect(sorted[2].nickname).toBe('Beta');  // 200, B before C
    expect(sorted[3].nickname).toBe('Charlie'); // 200, C after B
  });

  test('Score change and undo/redo operations', () => {
    let undoStack = [];
    let redoStack = [];
    let player = { icon: 'hawk', nickname: 'Hawk', score: 100 };

    function applyScore(p, delta) {
      const oldScore = p.score;
      const newScore = oldScore + delta;
      undoStack.push({ type: 'score_change', nick: p.nickname, oldScore, newScore });
      redoStack = [];
      p.score = newScore;
    }

    function undo(p) {
      if (undoStack.length === 0) return;
      const act = undoStack.pop();
      redoStack.push(act);
      p.score = act.oldScore;
    }

    function redo(p) {
      if (redoStack.length === 0) return;
      const act = redoStack.pop();
      undoStack.push(act);
      p.score = act.newScore;
    }

    applyScore(player, 5);
    expect(player.score).toBe(105);
    expect(undoStack.length).toBe(1);

    applyScore(player, -2);
    expect(player.score).toBe(103);
    expect(undoStack.length).toBe(2);

    undo(player);
    expect(player.score).toBe(105);
    expect(redoStack.length).toBe(1);

    undo(player);
    expect(player.score).toBe(100);

    redo(player);
    expect(player.score).toBe(105);
  });

  test('Score swap logic correctly switches scores between two players', () => {
    let p1 = { nickname: 'Alice', score: 400 };
    let p2 = { nickname: 'Bob', score: 250 };

    const scoreA = p1.score;
    const scoreB = p2.score;

    p1.score = scoreB;
    p2.score = scoreA;

    expect(p1.score).toBe(250);
    expect(p2.score).toBe(400);
  });

  test('Bulk player input parsing parses multi-line text correctly', () => {
    const raw = `
      Nikos, 150
      Maria, 220
      lion, Georgios, 310
      Dimitris
    `;

    const lines = raw.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const parsed = [];
    const defaultAvatars = ['hawk', 'lion', 'panda'];

    lines.forEach((line, idx) => {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 3) {
        parsed.push({ icon: parts[0], nickname: parts[1], score: parseInt(parts[2], 10) || 0 });
      } else if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num)) {
          parsed.push({ icon: defaultAvatars[idx % defaultAvatars.length], nickname: parts[0], score: num });
        } else {
          parsed.push({ icon: parts[0], nickname: parts[1], score: 0 });
        }
      } else if (parts.length === 1 && parts[0]) {
        parsed.push({ icon: defaultAvatars[idx % defaultAvatars.length], nickname: parts[0], score: 0 });
      }
    });

    expect(parsed.length).toBe(4);
    expect(parsed[0]).toEqual({ icon: 'hawk', nickname: 'Nikos', score: 150 });
    expect(parsed[1]).toEqual({ icon: 'lion', nickname: 'Maria', score: 220 });
    expect(parsed[2]).toEqual({ icon: 'lion', nickname: 'Georgios', score: 310 });
    expect(parsed[3]).toEqual({ icon: 'hawk', nickname: 'Dimitris', score: 0 });
  });

  test('Backup JSON validation accepts valid export structure', () => {
    const payload = {
      app: 'leaderboard-suite',
      theme: 'theme-dripit',
      display_mode: 'all',
      leaderboard: [
        { icon: 'hawk', nickname: 'Hawk', score: 420 }
      ],
      cards: [
        { icon: 'gift', score: '+5', info: 'Bonus!' }
      ]
    };

    const isValid = (data) => {
      if (!data || typeof data !== 'object') return false;
      if (!Array.isArray(data.leaderboard) || !Array.isArray(data.cards)) return false;
      return true;
    };

    expect(isValid(payload)).toBe(true);
    expect(isValid(null)).toBe(false);
    expect(isValid({ foo: 'bar' })).toBe(false);
  });

  test('Greek search normalization removes accents and lowercases', () => {
    const normalizeSearchText = (str) => {
      return (str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    };

    expect(normalizeSearchText('Νίκος')).toBe('νικος');
    expect(normalizeSearchText('ΓΙΩΡΓΟΣ')).toBe('γιωργος');
    expect(normalizeSearchText('Θανάσης')).toBe('θανασης');
    expect(normalizeSearchText('Hawk')).toBe('hawk');
    expect(normalizeSearchText('  Voyager  ')).toBe('voyager');

    // Accent-insensitive search matching
    const query = normalizeSearchText('νικος');
    const target = normalizeSearchText('Νίκος');
    expect(target.indexOf(query)).toBeGreaterThan(-1);
  });

  test('Card score classifier categorizes points and action badges', () => {
    function classifyCardScore(scr) {
      if (scr == null || String(scr).trim() === '') return 'empty';
      const str = String(scr).trim();
      const num = parseInt(str, 10);
      if (!isNaN(num) && /^[+-]?\d+$/.test(str)) {
        return num > 0 ? 'green' : (num < 0 ? 'red' : 'yellow');
      }
      return 'action';
    }

    expect(classifyCardScore('+10')).toBe('green');
    expect(classifyCardScore('-5')).toBe('red');
    expect(classifyCardScore('0')).toBe('yellow');
    expect(classifyCardScore('CHALLENGE')).toBe('action');
    expect(classifyCardScore('')).toBe('empty');
    expect(classifyCardScore(null)).toBe('empty');
  });

  test('Legacy URL base64 decoder extracts synced leaderboard array', () => {
    const originalPlayers = [
      { icon: 'hawk', nickname: 'Champion', score: 500 }
    ];
    const encoded = Buffer.from(JSON.stringify(originalPlayers)).toString('base64');

    const decoded = JSON.parse(Buffer.from(encoded, 'base64').toString('utf8'));
    expect(Array.isArray(decoded)).toBe(true);
    expect(decoded[0].nickname).toBe('Champion');
    expect(decoded[0].score).toBe(500);
  });

  test('New leaderboard perfectly adapts to legacy system player and card formats', () => {
    const universalLegacyIconMap = {
      "gift": "🎁", "fire": "🔥", "trophy": "🏆", "star": "⭐", "lightning": "⚡",
      "unicorn": "🦄", "diamond": "💎", "target": "🎯", "bomb": "💣", "fox": "🦊",
      "crown": "👑", "monkey": "🙊", "tornado": "🌪️", "ice": "🧊",
      "swap": "🔄", "sparkles": "✨", "dice": "🎲", "shield": "🛡️", "lion": "🦁",
      "panda": "🐼", "tiger": "🐯", "eagle": "🦅", "wolf": "🐺", "iguana": "🦎"
    };

    function resolveLegacyCardIcon(icon) {
      if (!icon) return "🎁";
      const key = String(icon).trim().toLowerCase();
      return universalLegacyIconMap[key] || icon;
    }

    // Verify all legacy English icon names map to emojis
    expect(resolveLegacyCardIcon("gift")).toBe("🎁");
    expect(resolveLegacyCardIcon("shield")).toBe("🛡️");
    expect(resolveLegacyCardIcon("star")).toBe("⭐");
    expect(resolveLegacyCardIcon("trophy")).toBe("🏆");
    expect(resolveLegacyCardIcon("fire")).toBe("🔥");
    expect(resolveLegacyCardIcon("unicorn")).toBe("🦄");
    expect(resolveLegacyCardIcon("diamond")).toBe("💎");
    expect(resolveLegacyCardIcon("target")).toBe("🎯");
    expect(resolveLegacyCardIcon("bomb")).toBe("💣");
    expect(resolveLegacyCardIcon("crown")).toBe("👑");
    expect(resolveLegacyCardIcon("lightning")).toBe("⚡");

    // Verify existing emojis are preserved
    expect(resolveLegacyCardIcon("🎁")).toBe("🎁");
    expect(resolveLegacyCardIcon("🔥")).toBe("🔥");

    // Verify legacy card scores handling
    function parseLegacyCard(raw) {
      return {
        icon: resolveLegacyCardIcon(raw.icon),
        score: raw.score !== undefined && raw.score !== null ? String(raw.score).trim() : "-",
        info: (raw.info || "").trim()
      };
    }

    const legacyRawCards = [
      { icon: "gift", score: 2, info: "Congrats! You win 2 points" },
      { icon: "fire", score: "+5", info: "You're on fire! +5" },
      { icon: "shield", score: "-1", info: "Whoever you choose loses 1 point" },
      { icon: "swap", score: "🤣🔁😠", info: "Swap your score with someone else" },
      { icon: "crown", score: "TIE", info: "Tie score" },
      { icon: "star", score: "x2", info: "Double points" },
      { icon: "target", score: 10, info: "Bullseye" }
    ];

    const parsedCards = legacyRawCards.map(parseLegacyCard);
    expect(parsedCards[0]).toEqual({ icon: "🎁", score: "2", info: "Congrats! You win 2 points" });
    expect(parsedCards[1]).toEqual({ icon: "🔥", score: "+5", info: "You're on fire! +5" });
    expect(parsedCards[2]).toEqual({ icon: "🛡️", score: "-1", info: "Whoever you choose loses 1 point" });
    expect(parsedCards[3]).toEqual({ icon: "🔄", score: "🤣🔁😠", info: "Swap your score with someone else" });
    expect(parsedCards[4]).toEqual({ icon: "👑", score: "TIE", info: "Tie score" });
    expect(parsedCards[5]).toEqual({ icon: "⭐", score: "x2", info: "Double points" });
    expect(parsedCards[6]).toEqual({ icon: "🎯", score: "10", info: "Bullseye" });

    // Verify legacy players with string scores or text icons
    function parseLegacyPlayer(raw) {
      return {
        icon: (raw.icon || "hawk").trim(),
        nickname: (raw.nickname || "Player").trim(),
        score: parseInt(raw.score, 10) || 0
      };
    }

    const legacyPlayers = [
      { icon: "fox", nickname: "Desirae Herwitz", score: "245" },
      { icon: "🦁", nickname: "Nikos", score: 25 },
      { icon: "abram", nickname: "Abram", score: 100 }
    ];
    const parsedPlayers = legacyPlayers.map(parseLegacyPlayer);
    expect(parsedPlayers[0]).toEqual({ icon: "fox", nickname: "Desirae Herwitz", score: 245 });
    expect(parsedPlayers[1]).toEqual({ icon: "🦁", nickname: "Nikos", score: 25 });
    expect(parsedPlayers[2]).toEqual({ icon: "abram", nickname: "Abram", score: 100 });
  });

  test('Wireless 6-digit PIN transfer generator & formatter validation', () => {
    function generatePin() {
      return Math.floor(100000 + Math.random() * 900000).toString();
    }
    function formatPin(pin) {
      const clean = (pin || '').replace(/[^0-9]/g, '');
      if (clean.length === 6) {
        return clean.slice(0, 3) + ' ' + clean.slice(3);
      }
      return clean;
    }

    const pin = generatePin();
    expect(pin).toMatch(/^\d{6}$/);
    expect(formatPin(pin)).toBe(pin.slice(0, 3) + ' ' + pin.slice(3));
    expect(formatPin('482-195')).toBe('482 195');
    expect(formatPin('482 195')).toBe('482 195');

    // Test payload packaging
    const payload = {
      app: 'leaderboard-suite',
      version: '2.0',
      theme: 'theme-dripit',
      display_mode: 'all',
      leaderboard: [{ icon: '🦁', nickname: 'Nikos', score: 25 }],
      cards: [{ icon: '🎁', score: '+5', info: 'Bonus!' }],
      created_at: new Date().toISOString()
    };
    expect(payload.leaderboard.length).toBe(1);
    expect(payload.cards.length).toBe(1);
  });

  test('Dropzone offline file parser correctly detects and parses JSON and data.js', () => {
    function parseDropContent(content) {
      try {
        return JSON.parse(content);
      } catch (e) {
        const jsMatch = content.match(/window\.LEADERBOARD_INITIAL_DATA\s*=\s*(\{[\s\S]*\});?/);
        if (jsMatch && jsMatch[1]) {
          return JSON.parse(jsMatch[1]);
        }
      }
      return null;
    }

    // JSON file format
    const jsonStr = JSON.stringify({
      leaderboard: [{ icon: '🦁', nickname: 'Nikos', score: 30 }],
      cards: [{ icon: '🔥', score: '+10', info: 'Super fire' }]
    });
    const parsedJson = parseDropContent(jsonStr);
    expect(parsedJson).not.toBeNull();
    expect(parsedJson.leaderboard[0].nickname).toBe('Nikos');

    // data.js file format
    const dataJsStr = 'window.LEADERBOARD_INITIAL_DATA = ' + jsonStr + ';';
    const parsedDataJs = parseDropContent(dataJsStr);
    expect(parsedDataJs).not.toBeNull();
    expect(parsedDataJs.leaderboard[0].nickname).toBe('Nikos');
  });

  test('Folder migration logic automatically identifies and combines files from old directory', () => {
    // Simulating files inside a legacy folder selected by user
    const mockFolderFiles = [
      { name: '.DS_Store', path: 'leaderboard/.DS_Store' },
      { name: 'jquery-3.5.1.min.js', path: 'leaderboard/jquery-3.5.1.min.js' },
      { name: 'isotope-v3.0.6.pkgd.min.js', path: 'leaderboard/isotope-v3.0.6.pkgd.min.js' },
      { name: 'README.md', path: 'leaderboard/README.md' },
      { name: 'leaderboard.html', path: 'leaderboard/leaderboard.html' },
      { name: 'leaderboard-cards.html', path: 'leaderboard/leaderboard-cards.html' }
    ];

    // Candidate file filter
    function filterCandidateFiles(files) {
      return files.filter(f => {
        const name = f.name.toLowerCase();
        const path = (f.path || name).toLowerCase();
        if (name.startsWith('.') || path.includes('/.')) return false;
        if (name.includes('jquery') || name.includes('isotope') || name.includes('bootstrap')) return false;
        if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.pdf') || name === 'readme.md' || name === 'license') return false;
        return name.endsWith('.html') || name.endsWith('.htm') || name.endsWith('.json') || name.endsWith('.js') || name.includes('leaderboard') || name.includes('card');
      });
    }

    const candidates = filterCandidateFiles(mockFolderFiles);
    expect(candidates.map(c => c.name)).toEqual(['leaderboard.html', 'leaderboard-cards.html']);

    // Sort to prioritize leaderboard and cards
    candidates.sort((a, b) => {
      let scoreA = 0, scoreB = 0;
      if (a.name.includes('leaderboard') && !a.name.includes('card')) scoreA += 20;
      if (a.name.includes('card')) scoreA += 15;
      if (b.name.includes('leaderboard') && !b.name.includes('card')) scoreB += 20;
      if (b.name.includes('card')) scoreB += 15;
      return scoreB - scoreA;
    });

    expect(candidates[0].name).toBe('leaderboard.html');
    expect(candidates[1].name).toBe('leaderboard-cards.html');

    // Simulate multi-file merge
    const mockLbData = [{ icon: '🦁', nickname: 'Nikos', score: 25 }, { icon: '🦊', nickname: 'Maria', score: 22 }];
    const mockCardsData = [{ icon: '🎯', score: '+7', info: 'Bullseye' }, { icon: '🎁', score: '+5', info: 'Gift' }];

    const combined = {
      leaderboard: [],
      cards: [],
      sources: []
    };

    // Process leaderboard.html
    mockLbData.forEach(p => combined.leaderboard.push(p));
    combined.sources.push(`leaderboard.html (${mockLbData.length} παίκτες)`);

    // Process leaderboard-cards.html
    mockCardsData.forEach(c => combined.cards.push(c));
    combined.sources.push(`leaderboard-cards.html (${mockCardsData.length} κάρτες)`);

    expect(combined.leaderboard.length).toBe(2);
    expect(combined.cards.length).toBe(2);
    expect(combined.sources).toEqual([
      'leaderboard.html (2 παίκτες)',
      'leaderboard-cards.html (2 κάρτες)'
    ]);
  });
});
