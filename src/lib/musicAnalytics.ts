import { getSubmissions, getCompetitors, getVotes, Submission } from './parseData';
import { inferGenreFromArtist, getGenreColor } from './genreMapping';

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

export interface SubmitterMusicProfile {
  competitorId: string;
  competitorName: string;
  uniqueArtists: number;
  topArtists: string[];
  submissionCount: number;
  genreBreakdown: { genre: string; count: number; percentage: number }[];
  topGenres: string[];
  votingGenrePreference: { genre: string; pointsGiven: number }[];
  personality: string;
  personalityEmoji: string;
}

export interface TrackWithStats extends Submission {
  points: number;
  voterCount: number;
  submitterName: string;
  spotifyEmbedUrl: string;
}

function getSpotifyEmbedUrl(uri: string): string {
  const trackId = uri.replace('spotify:track:', '');
  return `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`;
}

export function getArtistStats(): ArtistStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  
  const pointsLookup = new Map<string, number>();
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    pointsLookup.set(key, (pointsLookup.get(key) || 0) + vote.points);
  });
  
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

export function getAlbumStats(): AlbumStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  
  const pointsLookup = new Map<string, number>();
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    pointsLookup.set(key, (pointsLookup.get(key) || 0) + vote.points);
  });
  
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

export function getGenreStats(): GenreStats[] {
  const artistStats = getArtistStats();
  const genreMap = new Map<string, GenreStats>();
  
  artistStats.forEach(artist => {
    artist.genres.forEach(genre => {
      if (!genreMap.has(genre)) {
        genreMap.set(genre, {
          genre,
          submissionCount: 0,
          totalPoints: 0,
          topArtists: []
        });
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

// Pool of unique personalities with their genre affinities
const personalityPool: { name: string; emoji: string; genres: string[] }[] = [
  { name: "The Indie Purist", emoji: "🎸", genres: ["indie rock", "indie folk", "alternative", "garage rock"] },
  { name: "The Night Owl", emoji: "🌙", genres: ["electronic", "house", "techno", "dance", "uk garage"] },
  { name: "The Beats Enthusiast", emoji: "🎤", genres: ["hip-hop", "rap", "grime", "uk hip-hop"] },
  { name: "The Classic Rocker", emoji: "🤘", genres: ["rock", "hard rock", "classic rock", "blues rock"] },
  { name: "The Smooth Operator", emoji: "🎷", genres: ["jazz", "soul", "r&b", "neo-soul"] },
  { name: "The Chill Viber", emoji: "🌴", genres: ["reggae", "ska", "dub", "dancehall"] },
  { name: "The Rebel", emoji: "⚡", genres: ["punk rock", "post-punk", "hardcore punk", "emo"] },
  { name: "The Storyteller", emoji: "📖", genres: ["folk", "singer-songwriter", "americana", "country"] },
  { name: "The Crowd Pleaser", emoji: "✨", genres: ["pop", "dance pop", "synth-pop"] },
  { name: "The Deep Thinker", emoji: "🌀", genres: ["progressive rock", "art rock", "psychedelic rock"] },
  { name: "The Sensitive Soul", emoji: "🍂", genres: ["indie folk", "dream pop", "slowcore", "shoegaze"] },
  { name: "The Eclectic Tastemaker", emoji: "🎭", genres: ["art pop", "experimental", "avant-garde"] },
  { name: "The Nostalgia Hunter", emoji: "📼", genres: ["new wave", "synth-pop", "80s", "disco"] },
  { name: "The World Traveler", emoji: "🌍", genres: ["afrobeat", "mpb", "tropicália", "world", "latin"] },
  { name: "The Underground Explorer", emoji: "🔦", genres: ["idm", "ambient", "experimental", "hyperpop"] },
  { name: "The Dancefloor General", emoji: "🪩", genres: ["disco", "funk", "dance", "house"] },
  { name: "The Vinyl Collector", emoji: "💿", genres: ["soul", "funk", "jazz", "classic rock"] },
  { name: "The Festival Goer", emoji: "🎪", genres: ["indie rock", "electronic", "alternative"] },
  { name: "The Bedroom DJ", emoji: "🎚️", genres: ["electronic", "drum and bass", "jungle", "uk bass"] },
  { name: "The Melancholy Romantic", emoji: "🥀", genres: ["dream pop", "shoegaze", "post-rock", "gothic rock"] },
  { name: "The Celtic Soul", emoji: "☘️", genres: ["irish trad", "folk", "celtic", "folk punk"] },
  { name: "The Headphone Hermit", emoji: "🎧", genres: ["ambient", "post-rock", "electronic", "idm"] },
  { name: "The Singalong Champion", emoji: "🎵", genres: ["pop rock", "britpop", "power pop", "indie pop"] },
  { name: "The Riff Master", emoji: "🔥", genres: ["heavy metal", "hard rock", "alternative metal", "nu metal"] },
  { name: "The Groove Seeker", emoji: "🕺", genres: ["funk", "disco", "r&b", "soul"] },
  { name: "The Genre Bender", emoji: "🔀", genres: ["alternative", "experimental", "art rock"] },
  { name: "The Sunset Chaser", emoji: "🌅", genres: ["indie pop", "dream pop", "chillwave"] },
  { name: "The Late Night Philosopher", emoji: "🌃", genres: ["post-punk", "gothic rock", "darkwave"] },
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
  profiles: Array<{
    competitorId: string;
    genreBreakdown: { genre: string; count: number }[];
  }>
): Map<string, { personality: string; emoji: string }> {
  const assignments = new Map<string, { personality: string; emoji: string }>();
  const usedPersonalities = new Set<string>();
  
  // Score all profiles against all personalities
  const scoredProfiles = profiles.map(profile => {
    const scores = personalityPool.map(p => ({
      personality: p,
      score: scorePersonality(p, profile.genreBreakdown)
    }));
    scores.sort((a, b) => b.score - a.score);
    return { ...profile, scores };
  });
  
  // Sort profiles by their best score (descending) so strong matches get priority
  scoredProfiles.sort((a, b) => (b.scores[0]?.score || 0) - (a.scores[0]?.score || 0));
  
  // Assign personalities greedily
  scoredProfiles.forEach(profile => {
    for (const { personality } of profile.scores) {
      if (!usedPersonalities.has(personality.name)) {
        assignments.set(profile.competitorId, {
          personality: personality.name,
          emoji: personality.emoji
        });
        usedPersonalities.add(personality.name);
        break;
      }
    }
    
    // Fallback if all preferred personalities are taken
    if (!assignments.has(profile.competitorId)) {
      const fallback = personalityPool.find(p => !usedPersonalities.has(p.name));
      if (fallback) {
        assignments.set(profile.competitorId, {
          personality: fallback.name,
          emoji: fallback.emoji
        });
        usedPersonalities.add(fallback.name);
      } else {
        assignments.set(profile.competitorId, {
          personality: "The Music Lover",
          emoji: "🎶"
        });
      }
    }
  });
  
  return assignments;
}

export function getSubmitterProfiles(): SubmitterMusicProfile[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  
  // Build submission lookup for genre analysis of votes
  const submissionLookup = new Map<string, { artists: string }>();
  submissions.forEach(sub => {
    const key = `${sub.spotifyUri}_${sub.roundId}`;
    submissionLookup.set(key, { artists: sub.artists });
  });
  
  // Analyze each competitor
  const profileMap = new Map<string, {
    artists: Set<string>;
    genres: Map<string, number>;
    count: number;
    votingGenres: Map<string, number>;
  }>();
  
  // Analyze submissions
  submissions.forEach(sub => {
    if (!profileMap.has(sub.submitterId)) {
      profileMap.set(sub.submitterId, {
        artists: new Set(),
        genres: new Map(),
        count: 0,
        votingGenres: new Map()
      });
    }
    const profile = profileMap.get(sub.submitterId)!;
    profile.count++;
    
    sub.artists.split(',').forEach(a => {
      const artist = a.trim();
      profile.artists.add(artist);
      
      const genres = inferGenreFromArtist(artist);
      genres.forEach(genre => {
        profile.genres.set(genre, (profile.genres.get(genre) || 0) + 1);
      });
    });
  });
  
  // Analyze voting preferences
  votes.forEach(vote => {
    if (vote.points <= 0) return; // Only count positive votes
    
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submission = submissionLookup.get(key);
    if (!submission) return;
    
    if (!profileMap.has(vote.voterId)) {
      profileMap.set(vote.voterId, {
        artists: new Set(),
        genres: new Map(),
        count: 0,
        votingGenres: new Map()
      });
    }
    const profile = profileMap.get(vote.voterId)!;
    
    submission.artists.split(',').forEach(a => {
      const artist = a.trim();
      const genres = inferGenreFromArtist(artist);
      genres.forEach(genre => {
        profile.votingGenres.set(genre, (profile.votingGenres.get(genre) || 0) + vote.points);
      });
    });
  });
  
  // First pass: build genre breakdowns for all competitors
  const competitorGenreData = competitors.map(c => {
    const profile = profileMap.get(c.id);
    const genreEntries = profile ? [...profile.genres.entries()] : [];
    const genreBreakdown = genreEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre, count]) => ({ genre, count }));
    
    return { competitorId: c.id, genreBreakdown };
  });
  
  // Assign unique personalities
  const personalityAssignments = assignUniquePersonalities(competitorGenreData);
  
  return competitors.map(c => {
    const profile = profileMap.get(c.id);
    const artistList = profile ? [...profile.artists] : [];
    
    // Calculate genre breakdown
    const genreEntries = profile ? [...profile.genres.entries()] : [];
    const totalGenreCount = genreEntries.reduce((sum, [_, count]) => sum + count, 0);
    const genreBreakdown = genreEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([genre, count]) => ({
        genre,
        count,
        percentage: totalGenreCount > 0 ? Math.round((count / totalGenreCount) * 100) : 0
      }));
    
    const topGenres = genreBreakdown.slice(0, 3).map(g => g.genre);
    
    // Calculate voting preferences
    const votingEntries = profile ? [...profile.votingGenres.entries()] : [];
    const votingGenrePreference = votingEntries
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre, pointsGiven]) => ({ genre, pointsGiven }));
    
    const assignment = personalityAssignments.get(c.id) || { personality: "The Music Lover", emoji: "🎶" };
    
    return {
      competitorId: c.id,
      competitorName: c.name,
      uniqueArtists: artistList.length,
      topArtists: artistList.slice(0, 5),
      submissionCount: profile?.count || 0,
      genreBreakdown,
      topGenres,
      votingGenrePreference,
      personality: assignment.personality,
      personalityEmoji: assignment.emoji
    };
  }).sort((a, b) => b.submissionCount - a.submissionCount);
}

