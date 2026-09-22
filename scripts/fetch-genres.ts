/**
 * Fetches genre tags for every artist in src/data/submissions.csv and caches
 * them in src/data/artistGenres.json. Run once per season after dropping in
 * the new Music League export:
 *
 *   npm run genres                 # fill in missing + "seed" artists
 *   npm run genres -- --refresh    # re-fetch everything except "manual" entries
 *   npm run genres -- --limit 10   # try it on a few artists first
 *
 * Source: Last.fm if LASTFM_API_KEY is set (best tags, free key at
 * https://www.last.fm/api/account/create), otherwise MusicBrainz (no key,
 * but slower at 1 request/second and patchier for small artists).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { classifyTags, isJunkTag, splitArtists, UNCLASSIFIED } from '../src/lib/genreTaxonomy';

type Entry = { tags: string[]; source: 'lastfm' | 'musicbrainz' | 'seed' | 'manual' };
type GenreFile = { _about?: string; artists: Record<string, Entry> };

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SUBMISSIONS = join(root, 'src/data/submissions.csv');
const OUTPUT = join(root, 'src/data/artistGenres.json');

const args = process.argv.slice(2);
const refresh = args.includes('--refresh');
const limitArg = args.indexOf('--limit');
const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Infinity;
const LASTFM_KEY = process.env.LASTFM_API_KEY;
const UA = 'music-league-stats/1.0 (https://github.com/lbyrne23/music-league-stats)';
const MAX_TAGS = 8;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// Minimal CSV parser: handles quoted fields with commas, quotes and newlines
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some(f => f)) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some(f => f)) rows.push(row);
  return rows;
}

function cleanTags(tags: { name: string; count: number }[], minCount: number): string[] {
  const seen = new Set<string>();
  return tags
    .filter(t => t.count >= minCount)
    .sort((a, b) => b.count - a.count)
    .map(t => t.name.toLowerCase().trim())
    .filter(t => t && !seen.has(t) && seen.add(t))
    .filter(t => !isJunkTag(t) || /^\d0s$/.test(t)) // keep decades for personalities
    .slice(0, MAX_TAGS);
}

async function fromLastFm(artist: string): Promise<string[]> {
  const url = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&autocorrect=1&format=json` +
    `&artist=${encodeURIComponent(artist)}&api_key=${LASTFM_KEY}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`Last.fm ${res.status}`);
  const json = await res.json() as { error?: number; toptags?: { tag?: { name: string; count: number }[] } };
  if (json.error) return [];
  await sleep(250);
  return cleanTags(json.toptags?.tag ?? [], 10);
}

async function fromMusicBrainz(artist: string): Promise<string[]> {
  const query = encodeURIComponent(`artist:"${artist.replace(/"/g, '')}"`);
  const res = await fetch(`https://musicbrainz.org/ws/2/artist?query=${query}&limit=1&fmt=json`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  await sleep(1100); // MusicBrainz asks for max 1 request per second
  if (!res.ok) throw new Error(`MusicBrainz ${res.status}`);
  const json = await res.json() as { artists?: { score: number; tags?: { name: string; count: number }[] }[] };
  const best = json.artists?.[0];
  if (!best || best.score < 90) return [];
  return cleanTags(best.tags ?? [], 1);
}

async function main() {
  const rows = parseCsv(readFileSync(SUBMISSIONS, 'utf8'));
  const header = rows[0];
  const col = header.findIndex(h => h.trim().toLowerCase().startsWith('artist'));
  if (col < 0) throw new Error('No Artist(s) column in submissions.csv');

  const artists = [...new Set(rows.slice(1).flatMap(r => splitArtists(r[col] ?? '')))].sort();
  const data: GenreFile = JSON.parse(readFileSync(OUTPUT, 'utf8'));

  const todo = artists
    .filter(a => {
      const e = data.artists[a];
      if (!e) return true;
      if (e.source === 'manual') return false;
      return refresh || e.source === 'seed';
    })
    .slice(0, limit);

  const source = LASTFM_KEY ? 'lastfm' : 'musicbrainz';
  console.log(`${artists.length} artists in submissions, fetching ${todo.length} from ${source}` +
    (LASTFM_KEY ? '' : ' (set LASTFM_API_KEY for faster, better tags)'));

  const noTags: string[] = [];
  const save = () => writeFileSync(OUTPUT, JSON.stringify(data, null, 2) + '\n');

  for (const [i, artist] of todo.entries()) {
    try {
      const tags = LASTFM_KEY ? await fromLastFm(artist) : await fromMusicBrainz(artist);
      if (tags.length) {
        data.artists[artist] = { tags, source };
        console.log(`  ✓ ${artist}: ${tags.slice(0, 3).join(', ')}`);
      } else {
        noTags.push(artist);
        console.log(`  · ${artist}: no tags found${data.artists[artist] ? ' (kept existing)' : ''}`);
      }
    } catch (err) {
      noTags.push(artist);
      console.log(`  ✗ ${artist}: ${(err as Error).message}`);
    }
    if (i % 20 === 19) save(); // don't lose progress if it falls over
  }

  data.artists = Object.fromEntries(
    Object.entries(data.artists).sort(([a], [b]) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
  );
  save();

  const unclassified = artists.filter(a => classifyTags(data.artists[a]?.tags ?? []).genre === UNCLASSIFIED);
  console.log(`\nDone. ${todo.length - noTags.length} updated, ${noTags.length} with no usable tags.`);
  if (unclassified.length) {
    console.log(`\n${unclassified.length} artists still unclassified. Add them to artistGenres.json as:`);
    console.log(`  "Artist Name": { "tags": ["indie rock"], "source": "manual" }\n`);
    unclassified.forEach(a => console.log(`  - ${a}${data.artists[a]?.tags.length ? `  (tags: ${data.artists[a].tags.join(', ')})` : ''}`));
  }
}

main().catch(err => { console.error(err); process.exit(1); });
