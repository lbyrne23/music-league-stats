import { getSubmissions, getCompetitors, getVotes, getRounds, Submission, Round } from './parseData';
import { inferGenreFromArtist } from './genreMapping';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface ArtistStats {
  name: string;
  submissionCount: number;
  totalPoints: number;
  submitters: string[];
  genres: string[];
}

export interface AlbumStats {
  name: string;
  artist: string;
  submissionCount: number;
  totalPoints: number;
}

export interface GenreStats {
  genre: string;
  submissionCount: number;
  totalPoints: number;
  topArtists: string[];
}

export interface RoundStats {
  id: string;
  name: string;
  description: string;
  playlistUrl: string;
  submissionCount: number;
  topTrack: string | null;
  topTrackPoints: number;
  topSubmitter: string | null;
}

export interface SubmitterMusicProfile {
  competitorId: string;
  competitorName: string;
  uniqueArtists: number;
  topArtists: string[];
  submissionCount: number;
  totalPointsEarned: number;
  totalPointsGiven: number;
  negativeVotesGiven: number;
  genreBreakdown: { genre: string; count: number; percentage: number }[];
  topGenres: string[];
  votingGenrePreference: { genre: string; pointsGiven: number }[];
  personality: string;
  personalityEmoji: string;
}

export interface TrackWithStats extends Submission {
  points: number;
  voterCount: number;
  negativeVotes: number;
  submitterName: string;
  spotifyEmbedUrl: string;
  roundName: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSpotifyEmbedUrl(uri: string): string {
  const trackId = uri.replace('spotify:track:', '');
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
}

function buildPointsLookup(votes: ReturnType<typeof getVotes>, votedInRound?: Set<string>) {
  const points = new Map<string, number>();
  const voters = new Map<string, number>();
  const negatives = new Map<string, number>();

  // We need submissionLookup to check if submitter voted — caller passes votedInRound when needed
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    points.set(key, (points.get(key) || 0) + vote.points);
    voters.set(key, (voters.get(key) || 0) + 1);
    if (vote.points < 0) {
      negatives.set(key, (negatives.get(key) || 0) + 1);
    }
  });

  return { points, voters, negatives };
}

// Builds points earned per track key, respecting the Music League rule that
// a submitter forfeits their round points if they didn't vote that round.
function buildValidatedPointsLookup(
  votes: ReturnType<typeof getVotes>,
  submissions: ReturnType<typeof getSubmissions>
) {
  const votedInRound = new Set<string>();
  votes.forEach(v => votedInRound.add(`${v.voterId}_${v.roundId}`));

  const submissionLookup = new Map<string, string>(); // key -> submitterId
  submissions.forEach(s => {
    submissionLookup.set(`${s.spotifyUri}_${s.roundId}`, s.submitterId);
  });

  const points = new Map<string, number>();
  const voters = new Map<string, number>();
  const negatives = new Map<string, number>();

  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    const didVote = submitterId && votedInRound.has(`${submitterId}_${vote.roundId}`);
    // Positives forfeited if submitter didn't vote; negatives always apply
    if (!submitterId || (!didVote && vote.points > 0)) return;
    points.set(key, (points.get(key) || 0) + vote.points);
    voters.set(key, (voters.get(key) || 0) + 1);
    if (vote.points < 0) {
      negatives.set(key, (negatives.get(key) || 0) + 1);
    }
  });

  return { points, voters, negatives };
}

// ─── Artist Stats ─────────────────────────────────────────────────────────────

export function getArtistStats(): ArtistStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();

  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  const { points: pointsLookup } = buildValidatedPointsLookup(votes, submissions);

  const artistMap = new Map<string, ArtistStats>();

  submissions.forEach(sub => {
    const artists = sub.artists.split(',').map(a => a.trim());
    const key = `${sub.spotifyUri}_${sub.roundId}`;
    const points = pointsLookup.get(key) || 0;
    const submitterName = competitorMap.get(sub.submitterId) || 'Unknown';

    artists.forEach(artist => {
      if (!artistMap.has(artist)) {
        artistMap.set(artist, {
          name: artist,
          submissionCount: 0,
          totalPoints: 0,
          submitters: [],
          genres: inferGenreFromArtist(artist)
        });
      }
      const stats = artistMap.get(artist)!;
      stats.submissionCount++;
      stats.totalPoints += points;
      if (!stats.submitters.includes(submitterName)) {
        stats.submitters.push(submitterName);
      }
    });
  });

  return [...artistMap.values()].sort((a, b) => b.submissionCount - a.submissionCount);
}

// ─── Album Stats ──────────────────────────────────────────────────────────────

