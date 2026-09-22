// Genre taxonomy: turns raw tags (from Last.fm, MusicBrainz or hand-written)
// into one of a small set of parent genres. Pure module with no imports so the
// fetch script in /scripts can share it with the app.

export const UNCLASSIFIED = 'Unclassified';

export const PARENT_GENRES = [
  'Rock',
  'Indie & Alternative',
  'Pop',
  'Electronic & Dance',
  'Ambient & Chill',
  'Hip-Hop',
  'R&B & Soul',
  'Funk & Disco',
  'Metal',
  'Punk',
  'Folk & Country',
  'Jazz & Blues',
  'World',
  'Classical & Soundtrack',
] as const;

export type ParentGenre = (typeof PARENT_GENRES)[number];

// Tags that say nothing about genre. Skipped when classifying, but decades are
// kept in the stored tags because the personality engine likes them.
const JUNK_TAG = new RegExp(
  '^(' +
    [
      'seen live', 'favou?rites?', 'favou?rite songs?', 'love', 'awesome', 'beautiful', 'amazing',
      'male vocalists?', 'female vocalists?', 'female vocals?', 'male vocals?', 'vocal', 'vocalists?',
      'singer', 'all', 'my radio', 'spotify', 'albums i own', 'under \\d+ listeners', 'cover', 'covers',
      'instrumental', 'party', 'urban', 'minimal', 'protest',
      '\\d0s', "\\d0's", '\\d{4}s?', 'oldies',
      'british', 'uk', 'english', 'irish', 'american', 'usa', 'us', 'canadian', 'scottish', 'welsh',
      'swedish', 'norwegian', 'french', 'german', 'italian', 'australian', 'japanese', 'ukrainian',
      'burkina faso', 'dublin', 'london', 'new york',
    ].join('|') +
    ')$'
);

// Exact tag → parent overrides for tags the keyword rules would get wrong
const EXACT: Record<string, ParentGenre> = {
  'folk rock': 'Rock', 'blues rock': 'Rock', 'pop rock': 'Rock', 'soft rock': 'Rock', 'piano rock': 'Rock',
  'latin rock': 'Rock', 'ska': 'Rock', '2 tone': 'Rock', 'new wave': 'Rock',
  'punk rock': 'Punk', 'pop punk': 'Punk', 'celtic punk': 'Punk', 'folk punk': 'Punk',
  'rap metal': 'Metal', 'folk metal': 'Metal',
  'indie folk': 'Folk & Country', 'alternative country': 'Folk & Country', 'anti-folk': 'Folk & Country',
  'indie pop': 'Indie & Alternative', 'dream pop': 'Indie & Alternative', 'jangle pop': 'Indie & Alternative',
  'noise pop': 'Indie & Alternative', 'indie sleaze': 'Indie & Alternative', 'bedroom pop': 'Indie & Alternative',
  'dance pop': 'Pop', 'synth-pop': 'Pop', 'synthpop': 'Pop', 'synth pop': 'Pop', 'electropop': 'Pop',
  'hyperpop': 'Pop', 'art pop': 'Pop', 'latin pop': 'Pop', 'schlager': 'Pop', 'sunshine pop': 'Pop',
  'dance-punk': 'Electronic & Dance', 'dance punk': 'Electronic & Dance', 'indie dance': 'Electronic & Dance',
  'electro swing': 'Electronic & Dance', 'liquid funk': 'Electronic & Dance', 'wonky': 'Electronic & Dance',
  'jazz funk': 'Funk & Disco', 'jazz rap': 'Hip-Hop', 'g-funk': 'Hip-Hop', 'nu jazz': 'Jazz & Blues',
  'alternative r&b': 'R&B & Soul', 'doo-wop': 'R&B & Soul', 'kankyō ongaku': 'Ambient & Chill',
  'show tunes': 'Classical & Soundtrack', 'musical': 'Classical & Soundtrack',
  'experimental': 'Indie & Alternative', 'avant-garde': 'Indie & Alternative',
};

