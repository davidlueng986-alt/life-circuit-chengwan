/** Player-facing copy lint. Never shown to the player. */

const BANNED = [
  /完全安全/,
  /零風險/,
  /零外洩/,
  /證實污染/,
  /即時檢測/,
  /準確濃度/,
  /高度靈敏/,
  /高度選擇性/,
  /可現場部署/,
  /現場即時確認/,
  /批准部署/,
  /100%\s*準確/,
  /\bMerR\b/i,
  /\bPmer\b/i,
  /\bdTomato\b/i,
  /aptamer/i,
  /riboswitch/i,
  /完成練習不代表/,
  /本章涉及/,
  /這不是.{0,12}指引/,
  /這是教學故事/,
  /太棒了！你理解了/,
  /確認污染/,
  /已確認河水受污染/,
  /你已合格/,
];

export function findBannedPhrase(text: string): string | null {
  for (const rule of BANNED) {
    const hit = text.match(rule);
    if (hit) return hit[0] ?? String(rule);
  }
  return null;
}

export function assertPlayerCopy(text: string, label: string): void {
  if (!import.meta.env.DEV) return;
  const hit = findBannedPhrase(text);
  if (hit) {
    console.warn(`[copy-lint] ${label}: banned fragment “${hit}”`);
  }
}