export function getAlbumStats(): AlbumStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const { points: pointsLookup } = buildValidatedPointsLookup(votes, submissions);

  const albumMap = new Map<string, AlbumStats>();

  submissions.forEach(sub => {
    const albumKey = `${sub.album}_${sub.artists}`;
    const key = `${sub.spotifyUri}_${sub.roundId}`;
    const points = pointsLookup.get(key) || 0;

    if (!albumMap.has(albumKey)) {
      albumMap.set(albumKey, {
        name: sub.album,
        artist: sub.artists,
        submissionCount: 0,
        totalPoints: 0
      });
    }
    const stats = albumMap.get(albumKey)!;
    stats.submissionCount++;
    stats.totalPoints += points;
  });

  return [...albumMap.values()].sort((a, b) => b.submissionCount - a.submissionCount);
}

// ─── Genre Stats ──────────────────────────────────────────────────────────────

export function getGenreStats(): GenreStats[] {
  const artistStats = getArtistStats();
  const genreMap = new Map<string, GenreStats>();

  artistStats.forEach(artist => {
    artist.genres.forEach(genre => {
      if (!genreMap.has(genre)) {
        genreMap.set(genre, { genre, submissionCount: 0, totalPoints: 0, topArtists: [] });
      }
      const stats = genreMap.get(genre)!;
      stats.submissionCount += artist.submissionCount;
      stats.totalPoints += artist.totalPoints;
      if (stats.topArtists.length < 5) {
        stats.topArtists.push(artist.name);
      }
    });
  });

  return [...genreMap.values()].sort((a, b) => b.submissionCount - a.submissionCount);
}

// ─── Round Stats ──────────────────────────────────────────────────────────────

export function getRoundStats(): RoundStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const rounds = getRounds();
  const competitors = getCompetitors();

  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  const { points: pointsLookup } = buildValidatedPointsLookup(votes, submissions);

  return rounds.map(round => {
    const roundSubs = submissions.filter(s => s.roundId === round.id);

    let topTrack: string | null = null;
    let topTrackPoints = 0;
    let topSubmitter: string | null = null;

    roundSubs.forEach(sub => {
      const key = `${sub.spotifyUri}_${sub.roundId}`;
      const pts = pointsLookup.get(key) || 0;
      if (pts > topTrackPoints) {
        topTrackPoints = pts;
        topTrack = sub.title;
        topSubmitter = competitorMap.get(sub.submitterId) || null;
      }
    });

    return {
      id: round.id,
      name: round.name,
      description: round.description,
      playlistUrl: round.playlistUrl,
      submissionCount: roundSubs.length,
      topTrack,
      topTrackPoints,
      topSubmitter
    };
  });
}

// ─── Personality Engine ───────────────────────────────────────────────────────

const personalityPool: { name: string; emoji: string; genres: string[] }[] = [
  { name: "The Indie Purist",          emoji: "🎸", genres: ["indie rock", "indie folk", "alternative", "garage rock"] },
  { name: "The Night Owl",             emoji: "🌙", genres: ["electronic", "house", "techno", "dance", "uk garage"] },
  { name: "The Beats Enthusiast",      emoji: "🎤", genres: ["hip-hop", "rap", "grime", "uk hip-hop"] },
  { name: "The Classic Rocker",        emoji: "🤘", genres: ["rock", "hard rock", "classic rock", "blues rock"] },
  { name: "The Smooth Operator",       emoji: "🎷", genres: ["jazz", "soul", "r&b", "neo-soul"] },
  { name: "The Chill Viber",           emoji: "🌴", genres: ["reggae", "ska", "dub", "dancehall"] },
  { name: "The Rebel",                 emoji: "⚡", genres: ["punk rock", "post-punk", "hardcore punk", "emo"] },
  { name: "The Storyteller",           emoji: "📖", genres: ["folk", "singer-songwriter", "americana", "country"] },
  { name: "The Crowd Pleaser",         emoji: "✨", genres: ["pop", "dance pop", "synth-pop"] },
  { name: "The Deep Thinker",          emoji: "🌀", genres: ["progressive rock", "art rock", "psychedelic rock"] },
  { name: "The Sensitive Soul",        emoji: "🍂", genres: ["indie folk", "dream pop", "slowcore", "shoegaze"] },
  { name: "The Eclectic Tastemaker",   emoji: "🎭", genres: ["art pop", "experimental", "avant-garde"] },
  { name: "The Nostalgia Hunter",      emoji: "📼", genres: ["new wave", "synth-pop", "80s", "disco"] },
  { name: "The World Traveler",        emoji: "🌍", genres: ["afrobeat", "mpb", "tropicália", "world", "latin"] },
  { name: "The Underground Explorer", emoji: "🔦", genres: ["idm", "ambient", "experimental", "hyperpop"] },
  { name: "The Dancefloor General",    emoji: "🪩", genres: ["disco", "funk", "dance", "house"] },
  { name: "The Vinyl Collector",       emoji: "💿", genres: ["soul", "funk", "jazz", "classic rock"] },
  { name: "The Festival Goer",         emoji: "🎪", genres: ["indie rock", "electronic", "alternative"] },
  { name: "The Bedroom DJ",            emoji: "🎚️", genres: ["electronic", "drum and bass", "jungle", "uk bass"] },
  { name: "The Melancholy Romantic",   emoji: "🥀", genres: ["dream pop", "shoegaze", "post-rock", "gothic rock"] },
  { name: "The Celtic Soul",           emoji: "☘️", genres: ["irish trad", "folk", "celtic", "folk punk"] },
  { name: "The Headphone Hermit",      emoji: "🎧", genres: ["ambient", "post-rock", "electronic", "idm"] },
  { name: "The Singalong Champion",    emoji: "🎵", genres: ["pop rock", "britpop", "power pop", "indie pop"] },
  { name: "The Riff Master",           emoji: "🔥", genres: ["heavy metal", "hard rock", "alternative metal", "nu metal"] },
  { name: "The Groove Seeker",         emoji: "🕺", genres: ["funk", "disco", "r&b", "soul"] },
  { name: "The Genre Bender",          emoji: "🔀", genres: ["alternative", "experimental", "art rock"] },
  { name: "The Sunset Chaser",         emoji: "🌅", genres: ["indie pop", "dream pop", "chillwave"] },
  { name: "The Late Night Philosopher",emoji: "🌃", genres: ["post-punk", "gothic rock", "darkwave"] },
];

