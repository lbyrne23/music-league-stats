// Artist → genre lookup, backed by src/data/artistGenres.json.
// Refresh that file each season with `npm run genres` (see scripts/fetch-genres.ts).
import genreData from '@/data/artistGenres.json';
import { artistKey, classifyTags, splitArtists, UNCLASSIFIED } from './genreTaxonomy';

export { UNCLASSIFIED, PARENT_GENRES } from './genreTaxonomy';

export interface ArtistGenre {
  genre: string;           // parent genre, or Unclassified
  subgenre: string | null; // the specific tag that decided it, e.g. "Grunge"
  tags: string[];          // raw tags, used by the personality engine
}

type Entry = { tags: string[]; source: string };
const entries = (genreData as { artists: Record<string, Entry> }).artists;

// Exact name first, then a forgiving key ("the smiths" = "The Smiths"). No fuzzy
// substring matching: that's how "Lucy" used to get matched to "Lucy Dacus".
const byKey = new Map<string, Entry>();
Object.entries(entries).forEach(([name, entry]) => byKey.set(artistKey(name), entry));

const cache = new Map<string, ArtistGenre>();

export function getArtistGenre(artist: string): ArtistGenre {
  const hit = cache.get(artist);
  if (hit) return hit;
  const entry = entries[artist] ?? byKey.get(artistKey(artist));
  const tags = entry?.tags ?? [];
  const result = { ...classifyTags(tags), tags };
  cache.set(artist, result);
  return result;
}

// A track takes the genre of its first artist that we can classify
export function getTrackGenre(artists: string): ArtistGenre & { artist: string | null } {
  const names = splitArtists(artists);
  for (const name of names) {
    const g = getArtistGenre(name);
    if (g.genre !== UNCLASSIFIED) return { ...g, artist: name };
  }
  return { genre: UNCLASSIFIED, subgenre: null, tags: [], artist: null };
}

// Kept for anything still calling the old API
export function inferGenreFromArtist(artist: string): string[] {
  const g = getArtistGenre(artist);
  return g.subgenre ? [g.genre, g.subgenre] : [g.genre];
}

export const genreColors: Record<string, string> = {
  'Rock': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Indie & Alternative': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  'Pop': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  'Electronic & Dance': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Ambient & Chill': 'bg-sky-400/20 text-sky-300 border-sky-400/30',
  'Hip-Hop': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'R&B & Soul': 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30',
  'Funk & Disco': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Metal': 'bg-zinc-500/20 text-zinc-300 border-zinc-500/30',
  'Punk': 'bg-rose-600/20 text-rose-400 border-rose-600/30',
  'Folk & Country': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Jazz & Blues': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'World': 'bg-green-500/20 text-green-400 border-green-500/30',
  'Classical & Soundtrack': 'bg-stone-500/20 text-stone-300 border-stone-500/30',
  [UNCLASSIFIED]: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
};

// Subgenre chips (anything that isn't a parent) get a quiet neutral style
const SUBGENRE_STYLE = 'bg-muted/40 text-muted-foreground border-border/50';

export function getGenreColor(genre: string): string {
  return genreColors[genre] ?? SUBGENRE_STYLE;
}
