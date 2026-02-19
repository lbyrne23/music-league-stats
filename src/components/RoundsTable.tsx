import { useState } from "react";
import { Music, ExternalLink, ChevronDown, ChevronUp, Crown } from "lucide-react";
import { getRoundResults, RoundResult } from "@/lib/parseData";

const RoundsTable = () => {
  const roundResults = getRoundResults();
  const [expandedRound, setExpandedRound] = useState<string | null>(null);

  const toggleRound = (roundId: string) => {
    setExpandedRound(expandedRound === roundId ? null : roundId);
  };

  return (
    <div className="gradient-card rounded-xl border border-border/50 overflow-hidden">
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <Music className="w-6 h-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">Rounds</h2>
        </div>
      </div>

      <div className="divide-y divide-border/30">
        {roundResults.map((result, index) => (
          <RoundRow 
            key={result.round.id}
            result={result}
            index={index}
            isExpanded={expandedRound === result.round.id}
            onToggle={() => toggleRound(result.round.id)}
          />
        ))}
      </div>
    </div>
  );
};

interface RoundRowProps {
  result: RoundResult;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const RoundRow = ({ result, index, isExpanded, onToggle }: RoundRowProps) => {
  const winner = result.standings[0];
  const hasStandings = result.standings.length > 0;

  return (
    <div
      className="animate-fade-in"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      {/* Round Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-primary">{index + 1}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">
            {result.round.name}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {result.round.description}
          </p>
        </div>

        {hasStandings && winner && (
          <div className="hidden sm:flex items-center gap-2 text-right">
            <Crown className="w-4 h-4 text-gold" />
            <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
              {winner.competitor.name}
            </span>
            <span className="text-sm font-mono text-primary">
              {winner.points}pts
            </span>
          </div>
        )}

        <a
          href={result.round.playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-2 rounded-lg hover:bg-primary/20 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-primary" />
        </a>

        {hasStandings && (
          isExpanded ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          )
        )}
      </button>

      {/* Expanded Standings */}
      {isExpanded && hasStandings && (
        <div className="bg-muted/20 border-t border-border/30">
          <div className="p-4 space-y-2">
            {result.standings.map((standing, standingIndex) => (
              <div
                key={standing.competitor.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
              >
                <span className={`w-6 text-center font-mono text-sm ${
                  standingIndex === 0 ? 'text-gold' : 
                  standingIndex === 1 ? 'text-silver' : 
                  standingIndex === 2 ? 'text-bronze' : 
                  'text-muted-foreground'
                }`}>
                  {standingIndex + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {standing.competitor.name}
                  </p>
                  {standing.submission && (
                    <p className="text-xs text-muted-foreground truncate">
                      {standing.submission.title} — {standing.submission.artists}
                    </p>
                  )}
                </div>
                <span className={`font-mono text-sm font-semibold ${
                  standingIndex === 0 ? 'text-gold' : 'text-foreground'
                }`}>
                  {standing.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoundsTable;