// Checked in order, so more specific families come first
const RULES: [RegExp, ParentGenre][] = [
  [/metal|metalcore|thrash|djent|sludge/, 'Metal'],
  [/punk|hardcore|\bemo\b|riot grrrl/, 'Punk'],
  [/hip.?hop|\brap\b|\btrap\b|grime|drill|crunk|boom bap/, 'Hip-Hop'],
  [/ambient|new age|downtempo|trip.?hop|chillwave|chillout|meditation|lo.?fi hip hop/, 'Ambient & Chill'],
  [/funk|disco|boogie/, 'Funk & Disco'],
  [/electronic|electronica|house|techno|trance|\bdance\b|\bedm\b|dubstep|drum and bass|drum n bass|\bdnb\b|jungle|(uk|future|speed) garage|^garage$|breakbeat|big beat|\bidm\b|synthwave|darksynth|\belectro\b|electroclash|ghettotech|eurodance|hardstyle|\bbass\b|balearic/, 'Electronic & Dance'],
  [/indie|alternative|shoegaze|slowcore|lo.?fi|post.?rock|math rock|britpop|neo.?psychedelia/, 'Indie & Alternative'],
  [/r&b|rnb|rhythm and blues|soul|motown|gospel|quiet storm/, 'R&B & Soul'],
  [/jazz|blues|swing|bebop/, 'Jazz & Blues'],
  [/folk|country|americana|bluegrass|singer.?songwriter|celtic|traditional|\btrad\b|acoustic/, 'Folk & Country'],
  [/world|latin|reggae|dancehall|afro|soukous|rumba|salsa|cuban|son cubano|bossa|mpb|highlife|bollywood|arabic|maori|flamenco|reggaeton|k-pop/, 'World'],
  [/soundtrack|score|classical|orchestral|choral|opera|tenor|sacred|neoclassical|composer/, 'Classical & Soundtrack'],
  [/rock|grunge|psychedelic|prog|glam|surf|\baor\b/, 'Rock'],
  [/pop/, 'Pop'],
];

const UPPER_WORDS = new Set(['r&b', 'idm', 'edm', 'uk', 'aor', 'dnb', 'mpb']);

export function normaliseTag(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function isJunkTag(tag: string): boolean {
  return JUNK_TAG.test(normaliseTag(tag));
}

export function prettyTag(tag: string): string {
  return normaliseTag(tag)
    .split(' ')
    .map(w => (UPPER_WORDS.has(w) ? w.toUpperCase() : w.replace(/(^|-)(\p{L})/gu, (_, p, c) => p + c.toUpperCase())))
    .join(' ');
}

export function classifyTag(tag: string): ParentGenre | null {
  const t = normaliseTag(tag);
  if (!t || JUNK_TAG.test(t)) return null;
  if (EXACT[t]) return EXACT[t];
  for (const [rule, parent] of RULES) if (rule.test(t)) return parent;
  return null;
}

// Tags arrive strongest first, so the first tag that maps to a parent wins.
// The winning tag doubles as the subgenre shown on artist cards.
export function classifyTags(tags: string[]): { genre: ParentGenre | typeof UNCLASSIFIED; subgenre: string | null } {
  for (const tag of tags) {
    const parent = classifyTag(tag);
    if (parent) {
      const sub = prettyTag(tag);
      // Drop subgenres that just repeat the parent ("Electronic" under "Electronic & Dance")
      return { genre: parent, subgenre: parent.toLowerCase().includes(sub.toLowerCase()) ? null : sub };
    }
  }
  return { genre: UNCLASSIFIED, subgenre: null };
}

// Loose key for matching artist names: case, accents, "The" and spacing ignored
export function artistKey(name: string): string {
  return name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/^the\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Spotify exports join collaborators with commas
export function splitArtists(artists: string): string[] {
  return artists.split(',').map(a => a.trim()).filter(Boolean);
}
