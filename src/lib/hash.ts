// A small deterministic string hash, shared by anything that needs stable
// "randomness" tied to content (a card's id, a page title) rather than
// true Math.random() — so the look doesn't reshuffle on every re-render.
export function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}
