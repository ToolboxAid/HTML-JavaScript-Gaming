function fuzzyMatchScore(text, query) {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (!q) return 0;
  const prefix = t.indexOf(q) === 0;
  const substringIndex = t.indexOf(q);
  let qi = 0;
  let lastMatch = -1;
  let gaps = 0;
  for (let i = 0; i < t.length && qi < q.length; i += 1) {
    if (t[i] === q[qi]) {
      if (lastMatch >= 0 && i !== lastMatch + 1) gaps += (i - lastMatch - 1);
      lastMatch = i;
      qi += 1;
    }
  }
  const fuzzyMatched = qi === q.length;
  if (!fuzzyMatched && substringIndex < 0) return -1;
  let score = 0;
  if (prefix) score += 1200;
  if (substringIndex >= 0) score += Math.max(0, 600 - substringIndex * 8);
  if (fuzzyMatched) score += Math.max(0, 420 - gaps * 7);
  score += Math.max(0, 120 - (t.length - q.length));
  return score;
}

export { fuzzyMatchScore };
