import { useState } from "react";
import { 
  Trophy, Crown, Star, Gift, Medal, Skull, Heart, HeartCrack, 
  Swords, ThumbsDown, Target, MessageSquare, TrendingDown, TrendingUp,
  Moon, AlarmClockOff, Zap,
  LucideIcon
} from "lucide-react";
import { Award } from "@/lib/calculateAwards";
import AwardRankingsDialog from "./AwardRankingsDialog";

const iconMap: Record<string, LucideIcon> = {
  'trophy': Trophy,
  'crown': Crown,
  'star': Star,
  'gift': Gift,
  'medal': Medal,
  'skull': Skull,
  'heart': Heart,
  'heart-crack': HeartCrack,
  'swords': Swords,
  'thumbs-down': ThumbsDown,
  'target': Target,
  'message-square': MessageSquare,
  'trending-down': TrendingDown,
  'trending-up': TrendingUp,
  'moon': Moon,
  'alarm-clock-off': AlarmClockOff,
  'zap': Zap,
};

interface AwardCardProps {
  award: Award;
  index: number;
}

const AwardCard = ({ award, index }: AwardCardProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const Icon = iconMap[award.icon] || Trophy;
  
  const getGradient = (id: string) => {
    const gradients: Record<string, string> = {
      'overall-winner': 'from-gold/20 to-gold/5 border-gold/30',
      'most-wins': 'from-primary/20 to-primary/5 border-primary/30',
      'octopus': 'from-accent/20 to-accent/5 border-accent/30',
      'generous-octopus': 'from-pink-500/20 to-pink-500/5 border-pink-500/30',
      'close-shaver': 'from-silver/20 to-silver/5 border-silver/30',
      'public-enemy': 'from-red-500/20 to-red-500/5 border-red-500/30',
      'best-buddies': 'from-rose-500/20 to-rose-500/5 border-rose-500/30',
      'one-sided-love': 'from-purple-500/20 to-purple-500/5 border-purple-500/30',
      'sworn-enemies': 'from-orange-500/20 to-orange-500/5 border-orange-500/30',
      'contrarian': 'from-cyan-500/20 to-cyan-500/5 border-cyan-500/30',
      'most-consistent': 'from-emerald-500/20 to-emerald-500/5 border-emerald-500/30',
      'narrator': 'from-blue-500/20 to-blue-500/5 border-blue-500/30',
      'fall-from-grace': 'from-slate-500/20 to-slate-500/5 border-slate-500/30',
      'redemption-arc': 'from-amber-500/20 to-amber-500/5 border-amber-500/30',
      'night-owl': 'from-indigo-500/20 to-indigo-500/5 border-indigo-500/30',
      'dunce': 'from-yellow-600/20 to-yellow-600/5 border-yellow-600/30',
      'eager-beaver': 'from-lime-500/20 to-lime-500/5 border-lime-500/30',
    };
    return gradients[id] || 'from-muted/20 to-muted/5 border-border/30';
  };

  const getIconColor = (id: string) => {
    const colors: Record<string, string> = {
      'overall-winner': 'text-gold',
      'most-wins': 'text-primary',
      'octopus': 'text-accent',
      'generous-octopus': 'text-pink-500',
      'close-shaver': 'text-silver',
      'public-enemy': 'text-red-500',
      'best-buddies': 'text-rose-500',
      'one-sided-love': 'text-purple-500',
      'sworn-enemies': 'text-orange-500',
      'contrarian': 'text-cyan-500',
      'most-consistent': 'text-emerald-500',
      'narrator': 'text-blue-500',
      'fall-from-grace': 'text-slate-400',
      'redemption-arc': 'text-amber-500',
      'night-owl': 'text-indigo-500',
      'dunce': 'text-yellow-600',
      'eager-beaver': 'text-lime-500',
    };
    return colors[id] || 'text-muted-foreground';
  };

  return (
    <>
      <div
        onClick={() => setDialogOpen(true)}
        className={`relative overflow-hidden rounded-xl border bg-gradient-to-br ${getGradient(award.id)} p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg animate-fade-in cursor-pointer`}
        style={{ animationDelay: `${index * 50}ms` }}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-xl bg-card/50 flex items-center justify-center mb-4 ${award.id === 'overall-winner' ? 'glow-gold' : ''}`}>
          <Icon className={`w-6 h-6 ${getIconColor(award.id)}`} />
        </div>

        {/* Award Name */}
        <h3 className="text-lg font-bold text-foreground mb-1">
          {award.name}
        </h3>
        
        {/* Description */}
        <p className="text-xs text-muted-foreground mb-4">
          {award.description}
        </p>

        {/* Winner */}
        <div className="space-y-2">
          {award.winner ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  {award.winner.name}
                </span>
                {award.winnerSecondary && (
                  <>
                    <span className="text-muted-foreground">&</span>
                    <span className="text-sm font-semibold text-foreground">
                      {award.winnerSecondary.name}
                    </span>
                  </>
                )}
              </div>
              <div className={`text-sm font-mono ${getIconColor(award.id)}`}>
                {award.value}
              </div>
            </>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No data available
            </span>
          )}
        </div>

        {/* Click hint */}
        <div className="absolute bottom-2 right-2 text-xs text-muted-foreground/50">
          Click for rankings
        </div>
      </div>

      <AwardRankingsDialog 
        award={award} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
    </>
  );
};

export default AwardCard;
