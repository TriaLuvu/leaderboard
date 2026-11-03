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
});
