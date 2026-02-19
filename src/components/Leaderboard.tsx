import { Crown, Medal, Trophy, TrendingUp, Award } from "lucide-react";
import { calculateLeaderboard } from "@/lib/parseData";

const Leaderboard = () => {
  const leaderboard = calculateLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-gold" />;
      case 2:
        return <Medal className="w-5 h-5 text-silver" />;
      case 3:
        return <Medal className="w-5 h-5 text-bronze" />;
      default:
        return (
          <span className="w-5 h-5 flex items-center justify-center text-sm text-muted-foreground font-mono">
            {rank}
          </span>
        );
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gold/10 border-gold/30 glow-gold";
      case 2:
        return "bg-silver/5 border-silver/20";
      case 3:
        return "bg-bronze/5 border-bronze/20";
      default:
        return "bg-card border-border/50";
    }
  };

  return (
    <div className="gradient-card rounded-xl border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-foreground">Leaderboard</h2>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {leaderboard.map((entry, index) => {
          const rank = index + 1;
          return (
            <div
              key={entry.competitor.id}
              className={`flex items-center gap-4 p-4 transition-all duration-300 hover:bg-muted/30 ${getRankStyle(rank)} animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Rank */}
              <div className="flex-shrink-0 w-8 flex justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar & Name */}
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${rank === 1 ? 'text-gradient-gold' : 'text-foreground'}`}>
                  {entry.competitor.name}
                </p>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Trophy className="w-3 h-3 text-gold" />
                    {entry.wins} wins
                  </span>
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3 text-primary" />
                    {entry.topThreeFinishes} podiums
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-right">
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">Avg</p>
                  <p className="text-sm font-mono text-foreground">
                    {entry.averagePoints.toFixed(1)}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs text-muted-foreground">Rounds</p>
                  <p className="text-sm font-mono text-foreground">
                    {entry.roundsPlayed}
                  </p>
                </div>
                <div className="min-w-[60px]">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className={`text-lg font-bold font-mono ${rank === 1 ? 'text-gradient-gold' : rank <= 3 ? 'text-primary' : 'text-foreground'}`}>
                    {entry.totalPoints}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