function scorePersonality(
  personality: typeof personalityPool[0],
  genreBreakdown: { genre: string; count: number }[]
): number {
  let score = 0;
  const genreCounts = new Map(genreBreakdown.map(g => [g.genre.toLowerCase(), g.count]));

  personality.genres.forEach(targetGenre => {
    genreCounts.forEach((count, genre) => {
      if (genre.includes(targetGenre) || targetGenre.includes(genre)) {
        score += count * 10;
      }
    });
  });

  return score;
}

function assignUniquePersonalities(
  profiles: Array<{ competitorId: string; genreBreakdown: { genre: string; count: number }[] }>
): Map<string, { personality: string; emoji: string }> {
  const assignments = new Map<string, { personality: string; emoji: string }>();
  const usedPersonalities = new Set<string>();

  const scoredProfiles = profiles
    .map(profile => ({
      ...profile,
      scores: personalityPool
        .map(p => ({ personality: p, score: scorePersonality(p, profile.genreBreakdown) }))
        .sort((a, b) => b.score - a.score)
    }))
    .sort((a, b) => (b.scores[0]?.score || 0) - (a.scores[0]?.score || 0));

  scoredProfiles.forEach(profile => {
    for (const { personality } of profile.scores) {
      if (!usedPersonalities.has(personality.name)) {
        assignments.set(profile.competitorId, { personality: personality.name, emoji: personality.emoji });
        usedPersonalities.add(personality.name);
        break;
      }
    }

    if (!assignments.has(profile.competitorId)) {
      const fallback = personalityPool.find(p => !usedPersonalities.has(p.name));
      if (fallback) {
        assignments.set(profile.competitorId, { personality: fallback.name, emoji: fallback.emoji });
        usedPersonalities.add(fallback.name);
      } else {
        assignments.set(profile.competitorId, { personality: "The Music Lover", emoji: "🎶" });
      }
    }
  });

  return assignments;
}

// ─── Submitter Profiles ───────────────────────────────────────────────────────

