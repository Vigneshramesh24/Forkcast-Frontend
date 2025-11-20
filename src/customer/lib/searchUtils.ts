// Lightweight search utilities: tokenization and a small fuzzy matcher (no external deps)
export const tokenize = (s: string) => {
  if (!s) return [];
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/gi, ' ')
    .split(/\s+/)
    .filter(Boolean);
};

// Levenshtein distance
export const levenshtein = (a: string, b: string) => {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
};

// normalized similarity [0..1], higher is more similar
export const similarity = (a: string, b: string) => {
  if (!a || !b) return 0;
  const dist = levenshtein(a, b);
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  return 1 - dist / maxLen;
};

// Check if a single token matches any token in target text by substring or fuzzy similarity
export const tokenMatchesText = (token: string, text: string, fuzzThreshold = 0.66) => {
  if (!token || !text) return false;
  const t = token.toLowerCase();
  const words = tokenize(text);
  // exact substring match
  if (text.toLowerCase().includes(t)) return true;
  // match against word tokens with fuzzy similarity
  return words.some((w) => similarity(t, w) >= fuzzThreshold || w.includes(t) || t.includes(w));
};

// Require that all query tokens match the target text (name/menu) using tokenMatchesText
export const tokensMatchTarget = (tokens: string[], target: string) => {
  if (!tokens || tokens.length === 0) return false;
  return tokens.every((tk) => tokenMatchesText(tk, target));
};

// Combined matching helper used by components: returns true if tokens match name OR any menu item
export const matchesRestaurant = (tokens: string[], restaurant: { name?: string; cuisine?: string; menu?: string[] }) => {
  if (!tokens || tokens.length === 0) return false;
  const nameTarget = `${restaurant.name || ''} ${restaurant.cuisine || ''}`.trim();
  if (tokensMatchTarget(tokens, nameTarget)) return true;
  if (restaurant.menu && restaurant.menu.length) {
    return restaurant.menu.some((m) => tokensMatchTarget(tokens, m));
  }
  return false;
};

export default {
  tokenize,
  levenshtein,
  similarity,
  tokenMatchesText,
  tokensMatchTarget,
  matchesRestaurant,
};
