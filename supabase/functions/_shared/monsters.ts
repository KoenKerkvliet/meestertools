/**
 * Monstertjes en naamweergave - serverkant.
 *
 * Moet exact hetzelfde uitrekenen als js/mt-shared.js aan de clientkant.
 * Wijkt er iets af, dan ziet een kind in de rekenrace een ander monstertje
 * dan op zijn eigen leerlingpagina. Stond tot v1.48.0 in elke edge function
 * apart; nu op één plek.
 */

export const MONSTER_COUNT = 36

export function hashStr(key: string): number {
  let h = 0
  key = String(key || '')
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0
  return h
}

// Vast, binnen de klas uniek monstertje per kind. Sorteren op id maakt de
// uitkomst onafhankelijk van de volgorde waarin de lijst binnenkomt.
export function assignMonsters(list: Array<{ id: string }>): Record<string, number> {
  const map: Record<string, number> = {}
  const used: Record<number, boolean> = {}
  ;(list || []).slice().sort((a, b) => {
    const ai = String(a.id), bi = String(b.id)
    return ai < bi ? -1 : ai > bi ? 1 : 0
  }).forEach((s) => {
    let n = hashStr(s.id) % MONSTER_COUNT, tries = 0
    while (used[n] && tries < MONSTER_COUNT) { n = (n + 1) % MONSTER_COUNT; tries++ }
    used[n] = true
    map[s.id] = n + 1
  })
  return map
}

export function monsterPath(n: number): string {
  const nn = n < 10 ? '0' + n : String(n)
  return 'assets/avatars/monsters/monster-' + nn + '.webp'
}

// Monstertje van één kind, met terugval als het niet in de map staat.
export function monsterFor(map: Record<string, number>, id: string): string {
  return monsterPath(map[id] || ((hashStr(id) % MONSTER_COUNT) + 1))
}

export function normName(s: unknown): string {
  return String(s == null ? '' : s).trim().toLowerCase()
}

// Voornaam plus achterletter als die er is: "Noa K.". Achternamen slaan we
// niet op - dit is het enige onderscheid tussen twee kinderen met dezelfde
// voornaam. Zie ook students.name_suffix (max 2 tekens, CHECK in de database).
export function displayNameOf(s: { first_name?: string; name_suffix?: string }): string {
  const x = (s.name_suffix || '').trim()
  return ((s.first_name || '') + ' ' + (x ? x + '.' : '')).trim()
}
