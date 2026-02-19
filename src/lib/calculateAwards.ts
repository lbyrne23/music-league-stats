import { getCompetitors, getSubmissions, getVotes, getRounds, getRoundResults, Competitor, Submission, Vote } from './parseData';

export interface AwardRanking {
  competitor: Competitor;
  value: number;
  formattedValue: string;
}

export interface Award {
  id: string;
  name: string;
  description: string;
  winner: Competitor | null;
  winnerSecondary?: Competitor | null;
  value: number | string;
  icon: string;
  rankings: AwardRanking[];
  metricLabel: string;
  sortOrder: 'desc' | 'asc';
}

export function calculateAwards(): Award[] {
  const competitors = getCompetitors();
  const submissions = getSubmissions();
  const votes = getVotes();
  const rounds = getRounds();
  const roundResults = getRoundResults();
  
  const competitorMap = new Map(competitors.map(c => [c.id, c]));
  
  // Build submission lookup: spotifyUri + roundId -> submitterId
  const submissionLookup = new Map<string, string>();
  submissions.forEach(s => {
    const key = `${s.spotifyUri}_${s.roundId}`;
    submissionLookup.set(key, s.submitterId);
  });

  const awards: Award[] = [];

  // Helper to create rankings from a map
  const createRankings = (
    data: Map<string, number>, 
    formatFn: (v: number) => string,
    sortDesc: boolean = true
  ): AwardRanking[] => {
    const entries = [...data.entries()]
      .filter(([id]) => competitorMap.has(id))
      .sort((a, b) => sortDesc ? b[1] - a[1] : a[1] - b[1]);
    
    return entries.map(([id, value]) => ({
      competitor: competitorMap.get(id)!,
      value,
      formattedValue: formatFn(value)
    }));
  };

  // 1. Overall Winner - Most total points
  const totalPointsPerCompetitor = new Map<string, number>();
  competitors.forEach(c => totalPointsPerCompetitor.set(c.id, 0));
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId) {
      totalPointsPerCompetitor.set(submitterId, (totalPointsPerCompetitor.get(submitterId) || 0) + vote.points);
    }
  });
  const overallRankings = createRankings(totalPointsPerCompetitor, v => `${v} pts`);
  const overallWinner = overallRankings[0];
  awards.push({
    id: 'overall-winner',
    name: 'Overall Winner',
    description: 'The most points across all rounds',
    winner: overallWinner?.competitor || null,
    value: overallWinner?.value || 0,
    icon: 'trophy',
    rankings: overallRankings,
    metricLabel: 'Points',
    sortOrder: 'desc'
  });

  // 2. Most 1st Place Finishes
  const winsPerCompetitor = new Map<string, number>();
  competitors.forEach(c => winsPerCompetitor.set(c.id, 0));
  roundResults.forEach(result => {
    if (result.standings[0]) {
      const winnerId = result.standings[0].competitor.id;
      winsPerCompetitor.set(winnerId, (winsPerCompetitor.get(winnerId) || 0) + 1);
    }
  });
  const winsRankings = createRankings(winsPerCompetitor, v => `${v} wins`);
  const mostWins = winsRankings[0];
  awards.push({
    id: 'most-wins',
    name: 'Most 1st Place Finishes',
    description: 'Won the most rounds',
    winner: mostWins?.competitor || null,
    value: mostWins ? `${mostWins.value} wins` : '0 wins',
    icon: 'crown',
    rankings: winsRankings,
    metricLabel: 'Wins',
    sortOrder: 'desc'
  });

  // 3. The Octopus - Person who got the most 8's
  const eightsReceived = new Map<string, number>();
  competitors.forEach(c => eightsReceived.set(c.id, 0));
  votes.filter(v => v.points === 8).forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId) {
      eightsReceived.set(submitterId, (eightsReceived.get(submitterId) || 0) + 1);
    }
  });
  const eightsReceivedRankings = createRankings(eightsReceived, v => `${v} eights`);
  const mostEightsReceived = eightsReceivedRankings[0];
  awards.push({
    id: 'octopus',
    name: 'The Octopus',
    description: 'Received the most 8-point votes',
    winner: mostEightsReceived?.competitor || null,
    value: mostEightsReceived ? `${mostEightsReceived.value} eights` : '0 eights',
    icon: 'star',
    rankings: eightsReceivedRankings,
    metricLabel: '8s Received',
    sortOrder: 'desc'
  });

  // 4. The Generous Octopus - Person who gave the most 8's
  const eightsGiven = new Map<string, number>();
  competitors.forEach(c => eightsGiven.set(c.id, 0));
  votes.filter(v => v.points === 8).forEach(vote => {
    eightsGiven.set(vote.voterId, (eightsGiven.get(vote.voterId) || 0) + 1);
  });
  const eightsGivenRankings = createRankings(eightsGiven, v => `${v} eights`);
  const mostEightsGiven = eightsGivenRankings[0];
  awards.push({
    id: 'generous-octopus',
    name: 'The Generous Octopus',
    description: 'Gave out the most 8-point votes',
    winner: mostEightsGiven?.competitor || null,
    value: mostEightsGiven ? `${mostEightsGiven.value} eights given` : '0 eights',
    icon: 'gift',
    rankings: eightsGivenRankings,
    metricLabel: '8s Given',
    sortOrder: 'desc'
  });

  // 5. Close Shaver - Person who came 2nd the most
  const secondPlaces = new Map<string, number>();
  competitors.forEach(c => secondPlaces.set(c.id, 0));
  roundResults.forEach(result => {
    if (result.standings[1]) {
      const secondId = result.standings[1].competitor.id;
      secondPlaces.set(secondId, (secondPlaces.get(secondId) || 0) + 1);
    }
  });
  const secondPlaceRankings = createRankings(secondPlaces, v => `${v} silvers`);
  const mostSeconds = secondPlaceRankings[0];
  awards.push({
    id: 'close-shaver',
    name: 'Close Shaver',
    description: 'Came 2nd place the most times',
    winner: mostSeconds?.competitor || null,
    value: mostSeconds ? `${mostSeconds.value} silver medals` : '0',
    icon: 'medal',
    rankings: secondPlaceRankings,
    metricLabel: '2nd Places',
    sortOrder: 'desc'
  });

  // 6. Public Enemy - Person who got the most downvotes
  const downvotesReceived = new Map<string, number>();
  competitors.forEach(c => downvotesReceived.set(c.id, 0));
  votes.filter(v => v.points < 0).forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId) {
      downvotesReceived.set(submitterId, (downvotesReceived.get(submitterId) || 0) + Math.abs(vote.points));
    }
  });
  const downvoteRankings = createRankings(downvotesReceived, v => `${v} pts`);
  const mostDownvoted = downvoteRankings[0];
  awards.push({
    id: 'public-enemy',
    name: 'Public Enemy',
    description: 'Received the most downvotes',
    winner: mostDownvoted?.competitor || null,
    value: mostDownvoted ? `${mostDownvoted.value} downvote points` : '0',
    icon: 'skull',
    rankings: downvoteRankings,
    metricLabel: 'Downvote Pts',
    sortOrder: 'desc'
  });

  // 7. Best Buddies - People who gave each other the most points combined
  const pairPoints = new Map<string, number>();
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId && submitterId !== vote.voterId) {
      const pairKey = [vote.voterId, submitterId].sort().join('_');
      pairPoints.set(pairKey, (pairPoints.get(pairKey) || 0) + vote.points);
    }
  });
  const bestBuddies = [...pairPoints.entries()].sort((a, b) => b[1] - a[1])[0];
  const buddyIds = bestBuddies ? bestBuddies[0].split('_') : [];
  
  // For pair awards, show points given to others
  const pointsGivenToOthers = new Map<string, number>();
  competitors.forEach(c => pointsGivenToOthers.set(c.id, 0));
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId && submitterId !== vote.voterId) {
      pointsGivenToOthers.set(vote.voterId, (pointsGivenToOthers.get(vote.voterId) || 0) + vote.points);
    }
  });
  const buddiesRankings = createRankings(pointsGivenToOthers, v => `${v} pts given`);
  
  awards.push({
    id: 'best-buddies',
    name: 'Best Buddies',
    description: 'Gave each other the most points combined',
    winner: buddyIds[0] ? competitorMap.get(buddyIds[0]) || null : null,
    winnerSecondary: buddyIds[1] ? competitorMap.get(buddyIds[1]) || null : null,
    value: bestBuddies ? `${bestBuddies[1]} combined points` : '0',
    icon: 'heart',
    rankings: buddiesRankings,
    metricLabel: 'Pts Given',
    sortOrder: 'desc'
  });

  // 8. One Sided Love - Person who gave a lot to someone who didn't reciprocate
  const directedPoints = new Map<string, Map<string, number>>();
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId && submitterId !== vote.voterId) {
      if (!directedPoints.has(vote.voterId)) {
        directedPoints.set(vote.voterId, new Map());
      }
      const voterMap = directedPoints.get(vote.voterId)!;
      voterMap.set(submitterId, (voterMap.get(submitterId) || 0) + vote.points);
    }
  });
  
  // Calculate max asymmetry for each person
  const maxAsymmetryByPerson = new Map<string, number>();
  competitors.forEach(c => maxAsymmetryByPerson.set(c.id, 0));
  
  directedPoints.forEach((targets, giverId) => {
    targets.forEach((given, receiverId) => {
      const received = directedPoints.get(receiverId)?.get(giverId) || 0;
      const asymmetry = given - received;
      if (asymmetry > (maxAsymmetryByPerson.get(giverId) || 0)) {
        maxAsymmetryByPerson.set(giverId, asymmetry);
      }
    });
  });
  
  const asymmetryRankings = createRankings(maxAsymmetryByPerson, v => `+${v} diff`);
  
  let maxAsymmetry = 0;
  let oneSidedGiver: string | null = null;
  let oneSidedReceiver: string | null = null;
  
  directedPoints.forEach((targets, giverId) => {
    targets.forEach((given, receiverId) => {
      const received = directedPoints.get(receiverId)?.get(giverId) || 0;
      const asymmetry = given - received;
      if (asymmetry > maxAsymmetry) {
        maxAsymmetry = asymmetry;
        oneSidedGiver = giverId;
        oneSidedReceiver = receiverId;
      }
    });
  });
  awards.push({
    id: 'one-sided-love',
    name: 'One Sided Love',
    description: 'Gave lots of points to someone who didn\'t reciprocate',
    winner: oneSidedGiver ? competitorMap.get(oneSidedGiver) || null : null,
    winnerSecondary: oneSidedReceiver ? competitorMap.get(oneSidedReceiver) || null : null,
    value: `${maxAsymmetry} point difference`,
    icon: 'heart-crack',
    rankings: asymmetryRankings,
    metricLabel: 'Max Diff',
    sortOrder: 'desc'
  });

  // 9. Sworn Enemies - People who gave each other the lowest points
  const worstEnemies = [...pairPoints.entries()].sort((a, b) => a[1] - b[1])[0];
  const enemyIds = worstEnemies ? worstEnemies[0].split('_') : [];
  
  // For enemies, show points received from others (lower is "worse")
  const pointsReceivedFromOthers = new Map<string, number>();
  competitors.forEach(c => pointsReceivedFromOthers.set(c.id, 0));
  votes.forEach(vote => {
    const key = `${vote.spotifyUri}_${vote.roundId}`;
    const submitterId = submissionLookup.get(key);
    if (submitterId && submitterId !== vote.voterId) {
      pointsReceivedFromOthers.set(submitterId, (pointsReceivedFromOthers.get(submitterId) || 0) + vote.points);
    }
  });
  const enemiesRankings = createRankings(pointsReceivedFromOthers, v => `${v} pts`, false);
  
  awards.push({
    id: 'sworn-enemies',
    name: 'Sworn Enemies',
    description: 'Gave each other the lowest combined points',
    winner: enemyIds[0] ? competitorMap.get(enemyIds[0]) || null : null,
    winnerSecondary: enemyIds[1] ? competitorMap.get(enemyIds[1]) || null : null,
    value: worstEnemies ? `${worstEnemies[1]} combined points` : '0',
    icon: 'swords',
    rankings: enemiesRankings,
    metricLabel: 'Pts Received',
    sortOrder: 'asc'
  });

  // 10. The Contrarian - Person who gives low scores regularly
  const voteCounts = new Map<string, number>();
  const votePointTotals = new Map<string, number>();
  votes.forEach(vote => {
    voteCounts.set(vote.voterId, (voteCounts.get(vote.voterId) || 0) + 1);
    votePointTotals.set(vote.voterId, (votePointTotals.get(vote.voterId) || 0) + vote.points);
  });
  
  const avgPointsGiven = new Map<string, number>();
  competitors.forEach(c => {
    const count = voteCounts.get(c.id) || 0;
    const total = votePointTotals.get(c.id) || 0;
    if (count >= 5) {
      avgPointsGiven.set(c.id, total / count);
    }
  });
  const contrarianRankings = createRankings(avgPointsGiven, v => v.toFixed(2), false);
  const contrarian = contrarianRankings[0];
  
  awards.push({
    id: 'contrarian',
    name: 'The Contrarian',
    description: 'Gives the lowest scores on average',
    winner: contrarian?.competitor || null,
    value: contrarian ? `${contrarian.value.toFixed(2)} avg points given` : 'N/A',
    icon: 'thumbs-down',
    rankings: contrarianRankings,
    metricLabel: 'Avg Given',
    sortOrder: 'asc'
  });

  // 11. Most Consistent - Person who kept same position most often
  const positionsByCompetitor = new Map<string, number[]>();
  roundResults.forEach(result => {
    result.standings.forEach((standing, index) => {
      const positions = positionsByCompetitor.get(standing.competitor.id) || [];
      positions.push(index + 1);
      positionsByCompetitor.set(standing.competitor.id, positions);
    });
  });
  
  const varianceByCompetitor = new Map<string, number>();
  positionsByCompetitor.forEach((positions, competitorId) => {
    if (positions.length >= 5) {
      const avg = positions.reduce((a, b) => a + b, 0) / positions.length;
      const variance = positions.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / positions.length;
      varianceByCompetitor.set(competitorId, variance);
    }
  });
  const consistentRankings = createRankings(varianceByCompetitor, v => `σ²=${v.toFixed(2)}`, false);
  const mostConsistent = consistentRankings[0];
  
  awards.push({
    id: 'most-consistent',
    name: 'Most Consistent',
    description: 'Finished in similar positions across rounds',
    winner: mostConsistent?.competitor || null,
    value: mostConsistent ? `σ² = ${mostConsistent.value.toFixed(2)}` : 'N/A',
    icon: 'target',
    rankings: consistentRankings,
    metricLabel: 'Variance',
    sortOrder: 'asc'
  });

  // 12. The Narrator - Person who left the most/longest comments
  const commentLengths = new Map<string, number>();
  competitors.forEach(c => commentLengths.set(c.id, 0));
  votes.forEach(vote => {
    if (vote.comment) {
      commentLengths.set(vote.voterId, (commentLengths.get(vote.voterId) || 0) + vote.comment.length);
    }
  });
  const narratorRankings = createRankings(commentLengths, v => v.toLocaleString());
  const narrator = narratorRankings[0];
  awards.push({
    id: 'narrator',
    name: 'The Narrator',
    description: 'Left the most extensive comments',
    winner: narrator?.competitor || null,
    value: narrator ? `${narrator.value.toLocaleString()} characters` : '0',
    icon: 'message-square',
    rankings: narratorRankings,
    metricLabel: 'Characters',
    sortOrder: 'desc'
  });

  // 13. Biggest Fall From Grace - Started high, ended low
  const sortedRounds = [...rounds].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
  const firstHalfRounds = sortedRounds.slice(0, Math.floor(sortedRounds.length / 2)).map(r => r.id);
  const secondHalfRounds = sortedRounds.slice(Math.floor(sortedRounds.length / 2)).map(r => r.id);
  
  const firstHalfAvg = new Map<string, { total: number; count: number }>();
  const secondHalfAvg = new Map<string, { total: number; count: number }>();
  
  roundResults.forEach(result => {
    const isFirstHalf = firstHalfRounds.includes(result.round.id);
    const targetMap = isFirstHalf ? firstHalfAvg : secondHalfAvg;
    
    result.standings.forEach((standing, index) => {
      const current = targetMap.get(standing.competitor.id) || { total: 0, count: 0 };
      current.total += index + 1;
      current.count += 1;
      targetMap.set(standing.competitor.id, current);
    });
  });
  
  const fallByCompetitor = new Map<string, number>();
  competitors.forEach(c => {
    const first = firstHalfAvg.get(c.id);
    const second = secondHalfAvg.get(c.id);
    if (first && second && first.count >= 3 && second.count >= 3) {
      const firstAvgPos = first.total / first.count;
      const secondAvgPos = second.total / second.count;
      const fall = secondAvgPos - firstAvgPos;
      fallByCompetitor.set(c.id, fall);
    }
  });
  const fallRankings = createRankings(fallByCompetitor, v => `${v > 0 ? '+' : ''}${v.toFixed(1)} pos`);
  const fallenOne = fallRankings[0];
  
  awards.push({
    id: 'fall-from-grace',
    name: 'Fall From Grace',
    description: 'Started strong but dropped off',
    winner: fallenOne?.competitor || null,
    value: fallenOne ? `${fallenOne.value.toFixed(1)} positions lower` : 'N/A',
    icon: 'trending-down',
    rankings: fallRankings,
    metricLabel: 'Position Δ',
    sortOrder: 'desc'
  });

  // 14. Redemption Arc - Started low, ended high
  const riseByCompetitor = new Map<string, number>();
  competitors.forEach(c => {
    const first = firstHalfAvg.get(c.id);
    const second = secondHalfAvg.get(c.id);
    if (first && second && first.count >= 3 && second.count >= 3) {
      const firstAvgPos = first.total / first.count;
      const secondAvgPos = second.total / second.count;
      const rise = firstAvgPos - secondAvgPos;
      riseByCompetitor.set(c.id, rise);
    }
  });
  const riseRankings = createRankings(riseByCompetitor, v => `${v > 0 ? '+' : ''}${v.toFixed(1)} pos`);
  const risenOne = riseRankings[0];
  
  awards.push({
    id: 'redemption-arc',
    name: 'Redemption Arc',
    description: 'Started slow but rose to the top',
    winner: risenOne?.competitor || null,
    value: risenOne ? `${risenOne.value.toFixed(1)} positions higher` : 'N/A',
    icon: 'trending-up',
    rankings: riseRankings,
    metricLabel: 'Position Δ',
    sortOrder: 'desc'
  });

  // 15. Night Owl - Person who submits late at night (10pm - 4am)
  const nightSubmissions = new Map<string, number>();
  competitors.forEach(c => nightSubmissions.set(c.id, 0));
  submissions.forEach(sub => {
    if (sub.created) {
      const date = new Date(sub.created);
      const hour = date.getHours();
      if (hour >= 22 || hour < 4) {
        nightSubmissions.set(sub.submitterId, (nightSubmissions.get(sub.submitterId) || 0) + 1);
      }
    }
  });
  const nightOwlRankings = createRankings(nightSubmissions, v => `${v} subs`);
  const nightOwl = nightOwlRankings[0];
  awards.push({
    id: 'night-owl',
    name: 'The Night Owl',
    description: 'Submits songs between 10pm and 4am',
    winner: nightOwl?.competitor || null,
    value: nightOwl ? `${nightOwl.value} late-night submissions` : '0',
    icon: 'moon',
    rankings: nightOwlRankings,
    metricLabel: 'Late Subs',
    sortOrder: 'desc'
  });

  // 16. The Dunce - Person who submits/votes last consistently
  const lastSubmissionCounts = new Map<string, number>();
  const lastVoteCounts = new Map<string, number>();
  
  const submissionsByRound = new Map<string, Submission[]>();
  submissions.forEach(sub => {
    if (!submissionsByRound.has(sub.roundId)) {
      submissionsByRound.set(sub.roundId, []);
    }
    submissionsByRound.get(sub.roundId)!.push(sub);
  });
  
  submissionsByRound.forEach(roundSubs => {
    const sorted = roundSubs.filter(s => s.created).sort((a, b) => 
      new Date(b.created).getTime() - new Date(a.created).getTime()
    );
    if (sorted.length > 0) {
      const lastSubmitter = sorted[0].submitterId;
      lastSubmissionCounts.set(lastSubmitter, (lastSubmissionCounts.get(lastSubmitter) || 0) + 1);
    }
  });

  const votesByRound = new Map<string, Vote[]>();
  votes.forEach(vote => {
    if (!votesByRound.has(vote.roundId)) {
      votesByRound.set(vote.roundId, []);
    }
    votesByRound.get(vote.roundId)!.push(vote);
  });

  votesByRound.forEach(roundVotes => {
    const lastVoteByVoter = new Map<string, Date>();
    roundVotes.forEach(v => {
      if (v.created) {
        const voteTime = new Date(v.created);
        const existing = lastVoteByVoter.get(v.voterId);
        if (!existing || voteTime > existing) {
          lastVoteByVoter.set(v.voterId, voteTime);
        }
      }
    });
    
    let latestVoterId: string | null = null;
    let latestTime: Date | null = null;
    lastVoteByVoter.forEach((time, voterId) => {
      if (!latestTime || time > latestTime) {
        latestTime = time;
        latestVoterId = voterId;
      }
    });
    
    if (latestVoterId) {
      lastVoteCounts.set(latestVoterId, (lastVoteCounts.get(latestVoterId) || 0) + 1);
    }
  });

  const totalLateness = new Map<string, number>();
  competitors.forEach(c => totalLateness.set(c.id, 0));
  lastSubmissionCounts.forEach((count, id) => {
    totalLateness.set(id, (totalLateness.get(id) || 0) + count);
  });
  lastVoteCounts.forEach((count, id) => {
    totalLateness.set(id, (totalLateness.get(id) || 0) + count);
  });

  const dunceRankings = createRankings(totalLateness, v => `${v}× last`);
  const dunce = dunceRankings[0];
  awards.push({
    id: 'dunce',
    name: 'The Dunce',
    description: 'Consistently submits or votes last in rounds',
    winner: dunce?.competitor || null,
    value: dunce ? `${dunce.value} times last` : '0',
    icon: 'alarm-clock-off',
    rankings: dunceRankings,
    metricLabel: 'Times Last',
    sortOrder: 'desc'
  });

  // 17. The Eager Beaver - Person who submits/votes first consistently
  const firstSubmissionCounts = new Map<string, number>();
  const firstVoteCounts = new Map<string, number>();
  
  submissionsByRound.forEach(roundSubs => {
    const sorted = roundSubs.filter(s => s.created).sort((a, b) => 
      new Date(a.created).getTime() - new Date(b.created).getTime()
    );
    if (sorted.length > 0) {
      const firstSubmitter = sorted[0].submitterId;
      firstSubmissionCounts.set(firstSubmitter, (firstSubmissionCounts.get(firstSubmitter) || 0) + 1);
    }
  });

  votesByRound.forEach(roundVotes => {
    const firstVoteByVoter = new Map<string, Date>();
    roundVotes.forEach(v => {
      if (v.created) {
        const voteTime = new Date(v.created);
        const existing = firstVoteByVoter.get(v.voterId);
        if (!existing || voteTime < existing) {
          firstVoteByVoter.set(v.voterId, voteTime);
        }
      }
    });
    
    let earliestVoterId: string | null = null;
    let earliestTime: Date | null = null;
    firstVoteByVoter.forEach((time, voterId) => {
      if (!earliestTime || time < earliestTime) {
        earliestTime = time;
        earliestVoterId = voterId;
      }
    });
    
    if (earliestVoterId) {
      firstVoteCounts.set(earliestVoterId, (firstVoteCounts.get(earliestVoterId) || 0) + 1);
    }
  });

  const totalEarliness = new Map<string, number>();
  competitors.forEach(c => totalEarliness.set(c.id, 0));
  firstSubmissionCounts.forEach((count, id) => {
    totalEarliness.set(id, (totalEarliness.get(id) || 0) + count);
  });
  firstVoteCounts.forEach((count, id) => {
    totalEarliness.set(id, (totalEarliness.get(id) || 0) + count);
  });

  const eagerRankings = createRankings(totalEarliness, v => `${v}× first`);
  const eagerBeaver = eagerRankings[0];
  awards.push({
    id: 'eager-beaver',
    name: 'The Eager Beaver',
    description: 'Consistently submits or votes first in rounds',
    winner: eagerBeaver?.competitor || null,
    value: eagerBeaver ? `${eagerBeaver.value} times first` : '0',
    icon: 'zap',
    rankings: eagerRankings,
    metricLabel: 'Times First',
    sortOrder: 'desc'
  });

  return awards;
}