export function getSubmitterProfiles(): SubmitterMusicProfile[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();

  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));

  // Map track key -> submitter for voting genre analysis
  const submissionLookup = new Map<string, string>(); // key -> artists string
  submissions.forEach(sub => {
    submissionLookup.set(`${sub.spotifyUri}_${sub.roundId}`, sub.artists);
  });

  // Points earned per submitter — validated: forfeited if submitter didn't vote that round
  const { points: pointsLookup } = buildValidatedPointsLookup(votes, submissions);
  const pointsEarned = new Map<string, number>();
  submissions.forEach(sub => {
    const pts = pointsLookup.get(`${sub.spotifyUri}_${sub.roundId}`) || 0;
    pointsEarned.set(sub.submitterId, (pointsEarned.get(sub.submitterId) || 0) + pts);
  });

  // Per-competitor profile data
  const profileMap = new Map<string, {
    artists: Set<string>;
    genres: Map<string, number>;
    count: number;
    votingGenres: Map<string, number>;
    pointsGiven: number;
    negativeVotesGiven: number;
  }>();

  // Init all competitors so even low-activity ones appear
  competitors.forEach(c => {
    profileMap.set(c.id, {
      artists: new Set(),
      genres: new Map(),
      count: 0,
      votingGenres: new Map(),
      pointsGiven: 0,
      negativeVotesGiven: 0
    });
  });

  // Submission analysis
  submissions.forEach(sub => {
    const profile = profileMap.get(sub.submitterId)!;
    profile.count++;

    sub.artists.split(',').forEach(a => {
      const artist = a.trim();
      profile.artists.add(artist);
      inferGenreFromArtist(artist).forEach(genre => {
        profile.genres.set(genre, (profile.genres.get(genre) || 0) + 1);
      });
    });
  });

  // Voting analysis
  votes.forEach(vote => {
    const profile = profileMap.get(vote.voterId);
    if (!profile) return;

    profile.pointsGiven += vote.points;
    if (vote.points < 0) profile.negativeVotesGiven++;

    const artists = submissionLookup.get(`${vote.spotifyUri}_${vote.roundId}`);
    if (!artists || vote.points <= 0) return;

    artists.split(',').forEach(a => {
      inferGenreFromArtist(a.trim()).forEach(genre => {
        profile.votingGenres.set(genre, (profile.votingGenres.get(genre) || 0) + vote.points);
      });
    });
  });

  // Build genre breakdown data for personality assignment
  const competitorGenreData = competitors.map(c => {
    const profile = profileMap.get(c.id)!;
    const genreBreakdown = [...profile.genres.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre, count]) => ({ genre, count }));
    return { competitorId: c.id, genreBreakdown };
  });

  const personalityAssignments = assignUniquePersonalities(competitorGenreData);

  return competitors.map(c => {
    const profile = profileMap.get(c.id)!;

    const genreEntries = [...profile.genres.entries()];
    const totalGenreCount = genreEntries.reduce((sum, [, count]) => sum + count, 0);
    const genreBreakdown = genreEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: totalGenreCount > 0 ? Math.round((count / totalGenreCount) * 100) : 0
      }));

    const votingGenrePreference = [...profile.votingGenres.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, pointsGiven]) => ({ genre, pointsGiven }));

    const assignment = personalityAssignments.get(c.id) || { personality: "The Music Lover", emoji: "🎶" };

    return {
      competitorId: c.id,
      competitorName: competitorMap.get(c.id) || c.id,
      uniqueArtists: profile.artists.size,
      topArtists: [...profile.artists].slice(0, 5),
      submissionCount: profile.count,
      totalPointsEarned: pointsEarned.get(c.id) || 0,
      totalPointsGiven: profile.pointsGiven,
      negativeVotesGiven: profile.negativeVotesGiven,
      genreBreakdown,
      topGenres: genreBreakdown.slice(0, 3).map(g => g.genre),
      votingGenrePreference,
      personality: assignment.personality,
      personalityEmoji: assignment.emoji
    };
  }).sort((a, b) => b.submissionCount - a.submissionCount);
}

// ─── Track Queries ────────────────────────────────────────────────────────────

function buildAllTracks(): TrackWithStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();
  const rounds = getRounds();

  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  const roundMap = new Map(rounds.map(r => [r.id, r.name]));
  const { points, voters, negatives } = buildValidatedPointsLookup(votes, submissions);

  return submissions.map(sub => {
    const key = `${sub.spotifyUri}_${sub.roundId}`;
    return {
      ...sub,
      points: points.get(key) || 0,
      voterCount: voters.get(key) || 0,
      negativeVotes: negatives.get(key) || 0,
      submitterName: competitorMap.get(sub.submitterId) || 'Unknown',
      spotifyEmbedUrl: getSpotifyEmbedUrl(sub.spotifyUri),
      roundName: roundMap.get(sub.roundId) || sub.roundId
    };
  });
}

export function getTopTracks(limit = 20): TrackWithStats[] {
  return buildAllTracks()
    .sort((a, b) => b.points - a.points)
    .slice(0, limit);
}

export function getAllTracks(): TrackWithStats[] {
  return buildAllTracks().sort((a, b) => b.points - a.points);
}

// ─── Summary Stats ────────────────────────────────────────────────────────────

export function getMusicStats() {
  const submissions = getSubmissions();
  const votes = getVotes();
  const artistStats = getArtistStats();
  const albumStats = getAlbumStats();
  const genreStats = getGenreStats();

  const totalPoints = votes.reduce((sum, v) => sum + v.points, 0);
  const negativeVotes = votes.filter(v => v.points < 0).length;

  return {
    totalTracks: submissions.length,
    uniqueArtists: artistStats.length,
    uniqueAlbums: albumStats.length,
    uniqueGenres: genreStats.length,
    totalVotes: votes.length,
    totalPoints,
    negativeVotes,
    mostSubmittedArtist: artistStats[0]?.name || 'N/A',
    mostSubmittedAlbum: albumStats[0]?.name || 'N/A',
    topGenre: genreStats[0]?.genre || 'N/A'
  };
}
