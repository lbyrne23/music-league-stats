// Parse CSV data from imported files
import competitorsRaw from '@/data/competitors.csv?raw';
import roundsRaw from '@/data/rounds.csv?raw';
import submissionsRaw from '@/data/submissions.csv?raw';
import votesRaw from '@/data/votes.csv?raw';

export interface Competitor {
  id: string;
  name: string;
}

export interface Round {
  id: string;
  created: string;
  name: string;
  description: string;
  playlistUrl: string;
}

export interface Submission {
  spotifyUri: string;
  title: string;
  album: string;
  artists: string;
  submitterId: string;
  created: string;
  comment: string;
  roundId: string;
  visibleToVoters: string;
}

export interface Vote {
  spotifyUri: string;
  voterId: string;
  created: string;
  points: number;
  comment: string;
  roundId: string;
}

// Robust CSV parser that handles quoted fields with commas and newlines
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

function parseCSVMultiline(csv: string): string[][] {
  const rows: string[][] = [];
  let currentLine = '';
  let inQuotes = false;
  
  const lines = csv.split('\n');
  
  for (const line of lines) {
    if (!currentLine) {
      currentLine = line;
    } else {
      currentLine += '\n' + line;
    }
    
    // Count quotes to see if we're still in a quoted field
    let quoteCount = 0;
    for (const char of currentLine) {
      if (char === '"') quoteCount++;
    }
    inQuotes = quoteCount % 2 !== 0;
    
    if (!inQuotes) {
      if (currentLine.trim()) {
        rows.push(parseCSVLine(currentLine));
      }
      currentLine = '';
    }
  }
  
  return rows;
}

export function getCompetitors(): Competitor[] {
  const rows = parseCSVMultiline(competitorsRaw);
  return rows.slice(1).map(row => ({
    id: row[0] || '',
    name: row[1] || '',
  }));
}

export function getRounds(): Round[] {
  const rows = parseCSVMultiline(roundsRaw);
  return rows.slice(1).map(row => ({
    id: row[0] || '',
    created: row[1] || '',
    name: (row[2] || '').trim(),
    description: row[3] || '',
    playlistUrl: row[4] || '',
  }));
}

export function getSubmissions(): Submission[] {
  const rows = parseCSVMultiline(submissionsRaw);
  return rows.slice(1).map(row => ({
    spotifyUri: row[0] || '',
    title: row[1] || '',
    album: row[2] || '',
    artists: row[3] || '',
    submitterId: row[4] || '',
    created: row[5] || '',
    comment: row[6] || '',
    roundId: row[7] || '',
    visibleToVoters: row[8] || '',
  }));
}

export function getVotes(): Vote[] {
  const rows = parseCSVMultiline(votesRaw);
  return rows.slice(1).map(row => ({
    spotifyUri: row[0] || '',
    voterId: row[1] || '',
    created: row[2] || '',
    points: parseInt(row[3], 10) || 0,
    comment: row[4] || '',
    roundId: row[5] || '',
  }));
}

export interface LeaderboardEntry {
  competitor: Competitor;
  totalPoints: number;
  roundsPlayed: number;
  averagePoints: number;
  wins: number;
  topThreeFinishes: number;
}

export interface RoundResult {
  round: Round;
  standings: {
    competitor: Competitor;
    points: number;
    submission?: Submission;
  }[];
}

export function calculateLeaderboard(): LeaderboardEntry[] {
  const competitors = getCompetitors();
  const submissions = getSubmissions();
  const votes = getVotes();
  const rounds = getRounds();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c]));
  
  // Build a lookup: spotifyUri + roundId -> submitterId
  const submissionLookup = new Map<string, string>();
  submissions.forEach(s => {
    const key = `${s.spotifyUri}_${s.roundId}`;
    submissionLookup.set(key, s.submitterId);
  });
  
  // Calculate points per competitor per round
  const pointsByCompetitorByRound = new Map<string, Map<string, number>>();
  
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (!submitterId) return;
    
    if (!pointsByCompetitorByRound.has(submitterId)) {
      pointsByCompetitorByRound.set(submitterId, new Map());
    }
    
    const competitorRounds = pointsByCompetitorByRound.get(submitterId)!;
    const currentPoints = competitorRounds.get(vote.roundId) || 0;
    competitorRounds.set(vote.roundId, currentPoints + vote.points);
  });
  
  // Calculate wins and top 3 finishes per round
  const roundResults = new Map<string, { competitorId: string; points: number }[]>();
  
  rounds.forEach(round => {
    const roundStandings: { competitorId: string; points: number }[] = [];
    
    pointsByCompetitorByRound.forEach((roundsMap, competitorId) => {
      if (roundsMap.has(round.id)) {
        roundStandings.push({ competitorId, points: roundsMap.get(round.id)! });
      }
    });
    
    roundStandings.sort((a, b) => b.points - a.points);
    roundResults.set(round.id, roundStandings);
  });
  
  // Calculate final leaderboard
  const leaderboard: LeaderboardEntry[] = competitors.map(competitor => {
    const roundsMap = pointsByCompetitorByRound.get(competitor.id) || new Map();
    const totalPoints = Array.from(roundsMap.values()).reduce((sum, p) => sum + p, 0);
    const roundsPlayed = roundsMap.size;
    
    let wins = 0;
    let topThreeFinishes = 0;
    
    roundResults.forEach(standings => {
      const position = standings.findIndex(s => s.competitorId === competitor.id);
      if (position === 0) wins++;
      if (position >= 0 && position < 3) topThreeFinishes++;
    });
    
    return {
      competitor,
      totalPoints,
      roundsPlayed,
      averagePoints: roundsPlayed > 0 ? totalPoints / roundsPlayed : 0,
      wins,
      topThreeFinishes,
    };
  });
  
  return leaderboard.sort((a, b) => b.totalPoints - a.totalPoints);
}

export function getRoundResults(): RoundResult[] {
  const competitors = getCompetitors();
  const submissions = getSubmissions();
  const votes = getVotes();
  const rounds = getRounds();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c]));
  
  return rounds.map(round => {
    const roundSubmissions = submissions.filter(s => s.roundId === round.id);
    const roundVotes = votes.filter(v => v.roundId === round.id);
    
    // Build submission lookup for this round
    const submissionByUri = new Map<string, Submission>();
    roundSubmissions.forEach(s => {
      submissionByUri.set(s.spotifyUri, s);
    });
    
    const pointsBySubmitter = new Map<string, number>();
    
    roundVotes.forEach(vote => {
      const submission = submissionByUri.get(vote.spotifyUri);
      if (!submission) return;
      
      const current = pointsBySubmitter.get(submission.submitterId) || 0;
      pointsBySubmitter.set(submission.submitterId, current + vote.points);
    });
    
    const standings = Array.from(pointsBySubmitter.entries())
      .map(([submitterId, points]) => ({
        competitor: competitorMap.get(submitterId)!,
        points,
        submission: roundSubmissions.find(s => s.submitterId === submitterId),
      }))
      .filter(s => s.competitor)
      .sort((a, b) => b.points - a.points);
    
    return { round, standings };
  });
}

export function getStats() {
  const competitors = getCompetitors();
  const rounds = getRounds();
  const submissions = getSubmissions();
  const votes = getVotes();
  
  const totalPoints = votes.reduce((sum, v) => sum + v.points, 0);
  
  return {
    totalCompetitors: competitors.length,
    totalRounds: rounds.length,
    totalSubmissions: submissions.length,
    totalVotes: votes.length,
    totalPoints,
  };
}