export function getTopTracks(limit = 20): TrackWithStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  
  const statsLookup = new Map<string, { points: number; voters: number }>();
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const current = statsLookup.get(key) || { points: 0, voters: 0 };
    current.points += vote.points;
    current.voters++;
    statsLookup.set(key, current);
  });
  
  const tracks: TrackWithStats[] = submissions.map(sub => {
    const key = `${sub.spotifyUri}_${sub.roundId}`;
    const stats = statsLookup.get(key) || { points: 0, voters: 0 };
    
    return {
      ...sub,
      points: stats.points,
      voterCount: stats.voters,
      submitterName: competitorMap.get(sub.submitterId) || 'Unknown',
      spotifyEmbedUrl: getSpotifyEmbedUrl(sub.spotifyUri)
    };
  });
  
  return tracks.sort((a, b) => b.points - a.points).slice(0, limit);
}

export function getAllTracks(): TrackWithStats[] {
  const submissions = getSubmissions();
  const votes = getVotes();
  const competitors = getCompetitors();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c.name]));
  
  const statsLookup = new Map<string, { points: number; voters: number }>();
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const current = statsLookup.get(key) || { points: 0, voters: 0 };
    current.points += vote.points;
    current.voters++;
    statsLookup.set(key, current);
  });
  
  return submissions.map(sub => {
    const key = `${sub.spotifyUri}_${sub.roundId}`;
    const stats = statsLookup.get(key) || { points: 0, voters: 0 };
    
    return {
      ...sub,
      points: stats.points,
      voterCount: stats.voters,
      submitterName: competitorMap.get(sub.submitterId) || 'Unknown',
      spotifyEmbedUrl: getSpotifyEmbedUrl(sub.spotifyUri)
    };
  });
}

export function getMusicStats() {
  const submissions = getSubmissions();
  const artistStats = getArtistStats();
  const albumStats = getAlbumStats();
  const genreStats = getGenreStats();
  
  return {
    totalTracks: submissions.length,
    uniqueArtists: artistStats.length,
    uniqueAlbums: albumStats.length,
    uniqueGenres: genreStats.length,
    mostSubmittedArtist: artistStats[0]?.name || 'N/A',
    mostSubmittedAlbum: albumStats[0]?.name || 'N/A',
    topGenre: genreStats[0]?.genre || 'N/A'
  };
}
